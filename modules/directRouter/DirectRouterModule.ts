import { Logger, Router } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { Template } from '../../interfaces/template/Template';
import { getTemplateEntity } from '../../util/getTemplateEntity';

export class DirectRouterModule implements Router {
    public logger: Logger;

    async SendToRouter(template: Template, observations: Observation2<IEntityObservation>[]): Promise<void> {
        const promises = [];
        observations.forEach((observation) => {
            this.logger.Log(`[Router.SendToRouter.receive] ${observation.entity}:${observation.type}`, { observation });
            const templateEntity = getTemplateEntity(template, observation.entity, observation.type);

            //TODO: are these async? how to handle that?
            if (templateEntity && templateEntity.deciderCellsThatCareAboutMe) {
                templateEntity.deciderCellsThatCareAboutMe.forEach((d) => {
                    this.logger.Log(`[Router.SendToRouter.send] ${observation.entity}:${observation.type} to ${d.entity}:${d.type}`, {
                        destination: d,
                    });
                    promises.push(d.cell.SendToCell(observation, { meta: 'meta' }));
                });
            }
            if (templateEntity && templateEntity.actorCellsThatCareAboutMe) {
                templateEntity.actorCellsThatCareAboutMe.forEach((a) => {
                    this.logger.Log(`[Router.SendToRouter.send] ${observation.entity}:${observation.type} to ${a.name}`, {
                        destination: a,
                    });
                    promises.push(a.cell.SendToCell(observation, { meta: 'meta' }));
                });
            }
        });
        const responses = await Promise.all(promises);
        this.logger.Log(`[Router.SendToRouter.responses]`, { responses });

        return null;
    }
    generate() {
        throw new Error('Not implemented.');
    }
}
