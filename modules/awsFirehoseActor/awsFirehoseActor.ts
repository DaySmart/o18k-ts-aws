import { AwsFirehoseActorModule } from './AwsFirehoseActorModule';
import { getDefaultLogger } from '../../util/getDefaultLogger';
import { Context } from '../../interfaces/Base';
import { IEntityObservation } from '../../interfaces/IEntityObservation';
import { Template } from '../../interfaces/template/Template';
import { getAwsFirehoseActorCell } from './getAwsFirehoseActorCell';
import { Observation2 } from '../../interfaces/Observation2';
import { Firehose } from 'aws-sdk';

const firehose = new Firehose({apiVersion: '2015-08-04'});

export const AWS_FIREHOSE_ACTOR_MODULE = 'AwsFirehoseActorModule';

export async function awsFirehoseActor(event: any, context: any, template: Template) {
    const defaultLogger = getDefaultLogger(template);
    defaultLogger.Log('[AwsFirehoseActorModule] request', { event, context });

    const cell: AwsFirehoseActorModule = getAwsFirehoseActorCell(event, template);

    const observation: Observation2<IEntityObservation> = event.observation;
    const dependentObservations = await cell.repository.load(observation, cell.queries);

    let currentTime = new Date();
    let handlerContext: Context = { time: currentTime };
    if (cell.contextHandles) {
        cell.logger.Log('[AwsFirehoseActorModule] cell', { cell: JSON.stringify(cell.contextHandles) });

        const cellContextResponses = await Promise.all(cell.contextHandles.map((f) => f()));
        cell.logger.Log('[AwsFirehoseActorModule] cellContextResponse', { cellContextResponses });
        cellContextResponses.forEach((response) => {
            handlerContext = {
                time: currentTime,
                ...handlerContext,
                ...response,
            };
        });
    }

    const logNote = `${cell.name} handling ${observation.entity}:${observation.type}`;
    cell.logger.Log(`[AwsFirehoseActorModule.parameters] ${logNote}`, {
        observation,
        dependentObservations,
        handlerContextKeys: Object.keys(handlerContext).join(', '),
    });

	const data = cell.handle ? cell.handle(observation, dependentObservations, handlerContext) : observation.data;

	const response = await firehose.putRecord({
		DeliveryStreamName: cell.deliveryStreamName,
		Record: {
			Data: JSON.stringify(data)
		}
	}).promise();

    cell.logger.Log(`[AwsFirehoseActorModule.firehoseResponse] ${logNote}`, { response });

    return { statusCode: 200 };
}
