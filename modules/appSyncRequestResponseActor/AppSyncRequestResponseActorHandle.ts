import { Context } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';

export type AppSyncRequestResponseActorHandle<T extends IEntityObservation> = (
    observation: Observation2<T>,
    dependentObservations: any,
    context: Context
) => any;
