import * as dsiLogger from 'dsi-aws-boilerplate';
import { Logger } from '../../interfaces/Base';
let logger: dsiLogger.Logger;

export class WinstonLoggerModule implements Logger {
    Log(message, logObject) {
        //TODO add traceid and make log conform to interface
        if (!logger) {
            logger = dsiLogger.createLogger(true, '' /*event.requestid*/, {
                gitCommit: process.env.GIT_COMMIT_SHORT,
            });
        }
        logger.debug(message, logObject);
    }

    info(message, logObject) {
        if (!logger) {
            logger = dsiLogger.createLogger(true, '', {
                gitCommit: process.env.GIT_COMMIT_SHORT,
            });
        }
        logger.info(message, logObject);
    }

    generate() {
        throw new Error('Not implemented');
    }
}
