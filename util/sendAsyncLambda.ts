import aws from 'aws-sdk';
const lambda = new aws.Lambda();

export const sendAsyncLambda = async (functionName: string, payload: any) => {
    return lambda
        .invokeAsync({
            FunctionName: functionName,
            InvokeArgs: JSON.stringify(payload),
        })
        .promise();
};
