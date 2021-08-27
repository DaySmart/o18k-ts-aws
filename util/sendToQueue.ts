import aws from 'aws-sdk';
export const sqs = new aws.SQS();

export interface Throttle {
    concurrencyLimit: number;
    queueUrl: string;
}

export const sendToQueue = async (throttle: Throttle, event) => {
    return sqs
        .sendMessage({
            QueueUrl: throttle.queueUrl,
            MessageBody: JSON.stringify(event),
        })
        .promise();
};
