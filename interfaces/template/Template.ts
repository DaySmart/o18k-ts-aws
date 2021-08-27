import { Logger } from '../Base';
import { ExternalEntity } from './ExternalEntity';
import { InternalEntity } from './InternalEntity';

// only reference generated config (yml)
//
export interface Template {
    externalEntities: ExternalEntity[];
    internalEntities: InternalEntity[];
    defaultLogger: Logger;
}
