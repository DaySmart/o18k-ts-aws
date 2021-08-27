import { Logger } from '../interfaces/Base';
import { Template } from '../interfaces/template/Template';

export const getDefaultLogger = (template: Template): Logger => {
    return template.defaultLogger;
};
