import { Context } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { APIGatewayResponse } from './ApiGatewayRequestResponseActorModule';

export type ApiGatewayRequestResponseActorHandle<T extends IEntityObservation> = (
    observation: Observation2<T>,
    dependentObservations: any,
    context: Context
) => APIGatewayResponse;
