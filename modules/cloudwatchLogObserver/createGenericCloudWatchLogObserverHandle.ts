import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { createExistingObservation, generateTraceId } from '../../interfaces/Observation2';
import { CloudWatchLogObserverHandle } from './CloudWatchLogObserverModule';

export default function createGenericCloudWatchLogObserverHandle<T extends IEntityObservation>(
    c: new (data) => T
): CloudWatchLogObserverHandle<T> {
    const handle = (message, _context) => {
        const observations = [];
        const time = new Date().toISOString();

        console.log('message', message);

        for (const logEvent of message.logEvents) {
            const entity = new c({
                CloudWatchGroupName: message.logGroup,
                JobRunGuid: message.logStream.split('/')[0],
                CloudWatchLogStream: message.logStream,
                Message: logEvent.message,
            });

            observations.push(createExistingObservation(entity, generateTraceId(), time, '0.1', entity.entity, 'sometypeofinstanceid'));
        }

        return observations;
    };

    return handle;
}
