import { Logger, Observer, Repository, Router } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';

export class SnsTopicObserverModule implements Observer {
    constructor(public handle: SnsTopicObserverHandle<IEntityObservation>, public saveToRepository = true) {}

    public logger: Logger;
    public router: Router;
    public repository: Repository;

    generate() {
        return;
    }
}

export type SnsTopicObserverHandle<T extends IEntityObservation> = (event, context) => Observation2<T>[];
