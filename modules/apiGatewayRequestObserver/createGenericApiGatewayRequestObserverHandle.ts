import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { createExistingObservation, generateTraceId } from '../../interfaces/Observation2';
import { ApiGatewayRequestObserverHandle } from './ApiGatewayRequestObserverModule';

export function createGenericApiGatewayRequestObserverHandle<T extends IEntityObservation>(
    c: new (data) => T
): ApiGatewayRequestObserverHandle<T> {
    const handle = (event, _context) => {
        const data = JSON.parse(event.body);

        const entity = new c(data);
        const time = new Date(event.requestContext.requestTimeEpoch).toISOString();

        return [
            //TODO: Check if these values are passed over in the http request
            createExistingObservation(entity, generateTraceId(), time, '0.1', 'observer', 'observerid'),
        ];
    };

    return handle;
}
