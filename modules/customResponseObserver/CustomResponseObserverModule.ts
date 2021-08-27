import { Logger, Observer, Repository, Router } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';

export class CustomResponseObserverModule implements Observer {
    constructor(public handle: CustomResponseObserverHandle<IEntityObservation>, public saveToRepository = true) {}
    public logger: Logger;
    public functionName: string;
    public repository: Repository;
    public router: Router;

    async SendToCell(_observation: Observation2<IEntityObservation>, _meta: any) {}

    public generate() {
        return;
    }
}

export type CustomResponseObserverHandle<T extends IEntityObservation> = (
    observation: Observation2<IEntityObservation>,
    response: any
) => Observation2<T>[];
