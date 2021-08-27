import { ActorHandle } from './ActorHandle';
import { DeciderHandle } from './DeciderHandle';
import { IEntityObservation } from './IEntityObservation';
import { Observation2 } from './Observation2';
import { Template } from './template/Template';

//namespace Base {
export interface Config {
    moduleInstances: ModuleInstances;
}

export interface ModuleInstances {
    [moduleInstanceName: string]: Component;
}

// export const createModuleInstances = <M extends ModuleInstances>(moduleInstances: M) => moduleInstances;

export interface Component {
    generate(): void;
}

export interface Cell extends Component {
    logger: Logger;
    saveToRepository: boolean;
}

export interface ReceivingCell extends Cell {
    repository: Repository;
    queries: Query[];
    SendToCell(observation: Observation2<IEntityObservation>, meta: any): Promise<void>;
}

export type CreatorCell = Cell;

export interface Actor extends ReceivingCell {
    handle: ActorHandle<IEntityObservation>;
}
export interface Decider extends ReceivingCell, CreatorCell {
    handle: DeciderHandle<IEntityObservation>;
}

//move out of base
export type Observer = CreatorCell;

export interface Router extends Component {
    SendToRouter(template: Template, observations: Observation2<IEntityObservation>[]): Promise<void>;
}

export interface Repository {
    logger: Logger;
    load(observation: Observation2<IEntityObservation>, previousObservations: Query[]): Promise<Observation2<IEntityObservation>[][]>;
    save(observations: Observation2<IEntityObservation>[]): Promise<void>;
}

export type ObservationFilterFunction = (observation: Observation2<IEntityObservation>) => string[];

export interface Query {
    filter: filters;
    filterValues: (ObservationFilterFunction | string)[];
}

export interface Context {
    [key: string]: any;
    time: Date;
}

export enum filters {
    TOP_1_WHERE_ENTITY_EQUALS_AND_TYPE_EQUALS_AND_ENTITYID_EQUALS_OBSERVATION_ENTITYID,
    TOP_1_WHERE_ENTITY_EQUALS_AND_TYPE_EQUALS_AND_ENTITYID_EQUALS_VALUE,
    TOP_1_WHERE_ENTITY_EQUALS_AND_TYPE_EQUALS_AND_GSI2_DATA_EQUALS,
    TOP_1_WHERE_ENTITY_EQUALS_AND_TYPE_EQUALS_AND_ENTITYID_IN_LIST,
    TOP_2_WHERE_ENTITY_EQUALS_AND_TYPE_EQUALS_AND_ENTITYID_EQUALS_OBSERVATION_ENTITYID,
    TOP_1_WHERE_ENTITY_EQUALS_AND_TYPE_EQUALS_AND_ENTITYID_EQUALS_OBSERVATION_DATA_PROPERTY,
    TOP_1_WHERE_ENTITY_EQUALS_AND_TYPE_EQUALS_AND_ENTITYID_IN_LIST_FROM_FUNCTION,
    TOP_10_WHERE_ENTITY_EQUALS_AND_TYPE_EQUALS_AND_GSI2_IN_LIST_FROM_FUNCTION,
}

export interface Timer extends ReceivingCell, CreatorCell {}

export interface Logger extends Component {
    Log(message: string, logObject: any): void;
    info(message: string, logObject: any): void;
}

//}

//export = Base;
