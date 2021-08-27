import { Entity } from '../interfaces/Entity';
import { Template } from '../interfaces/template/Template';

export const getTemplateEntity = (template: Template, entity: string, type: string): Entity => {
    return template.internalEntities.concat(template.externalEntities).find((e) => e.entity === entity && e.type === type);
};
