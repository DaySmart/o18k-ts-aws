import { Logger, Observer, Repository, Router } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Observation2 } from '../../interfaces/Observation2';

export class CloudWatchLogObserverModule implements Observer {
    constructor(public handle: CloudWatchLogObserverHandle<IEntityObservation>, public saveToRepository = true) {}

    public logger: Logger;
    public router: Router;
    public repository: Repository;

    generate() {
        return;
    }
}

export type CloudWatchLogObserverHandle<T extends IEntityObservation> = (event, context) => Observation2<T>[];
