import { Observer } from '../Base';

export interface ObserverCellWrapper {
    cell: Observer;
    path?: string; // TODO move this to a specific implementation
    method?: string;
    actionName?: string;
    operation?: string;
    module?: string;
    logGroupMatch?: string;
    topicArnMatch?: string;
    eventSourceMatch?: string;
}
