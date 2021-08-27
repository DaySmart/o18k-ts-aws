import { ActorCellWrapper } from './template/ActorCellWrapper';
import { DeciderCellWrapper } from './template/DeciderCellWrapper';

export interface Entity {
    entity: string;
    type: string;
    actorCellsThatCareAboutMe?: ActorCellWrapper[];
    deciderCellsThatCareAboutMe?: DeciderCellWrapper[];
}
