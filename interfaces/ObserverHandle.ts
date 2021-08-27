import { IEntityObservation } from './IEntityObservation';
import { Observation2 } from './Observation2';

export type ObserverHandle<T extends IEntityObservation> = (input: any) => Observation2<T>[];
