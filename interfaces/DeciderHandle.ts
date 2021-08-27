import { Context } from './Base';
import { IEntityObservation } from './IEntityObservation';
import { Observation2 } from './Observation2';

export type DeciderHandle<T extends IEntityObservation> = (
    observation: Observation2<T>,
    dependentObservations: any,
    context: Context
) => Observation2<T>[];
