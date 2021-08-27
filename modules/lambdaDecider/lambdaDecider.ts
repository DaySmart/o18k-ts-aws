import { Context } from '../../interfaces/Base';
import { Entity } from '../../interfaces/Entity';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { Template } from '../../interfaces/template/Template';
import { getDefaultLogger } from '../../util/getDefaultLogger';
import { getTemplateEntity } from '../../util/getTemplateEntity';
// import { retrieveSecrets } from "../parameterStoreContext/ParameterStore";
import { LambdaDeciderModule } from './LambdaDeciderModule';

export async function lambdaDecider(event, context, template: Template): Promise<any> {
    context.callbackWaitsForEmptyEventLoop = true;

    const defaultLogger = getDefaultLogger(template);
    defaultLogger.Log('[LambdaDecider.request]', { event, context });

    const cell: LambdaDeciderModule = getLambdaDeciderCell(event, template);

    const dependentObservations = await cell.repository.load(event.observation, cell.queries);

    //TODO: replace with context
    const handlerContext: Context = {
        // ...(await retrieveSecrets()),
        time: new Date(),
    };

    defaultLogger.info(
        `[LambdaDecider.parameters] deciding ${cell.outgoingEntity}:${cell.outgoingType} handling ${event.observation.entity}:${event.observation.type}`,
        { observation: event.observation, dependentObservations, handlerContext }
    );

    const outgoingObservations = cell.handle(event.observation, dependentObservations, handlerContext);

    outgoingObservations.forEach((observation, i) => {
        cell.logger.info(
            `[LambdaDecider.decisions] index:${i} deciding ${cell.outgoingEntity}:${cell.outgoingType} handling ${event.observation.entity}:${event.observation.type}`,
            { observation }
        );
    });

    if (outgoingObservations.length) {
        if (cell.saveToRepository) {
            await cell.repository.save(outgoingObservations);
        } else {
            cell.logger.info(
                `[LambdaDecider.skipSave] count:${outgoingObservations.length} deciding ${cell.outgoingEntity}:${cell.outgoingType} handling ${event.observation.entity}:${event.observation.type}`,
                { outgoingObservations }
            );
        }

        const result = await cell.router.SendToRouter(template, outgoingObservations);
        if (process.env.LOCAL_TESTING != 'false') {
            return result;
        }
    }

    return;
}

export function getLambdaDeciderCell(event, template: Template): LambdaDeciderModule {
    const message = event as LambdaDeciderModuleRoutingMessage;
    const templateEntity: Entity = getTemplateEntity(template, message.observation.entity, message.observation.type);
    const wrapper = templateEntity.deciderCellsThatCareAboutMe.find(
        (wrapper) => wrapper.entity === message.meta.outgoingEntity && wrapper.type === message.meta.outgoingType
    );
    return wrapper.cell as LambdaDeciderModule;
}

export interface LambdaDeciderModuleRoutingMessage {
    observation: Observation2<IEntityObservation>;
    meta: {
        [key: string]: string;
        outgoingEntity: string;
        outgoingType: string;
    };
}
