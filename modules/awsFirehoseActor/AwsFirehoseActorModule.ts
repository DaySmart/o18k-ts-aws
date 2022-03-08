import { AwsFirehoseActorHandle } from './AwsFirehoseActorHandle';
import { Actor, Logger, Query, Repository, Router } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { ContextHandle } from '../../interfaces/ContextHandle';
import { Observation2 } from '../../interfaces/Observation2';
import { sendAsyncLambda } from '../../util/sendAsyncLambda';

export class AwsFirehoseActorModule implements Actor {
    constructor(
        public name: string,
        public queries: Query[],
		public deliveryStreamName: string,
        public handle?: AwsFirehoseActorHandle<IEntityObservation>
    ) {}
    public logger: Logger;
    public functionName: string;
    public repository: Repository;
    public router: Router;
    public contextHandles: ContextHandle[];

    async SendToCell(observation: Observation2<IEntityObservation>, meta: any) {
        this.logger.Log(`[AwsFirehoseActorModule.SendToCell.receive] ${observation.entity}:${observation.type} to ${this.name}`, {
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
        this.logger.Log(`[AwsFirehoseActorModule.SendToCell.response] ${observation.entity}:${observation.type} to ${this.name}`, {
            response,
        });
        return;
    }

    public generate() {
        return;
    }
}
