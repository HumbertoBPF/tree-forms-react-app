import {
    AuthFlowType,
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const COGNITO_CLIENT_ID = '5dhghk2n8v2e1ciasifbf5jdon';

const initiateAuth = ({ username, password }) => {
    const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });

    const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
        ClientId: COGNITO_CLIENT_ID,
    });

    return client.send(command);
};

export { initiateAuth };
