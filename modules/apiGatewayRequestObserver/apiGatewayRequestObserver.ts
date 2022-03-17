import { getDefaultLogger } from '../../util/getDefaultLogger';
import { Context } from '../../interfaces/Base';
// import { retrieveSecrets } from "../parameterStoreContext/ParameterStore";
import { ApiGatewayRequestObserverModule } from './ApiGatewayRequestObserverModule';
import { Template } from '../../interfaces/template/Template';
import {
    ApiGatewayRequestResponseActorModule,
    APIGatewayResponse,
} from '../apiGatewayRequestResponseActor/ApiGatewayRequestResponseActorModule';
import { getApiGatewayRequestResponseActorCell } from '../apiGatewayRequestResponseActor/getApiGatewayRequestResponseActorCell';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';

export async function apiGatewayRequestObserver(event, context, template: Template) {
    context.callbackWaitsForEmptyEventLoop = true;

    const defaultLogger = getDefaultLogger(template);
    defaultLogger.Log('[ApiGatewayHttpObserver.request]', { event, context });

    const cell: ApiGatewayRequestObserverModule = getApiGatewayRequestObserverCell(event, template);
    cell.logger.info(`[ApiGatewayHttpObserver.cell]`, { cell });

    let observations: Observation2<IEntityObservation>[];
    try {
        observations = cell.handle(event, context);
    } catch (err) {
        const errorMessage = err['message'] ? err['message'] : err;
        cell.logger.info(`[ApiGatewayHttpObserver.handlerError]`, { errorMessage, stacktrace: err['stack'] });
        return {
            statusCode: 400,
            body: JSON.stringify(errorMessage),
            isBase64Encoded: false,
        };
    }

    const observationNames = !observations.length ? 'none' : observations.map((o) => o.entity + ':' + o.type).join(', ');
    cell.logger.info(`[ApiGatewayHttpObserver.observations] ${observationNames}`, { observations });

    if (observations) {
        if (cell.saveToRepository) {
            await cell.repository.save(observations);
        } else {
            cell.logger.info(`[ApiGatewayHttpObserver.skipSave] ${observationNames}`, { observations });
        }
        await cell.router.SendToRouter(template, observations);

        //current state: if multiple observations and is a query, then error

        const actorCell: ApiGatewayRequestResponseActorModule = getApiGatewayRequestResponseActorCell(template, observations[0]);
        if (actorCell) {
            if (observations.length > 1) throw new Error('Multiple observations cannot be created during a query.');

            const dependentObservations = await actorCell.repository.load(observations[0], actorCell.queries);

            //TODO: replace with context
            const handlerContext: Context = {
                // ...(await retrieveSecrets()),
                time: new Date(),
            };

            actorCell.logger.info(
                `[ApiGatewayRequestResponseActorModule.parameters] ${actorCell.name} handling ${observations[0].entity}:${observations[0].type}`,
                {
                    observation: observations[0],
                    dependentObservations,
                    handlerContext,
                }
            );

            const response: APIGatewayResponse = actorCell.handle(observations[0], dependentObservations, handlerContext);
            actorCell.logger.info(
                `[ApiGatewayRequestResponseActorModule.response] ${actorCell.name} handling ${observations[0].entity}:${observations[0].type}`,
                {
                    response,
                }
            );
            return response;
        }
    }

    const response = { statusCode: 202 };
    cell.logger.info('[ApiGatewayHttpObserver.response] response', { response });
    return response;
}

function getApiGatewayRequestObserverCell(event, template: Template): ApiGatewayRequestObserverModule {
    const path = event.pathParameters && event.pathParameters.proxy ? event.pathParameters.proxy : event.path;
    const method = event.httpMethod;
    for (let i = 0; i < template.externalEntities.length; i++) {
        for (let j = 0; j < template.externalEntities[i].observers.length; j++) {
            const current = template.externalEntities[i].observers[j];
            if (current.path === path && current.method === method) {
                return current.cell as ApiGatewayRequestObserverModule;
            }
        }
    }

    throw new Error('Observer cell not found');
}
