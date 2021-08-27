import { AxiosResponse } from 'axios';
import { Logger, Observer, Repository, Router } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';
import { Template } from '../../interfaces/template/Template';

//add response observer for amapi customer modify
export function getHttpAxiosResponseObserverCell(actionName: string, template: Template): HttpAxiosResponseObserverModule {
    for (let i = 0; i < template.externalEntities.length; i++) {
        for (let j = 0; j < template.externalEntities[i].observers.length; j++) {
            const current = template.externalEntities[i].observers[j];
            if (current.actionName == actionName) {
                return current.cell as HttpAxiosResponseObserverModule;
            }
        }
    }

    return null;
}

export type HttpAxiosResponseObserverHandle<T extends IEntityObservation> = (
    observation: Observation2<IEntityObservation>,
    responses: AxiosResponse[]
) => Observation2<T>[];

export class HttpAxiosResponseObserverModule implements Observer {
    constructor(
        public name: string,
        public handle: HttpAxiosResponseObserverHandle<IEntityObservation>,
        public saveToRepository: boolean = true
    ) {}
    public logger: Logger;
    public functionName: string;
    public repository: Repository;
    public router: Router;

    async SendToCell(_observation: Observation2<IEntityObservation>, _meta: any) {}

    public generate() {
        return;
    }
}
