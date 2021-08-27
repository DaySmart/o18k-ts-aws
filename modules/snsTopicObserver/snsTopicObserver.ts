import { getDefaultLogger } from '../../util/getDefaultLogger';
import { Template } from '../../interfaces/template/Template';
import { SnsTopicObserverModule } from './SnsTopicObserverModule';

export async function snsTopicObserver(event, context, template: Template) {
    context.callbackWaitsForEmptyEventLoop = true;

    const defaultLogger = getDefaultLogger(template);
    defaultLogger.Log('[SnsTopicObserver.request]', { event, context });

    const cell: SnsTopicObserverModule = getSnsTopicObserverCell(event, template);

    const observations = cell.handle(event, context);
    const observationNames = !observations.length ? 'none' : observations.map((o) => o.entity + ':' + o.type).join(', ');
    cell.logger.info(`[SnsTopicObserver.observations] ${observationNames}`, { observations });

    if (observations) {
        if (cell.saveToRepository) {
            await cell.repository.save(observations);
        } else {
            cell.logger.info(`[SnsTopicObserver.skipSave] ${observationNames}`, { observations });
        }
        await cell.router.SendToRouter(template, observations);
    }

    const response = { statusCode: 202 };
    cell.logger.info('[SnsTopicObserver.response] response', { response });
    return response;
}

function getSnsTopicObserverCell(event, template: Template): SnsTopicObserverModule {
    const topicArn = event.Records && event.Records[0] && (event.Records[0].Sns.TopicArn as string);
    for (let i = 0; i < template.externalEntities.length; i++) {
        for (let j = 0; j < template.externalEntities[i].observers.length; j++) {
            const current = template.externalEntities[i].observers[j];
            if (topicArn && topicArn.indexOf(current.topicArnMatch) > -1) {
                return current.cell as SnsTopicObserverModule;
            }
        }
    }

    throw new Error('Observer cell not found');
}
