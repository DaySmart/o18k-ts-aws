import { getDefaultLogger } from '../../util/getDefaultLogger';
import { Context } from '../../interfaces/Base';
// import { retrieveSecrets } from "../parameterStoreContext/ParameterStore";
import { Template } from '../../interfaces/template/Template';
import { AppSyncRequestObserverModule } from './AppSyncRequestObserverModule';
import { AppSyncRequestResponseActorModule } from '../appSyncRequestResponseActor/AppSyncRequestResponseActorModule';
import { getAppSyncRequestResponseActorCell } from '../appSyncRequestResponseActor/getAppSyncRequestResponseActorCell';

export async function appSyncRequestObserver(event, context, template: Template) {
    const defaultLogger = getDefaultLogger(template);
    defaultLogger.Log('[appSyncRequestObserver.request]', { event, context });

    const cell: AppSyncRequestObserverModule = getAppSyncRequestObserverCell(event, template);

    const observations = cell.handle(event, context);
    const observationNames = !observations.length ? 'none' : observations.map((o) => o.entity + ':' + o.type).join(', ');
    cell.logger.info(`[appSyncRequestObserver.observations] ${observationNames}`, { observations });

    if (observations) {
        if (cell.saveToRepository) {
            await cell.repository.save(observations);
        } else {
            cell.logger.info(`[appSyncRequestObserver.skipSave] ${observationNames}`, { observations });
        }
        await cell.router.SendToRouter(template, observations);

        //current state: if multiple observations and is a query, then error

        const actorCell: AppSyncRequestResponseActorModule = getAppSyncRequestResponseActorCell(template, observations[0]);
        if (actorCell) {
            if (observations.length > 1) throw new Error('Multiple observations cannot be created during a query.');

            const dependentObservations = await actorCell.repository.load(observations[0], actorCell.queries);

            //TODO: replace with context
            const handlerContext: Context = {
                // ...(await retrieveSecrets()),
                time: new Date(),
            };

            actorCell.logger.info(
                `[AppSyncRequestResponseActorModule.parameters] ${actorCell.name} handling ${observations[0].entity}:${observations[0].type}`,
                {
                    observation: observations[0],
                    dependentObservations,
                    handlerContext,
                }
            );

            const response: any = actorCell.handle(observations[0], dependentObservations, handlerContext);
            actorCell.logger.info(
                `[AppSyncRequestResponseActorModule.response] ${actorCell.name} handling ${observations[0].entity}:${observations[0].type}`,
                {
                    response,
                }
            );
            return response;
        }
    }

    const response = true;
    cell.logger.info('[appSyncRequestObserver.response] response', { response });
    return response;
}

function getAppSyncRequestObserverCell(event, template: Template): AppSyncRequestObserverModule {
    const operation = event.info.fieldName;
    for (let i = 0; i < template.externalEntities.length; i++) {
        for (let j = 0; j < template.externalEntities[i].observers.length; j++) {
            const current = template.externalEntities[i].observers[j];
            if (current.operation && current.operation === operation) {
                return current.cell as AppSyncRequestObserverModule;
            }
        }
    }

    throw new Error('Observer cell not found for operation: ' + operation);
}
