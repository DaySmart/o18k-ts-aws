import { HttpAxiosActorAuth } from './HttpAxiosActorAuth';
import { HttpAxiosActorThrottle } from './HttpAxiosActorThrottle';
import { HttpAxiosActorHandle } from './HttpAxiosActorHandle';
import { Actor, Logger, Query, Repository, Router } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { ContextHandle } from '../../interfaces/ContextHandle';
import { Observation2 } from '../../interfaces/Observation2';
import { sendAsyncLambda } from '../../util/sendAsyncLambda';

export class HttpAxiosActorModule implements Actor {
    constructor(
        public name: string,
        public handle: HttpAxiosActorHandle<IEntityObservation>,
        public queries: Query[],
        public throttle: HttpAxiosActorThrottle = null,
        public auth: HttpAxiosActorAuth = null,
        public saveToRepository = true
    ) {}
    public logger: Logger;
    public functionName: string;
    public repository: Repository;
    public router: Router;
    public contextHandles: ContextHandle[];

    async SendToCell(observation: Observation2<IEntityObservation>, meta: any) {
        this.logger.Log(`[HttpAxiosActorModule.SendToCell.receive] ${observation.entity}:${observation.type} to ${this.name}`, {
            observation,
            meta,
            functionName: this.functionName,
            actorName: this.name,
        });
        const message = {
            observation,
            meta: {
                ...meta,
                name: this.name,
            },
        };
        const response = await sendAsyncLambda(this.functionName, message);
        this.logger.Log(`[HttpAxiosActorModule.SendToCell.response] ${observation.entity}:${observation.type} to ${this.name}`, {
            response,
        });
        return;
    }

    public generate() {
        return;
    }
}
