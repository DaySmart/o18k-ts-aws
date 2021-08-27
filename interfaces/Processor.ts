import { Observation2 } from './Observation2';

export interface Processor {
    observation: Observation2<any>;
    execute(): Promise<Observation2<any>[]>;
}
