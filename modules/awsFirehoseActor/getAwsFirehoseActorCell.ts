import { Entity } from '../../interfaces/Entity';
import { getTemplateEntity } from '../../util/getTemplateEntity';
import { Template } from '../../interfaces/template/Template';
import { AwsFirehoseActorModuleRoutingMessage } from './AwsFirehoseActorModuleRoutingMessage';
import { AwsFirehoseActorModule } from './AwsFirehoseActorModule';
import { AWS_FIREHOSE_ACTOR_MODULE } from './awsFirehoseActor';

export function getAwsFirehoseActorCell(event, template: Template): AwsFirehoseActorModule {
    const message = event as AwsFirehoseActorModuleRoutingMessage;
    const templateEntity: Entity = getTemplateEntity(template, message.observation.entity, message.observation.type);
    const wrapper = templateEntity.actorCellsThatCareAboutMe.find(
        (wrapper) => wrapper.name === message.meta.name && wrapper.module === AWS_FIREHOSE_ACTOR_MODULE
    );
    return wrapper.cell as AwsFirehoseActorModule;
}
