export interface HttpAxiosActorAuth {
    type: 'oauth' | 'secret_key';
    clientIdContextProperty?: string;
    clientSecretContextProperty?: string;
    usernameContextProperty?: string;
    passwordContextProperty?: string;
    authUrlContextProperty?: string;
    secretKeyContextProperty?: string;
}
