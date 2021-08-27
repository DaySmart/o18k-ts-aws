import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { createExistingObservation, generateTraceId } from '../../interfaces/Observation2';
import { AppSyncRequestObserverHandle } from './AppSyncRequestObserverModule';

export function createGenericAppSyncRequestObserverHandle<T extends IEntityObservation>(
    c: new (data) => T
): AppSyncRequestObserverHandle<T> {
    const handle = (event, _context) => {
        const data = event.arguments;

        const entity = new c(data);
        const time = new Date().toISOString();

        return [
            //TODO: Check if these values are passed over in the http request
            createExistingObservation(entity, generateTraceId(), time, '0.1', 'observer', 'observerid'),
        ];
    };

    return handle;
}
