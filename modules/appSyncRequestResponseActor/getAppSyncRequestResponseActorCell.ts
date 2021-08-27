import { Entity } from '../../interfaces/Entity';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { Template } from '../../interfaces/template/Template';
import { getTemplateEntity } from '../../util/getTemplateEntity';
import { AppSyncRequestResponseActorModule, APPSYNC_REQUEST_RESPONSE_ACTOR_MODULE } from './AppSyncRequestResponseActorModule';

export function getAppSyncRequestResponseActorCell(
    template: Template,
    observation: Observation2<IEntityObservation>
): AppSyncRequestResponseActorModule {
    const templateEntity: Entity = getTemplateEntity(template, observation.entity, observation.type);
    if (!templateEntity.actorCellsThatCareAboutMe) {
        return null;
    }
    const wrapper = templateEntity.actorCellsThatCareAboutMe.find((wrapper) => wrapper.module === APPSYNC_REQUEST_RESPONSE_ACTOR_MODULE);
    if (!wrapper || !wrapper.cell) {
        return null;
    }
    // if (!wrapper) throw new Error(`No ${HTTP_REQUEST_RESPONSE_ACTOR_MODULE} found for ${observation.entity} ${observation.type}`);
    return wrapper.cell as AppSyncRequestResponseActorModule;
}
