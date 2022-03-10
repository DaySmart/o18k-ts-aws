import { SSM } from 'aws-sdk';

const ssm = new SSM();

let secrets: any;

export async function retrieveSecretsFromParameterStore(): Promise<{ [key: string]: string }> {
    console.log('retrieveSecrets called');
    if (!secrets) {
        try {
            const getParameterResponse = await ssm
                .getParameter({
                    Name: process.env.PARAMETER_STORE_NAME,
                    WithDecryption: true,
                })
                .promise();
            secrets = JSON.parse(getParameterResponse.Parameter.Value);
        } catch (ex) {
            console.log('Failed getting secrets.', { error: ex.toString() });
            throw ex;
        }
    }
    return secrets;
}
