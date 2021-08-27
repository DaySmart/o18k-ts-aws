import { Actor, Context, Logger, Query, Repository, Router } from '../../interfaces/Base';
import { Entity } from '../../interfaces/Entity';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { getTemplateEntity } from '../../util/getTemplateEntity';
import { sendAsyncLambda } from '../../util/sendAsyncLambda';
import { Throttle } from '../../util/sendToQueue';

export class CustomActorModule implements Actor {
    constructor(
        public name: string,
        public handle: CustomActorHandle<IEntityObservation>,
        public queries: Query[],
        public throttle: Throttle | null = null,
        public saveToRepository = true
    ) {}
    public logger: Logger;
    public functionName: string;
    public repository: Repository;
    public router: Router;

    async SendToCell(observation: Observation2<IEntityObservation>, meta: any) {
        const message = {
            observation,
            meta: {
                ...meta,
                name: this.name,
            },
        };
        await sendAsyncLambda(this.functionName, message);
        return;
    }

    public generate() {
        return;
    }
}

export function getCustomActorCell(template, event): CustomActorModule {
    const message = event as CustomActorModuleRoutingMessage;
    const templateEntity: Entity = getTemplateEntity(template, message.observation.entity, message.observation.type);
    const wrapper = templateEntity.actorCellsThatCareAboutMe.find(
        (wrapper) => wrapper.name === message.meta.name && wrapper.module === CUSTOM_ACTOR_MODULE
    );
    return wrapper.cell as CustomActorModule;
}

export interface CustomActorModuleRoutingMessage {
    observation: Observation2<IEntityObservation>;
    meta: {
        [key: string]: string;
        name: string;
    };
}

export const CUSTOM_ACTOR_MODULE = 'CustomActorModule';

export type CustomActorHandle<T extends IEntityObservation> = (
    observation: Observation2<T>,
    dependentObservations: any,
    context: Context
) => Promise<any>;
