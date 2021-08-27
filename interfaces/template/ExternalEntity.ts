import { Entity } from '../Entity';
import { ObserverCellWrapper } from './ObserverCellWrapper';

export interface ExternalEntity extends Entity {
    observers: ObserverCellWrapper[];
}
