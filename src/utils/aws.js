import {
    AuthFlowType,
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const COGNITO_CLIENT_ID = '5ebqt3u94ilj66vh1insicmi62';

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
