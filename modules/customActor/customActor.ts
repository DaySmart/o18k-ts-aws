import { Context } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { Template } from '../../interfaces/template/Template';
import { getDefaultLogger } from '../../util/getDefaultLogger';
import { getCustomResponseObserverCell } from '../customResponseObserver/CustomResponseObserver';
import { CustomResponseObserverModule } from '../customResponseObserver/CustomResponseObserverModule';
// import { retrieveSecrets } from "../parameterStoreContext/ParameterStore";
import { CustomActorModule, getCustomActorCell } from './CustomActorModule';
import { sendToQueue } from '../../util/sendToQueue';

export async function customActor(event, context, template: Template) {
    const defaultLogger = getDefaultLogger(template);
    defaultLogger.Log('[CustomActionModule] request', { event, context });

    let isInvokedFromQueue = false;
    if (event.Records) {
        event = JSON.parse(event.Records[0].body);
        isInvokedFromQueue = true;
    }

    const cell: CustomActorModule = getCustomActorCell(template, event);

    if (!isInvokedFromQueue && cell.throttle) {
        const resp = await sendToQueue(cell.throttle, event);
        cell.logger.Log('[CustomActionModule] sendToQueue.resp', { resp });
        return { statusCode: 200 };
    }

    const observation: Observation2<IEntityObservation> = event.observation;
    const dependentObservations = await cell.repository.load(event.observation, cell.queries);
    const handlerContext: Context = {
        // ...(await retrieveSecrets()),
        time: new Date(),
    };

    const logNote = `${cell.name} handling ${observation.entity}:${observation.type}`;
    cell.logger.info(`[CustomActionModule.parameters] ${logNote} `, { observation, dependentObservations, handlerContext });

    const response: any = await cell.handle(event.observation, dependentObservations, handlerContext);
    cell.logger.info(`[CustomActionModule.response] ${logNote}`, { response });

    if (response) {
        const observerCell: CustomResponseObserverModule = getCustomResponseObserverCell(template, cell.name);
        if (observerCell) {
            const observerCellObservations: Observation2<IEntityObservation>[] = observerCell.handle(event.observation, response);
            const observerLogNote = !observerCellObservations.length
                ? 'none'
                : observerCellObservations.map((o) => o.entity + ':' + o.type).join(', ');
            cell.logger.info(`[CustomActionModule.observations] ${observerLogNote}`, { observerCellObservations });
            if (observerCell.saveToRepository) {
                await observerCell.repository.save(observerCellObservations);
            } else {
                cell.logger.info(`[CustomActionModule.skipSave] ${observerLogNote}`, { observerCellObservations });
            }
            await observerCell.router.SendToRouter(template, observerCellObservations);
        }
    }

    if (process.env.LOCAL_TESTING != 'false') {
        return response;
    }
    return { statusCode: 200 };
}
