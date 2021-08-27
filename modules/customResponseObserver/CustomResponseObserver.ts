import { Template } from '../../interfaces/template/Template';
import { CustomResponseObserverModule } from './CustomResponseObserverModule';

export function getCustomResponseObserverCell(template: Template, actionName: string): CustomResponseObserverModule {
    for (let i = 0; i < template.externalEntities.length; i++) {
        for (let j = 0; j < template.externalEntities[i].observers.length; j++) {
            const current = template.externalEntities[i].observers[j];
            if (current.actionName == actionName) {
                return current.cell as CustomResponseObserverModule;
            }
        }
    }

    return null;
}
