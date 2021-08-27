import { AxiosRequestConfig } from 'axios';
import { Context } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';

export type HttpAxiosActorHandle<T extends IEntityObservation> = (
    observation: Observation2<T>,
    dependentObservations: any,
    context: Context
) => AxiosRequestConfig[];
