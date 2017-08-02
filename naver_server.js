Naver = {};

OAuth.registerService('naver', 2, null, function (query) {

    var requestAccess = getAccessToken(query);
    var identity = getIdentity(requestAccess);
    return {
        serviceData: {
            id: identity.id,
            nickname: identity.nickname,
            name: identity.name,
            email: identity.email,
            gender: identity.gender,
            age: identity.age,
            birthday: identity.birthday,
            profile_image: identity.profile_image,
            accessToken: requestAccess.access_token
        },
        options: {profile: identity}
    };
});

var getAccessToken = function (query) {
    var config = ServiceConfiguration.configurations.findOne({service: 'naver'});
    if (!config)
        throw new ServiceConfiguration.ConfigError();

    var response;
    try {
        response = HTTP.post(
            "https://nid.naver.com/oauth2.0/token", {
                headers: {
                    Accept: 'application/json'
                },
                params: {
                    grant_type: 'authorization_code',
                    client_id: config.clientId,
                    client_secret: OAuth.openSecret(config.secret),
                    code: query.code,
                    state: query.state
                }
            });
    } catch (err) {
        throw _.extend(new Error("Failed to complete OAuth handshake with Naver. " + err.message),
            {response: err.response});
    }

    if (response.data.error) { // if the http response was a json object with an error attribute
        throw new Error("Failed to complete OAuth handshake with Naver. " + response.data.error);
    } else {
        return response.data;
    }
};

var getIdentity = function (requestAccess) {
    try {
        var authorization = requestAccess.token_type + " " + requestAccess.access_token;
        var response = HTTP.post(
            "https://openapi.naver.com/v1/nid/me", {
                headers: {
                    Authorization: authorization
                }
            });
        return (response && response.data && response.data.response && response.data.response ) || {};
    } catch (err) {
        throw _.extend(new Error("Failed to fetch identity from Naver. " + response.content),
            {response: err.response});
    }
};

Naver.retrieveCredential = function (credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
