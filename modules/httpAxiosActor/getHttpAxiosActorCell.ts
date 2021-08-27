import { Entity } from '../../interfaces/Entity';
import { getTemplateEntity } from '../../util/getTemplateEntity';
import { HttpAxiosActorModule } from './HttpAxiosActorModule';
import { HttpAxiosActorModuleRoutingMessage } from './HttpAxiosActorModuleRoutingMessage';
import { Template } from '../../interfaces/template/Template';
import { HTTP_AXIOS_ACTOR_MODULE } from './httpAxiosActor';

export function getHttpAxiosActorCell(event, template: Template): HttpAxiosActorModule {
    const message = event as HttpAxiosActorModuleRoutingMessage;
    const templateEntity: Entity = getTemplateEntity(template, message.observation.entity, message.observation.type);
    const wrapper = templateEntity.actorCellsThatCareAboutMe.find(
        (wrapper) => wrapper.name === message.meta.name && wrapper.module === HTTP_AXIOS_ACTOR_MODULE
    );
    return wrapper.cell as HttpAxiosActorModule;
}
