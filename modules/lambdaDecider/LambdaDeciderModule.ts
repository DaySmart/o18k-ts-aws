import { LambdaDeciderModuleRoutingMessage } from '../lambdaDecider/lambdaDecider';
import { Decider, Logger, Query, Repository, Router } from '../../interfaces/Base';
import { DeciderHandle } from '../../interfaces/DeciderHandle';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { sendAsyncLambda } from '../../util/sendAsyncLambda';

export class LambdaDeciderModule implements Decider {
    constructor(
        public entity: string,
        public type: string,
        public outgoingEntity: string,
        public outgoingType: string,
        public queries: Query[],
        public handle: DeciderHandle<IEntityObservation>,
        public saveToRepository = true
    ) {}
    public router: Router;
    public logger: Logger;
    public repository: Repository;
    public functionName: string;

    //how does the router send to me
    async SendToCell(observation: Observation2<IEntityObservation>, meta: any) {
        this.logger.Log(
            `[LambdaDeciderModule.SendToCell.receive] ${observation.entity}:${observation.type} to ${this.outgoingEntity}:${this.outgoingType}`,
            {
                observation,
                meta,
                functionName: this.functionName,
                outgoingEntity: this.outgoingEntity,
                outgoingType: this.outgoingType,
            }
        );
        const message: LambdaDeciderModuleRoutingMessage = {
            observation,
            meta: {
                ...meta,
                outgoingEntity: this.outgoingEntity,
                outgoingType: this.outgoingType,
            },
        };
        const response = await sendAsyncLambda(this.functionName, message);
        this.logger.Log(
            `[LambdaDeciderModule.SendToCell.response] ${observation.entity}:${observation.type} to ${this.outgoingEntity}:${this.outgoingType}`,
            { response }
        );
        return;
    }

    public generate() {
        return;
    }
}
