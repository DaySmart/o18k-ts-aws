import { Actor, Logger, Query, Repository, Router } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { AppSyncRequestResponseActorHandle } from './AppSyncRequestResponseActorHandle';

export class AppSyncRequestResponseActorModule implements Actor {
    constructor(
        public name: string,
        public handle: AppSyncRequestResponseActorHandle<IEntityObservation>,
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

export const APPSYNC_REQUEST_RESPONSE_ACTOR_MODULE = 'AppSyncRequestResponseActor';
