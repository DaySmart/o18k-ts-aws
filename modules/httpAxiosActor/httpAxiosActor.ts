import { AxiosRequestConfig, AxiosResponse, default as axios } from 'axios';
import { HttpAxiosActorModule } from './HttpAxiosActorModule';
import FormData from 'form-data';
import { getDefaultLogger } from '../../util/getDefaultLogger';
import { Context } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Template } from '../../interfaces/template/Template';
import { getHttpAxiosActorCell } from './getHttpAxiosActorCell';
import { Observation2 } from '../../interfaces/Observation2';
import { sendToQueue } from '../../util/sendToQueue';
import {
    getHttpAxiosResponseObserverCell,
    HttpAxiosResponseObserverModule,
} from '../httpAxiosResponseObserver/HttpAxiosResponseObserverModule';

export const HTTP_AXIOS_ACTOR_MODULE = 'HttpAxiosActorModule';

export async function httpAxiosActor(event: any, context: any, template: Template) {
    const defaultLogger = getDefaultLogger(template);
    defaultLogger.Log('[HttpAxiosActorModule] request', { event, context });

    let isInvokedFromQueue = false;
    if (event.Records) {
        event = JSON.parse(event.Records[0].body);
        isInvokedFromQueue = true;
    }

    const cell: HttpAxiosActorModule = getHttpAxiosActorCell(event, template);
    const responseObserverCell: HttpAxiosResponseObserverModule = getHttpAxiosResponseObserverCell(cell.name, template);

    if (!isInvokedFromQueue && cell.throttle) {
        let resp = await sendToQueue(cell.throttle, event);
        cell.logger.Log('[HttpAxiosActorModule] sendToQueue.resp', { resp });
        return { statusCode: 200 };
    }

    const observation: Observation2<IEntityObservation> = event.observation;
    const dependentObservations = await cell.repository.load(observation, cell.queries);

    let currentTime = new Date();
    let handlerContext: Context = { time: currentTime };
    if (cell.contextHandles) {
        cell.logger.Log('[HttpAxiosActorModule] cell', { cell: JSON.stringify(cell.contextHandles) });

        const cellContextResponses = await Promise.all(cell.contextHandles.map((f) => f()));
        cell.logger.Log('[HttpAxiosActorModule] cellContextResponse', { cellContextResponses });
        cellContextResponses.forEach((response) => {
            handlerContext = {
                time: currentTime,
                ...handlerContext,
                ...response,
            };
        });
    }

    const logNote = `${cell.name} handling ${observation.entity}:${observation.type}`;
    cell.logger.Log(`[HttpAxiosActorModule.parameters] ${logNote}`, {
        observation,
        dependentObservations,
        handlerContextKeys: Object.keys(handlerContext).join(', '),
        auth: cell.auth,
    });

    const requests: AxiosRequestConfig[] = cell.handle(observation, dependentObservations, handlerContext);
    cell.logger.Log(`[HttpAxiosActorModule.axiosRequests] count:${requests.length} ${logNote}`, { requests });

    if (requests && requests.length > 0) {
        if (cell.auth && cell.auth.type === 'oauth') {
            const bearerToken = await getOauthBearerToken(handlerContext, cell, logNote);

            requests.forEach((request) => {
                request.headers = {
                    ...request.headers,
                    Authorization: `Bearer ${bearerToken}`,
                };
            });
        } else if (cell.auth && cell.auth.type === 'secret_key') {
            if (!handlerContext[cell.auth.secretKeyContextProperty]) throw new Error(`Context is missing required auth property.`);

            requests.forEach((request) => {
                request.headers = {
                    ...request.headers,
                    secret_key: handlerContext[cell.auth.secretKeyContextProperty],
                    local_datetime: handlerContext.time.toISOString(),
                };
            });
        } else if (cell.auth && cell.auth.type === 'basic_auth') {
            const username = handlerContext[cell.auth.usernameContextProperty];
            const password = handlerContext[cell.auth.passwordContextProperty];
            if (!username || !password) throw new Error(`Context is missing required auth property.`);

            requests.forEach((request) => {
                request.auth = {
                    username,
                    password,
                };
            });
        }

        const responses: AxiosResponse[] = await Promise.all(requests.map((r) => axios.request(r)));
        cell.logger.Log(`[HttpAxiosActorModule.axiosResponses] ${logNote}`, { responses });

        if (responses && responseObserverCell) {
            const observerCellObservations: Observation2<IEntityObservation>[] = responseObserverCell.handle(observation, responses);
            const observerLogNote = !observerCellObservations.length
                ? 'none'
                : observerCellObservations.map((o) => o.entity + ':' + o.type).join(', ');
            cell.logger.Log(`[HttpAxiosResponseObserverModule.observations] ${observerLogNote}`, { observerCellObservations });
            await responseObserverCell.repository.save(observerCellObservations);
            await responseObserverCell.router.SendToRouter(template, observerCellObservations);
            if (process.env.LOCAL_TESTING != 'false') {
                return responses;
            }
        }
    }

    return { statusCode: 200 };
}

async function getOauthBearerToken(context: Context, cell: HttpAxiosActorModule, logNote: string) {
    const authUrl = context[cell.auth.authUrlContextProperty];
    const clientId = context[cell.auth.clientIdContextProperty];
    const clientSecret = context[cell.auth.clientSecretContextProperty];
    const username = context[cell.auth.usernameContextProperty];
    const password = context[cell.auth.passwordContextProperty];
    if (!clientId || !clientSecret || !username || !password) throw new Error(`Context is missing required auth property.`);

    const form = new FormData();
    form.append('grant_type', 'password');
    form.append('client_id', clientId);
    form.append('client_secret', clientSecret);
    form.append('username', username);
    form.append('password', password);

    const headers = {
        ...form.getHeaders(),
        'Content-Length': form.getLengthSync(),
    };

    const authResponse = await axios.post(authUrl, form, { headers });
    cell.logger.Log(`[HttpAxiosActorModule.authResponse] ${logNote}`, { authResponse });
    if (!authResponse || !authResponse.data || !authResponse.data.access_token) throw new Error(`Unable to retrieve access token.`);

    return authResponse.data.access_token;
}
