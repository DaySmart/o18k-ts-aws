import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';

export interface HttpAxiosActorModuleRoutingMessage {
    observation: Observation2<IEntityObservation>;
    meta: {
        [key: string]: string;
        name: string;
    };
}
