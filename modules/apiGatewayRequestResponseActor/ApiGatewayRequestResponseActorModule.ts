import { Actor, Logger, Query, Repository, Router } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { ApiGatewayRequestResponseActorHandle } from './ApiGatewayRequestResponseActorHandle';

export class ApiGatewayRequestResponseActorModule implements Actor {
    constructor(
        public name: string,
        public handle: ApiGatewayRequestResponseActorHandle<IEntityObservation>,
        public queries: Query[],
        public saveToRepository = true
    ) {}
    public logger: Logger;
    public functionName: string;
    public repository: Repository;
    public router: Router;

    async SendToCell(_observation: Observation2<IEntityObservation>, _meta: any) {}

    public generate() {
        return;
    }
}

export interface APIGatewayResponse {
    statusCode: 200 | 400 | 500;
    body?: string;
}

export const APIGATEWAY_REQUEST_RESPONSE_ACTOR_MODULE = 'ApiGatewayRequestResponseActor';
