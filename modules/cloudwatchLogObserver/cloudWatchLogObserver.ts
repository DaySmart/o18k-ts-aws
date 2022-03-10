import { getDefaultLogger } from '../../util/getDefaultLogger';
import { Template } from '../../interfaces/template/Template';
import { CloudWatchLogObserverModule } from './CloudWatchLogObserverModule';

import { gunzipSync } from 'zlib';

export async function cloudWatchLogObserver(event, context, template: Template) {
    context.callbackWaitsForEmptyEventLoop = true;

    const defaultLogger = getDefaultLogger(template);
    defaultLogger.Log('[CloudWatchObserverObserver.request]', { event, context });

    const data = event.awslogs.data;
    const buffer = Buffer.from(data, 'base64');
    const payload = gunzipSync(buffer).toString('ascii');
    console.log('payload', payload);
    const message = JSON.parse(payload);

    const cell: CloudWatchLogObserverModule = getCloudWatchLogObserverCell(message, template);

    const observations = cell.handle(message, context);
    const observationNames = !observations.length ? 'none' : observations.map((o) => o.entity + ':' + o.type).join(', ');
    cell.logger.info(`[CloudWatchObserverObserver.observations] ${observationNames}`, { observations });

    if (observations) {
        if (cell.saveToRepository) {
            await cell.repository.save(observations);
        } else {
            cell.logger.info(`[CloudWatchObserverObserver.skipSave] ${observationNames}`, { observations });
        }
        await cell.router.SendToRouter(template, observations);
    }

    const response = { statusCode: 202 };
    cell.logger.info('[CloudWatchObserverObserver.response] response', { response });
    return response;
}

function getCloudWatchLogObserverCell(message, template: Template): CloudWatchLogObserverModule {
    const logGroup = message.logGroup as string;
    for (let i = 0; i < template.externalEntities.length; i++) {
        for (let j = 0; j < template.externalEntities[i].observers.length; j++) {
            const current = template.externalEntities[i].observers[j];
            if (logGroup && logGroup.indexOf(current.logGroupMatch) > -1) {
                return current.cell as CloudWatchLogObserverModule;
            }
        }
    }

    throw new Error('Observer cell not found for logGroup: ' + logGroup);
}
