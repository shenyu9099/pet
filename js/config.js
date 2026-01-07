// ============================================
// Azure Logic Apps API Configuration
// ============================================
export const API_ENDPOINTS = {
    USERS: {
        REGISTER: 'https://prod-06.francecentral.logic.azure.com:443/workflows/a5f53337cf144a59a90f71149bda71a4/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=ZryZu1h7k6jUGMyXV90X_KzH8lg0jetnBUMDmoww4dw',
        LOGIN: 'https://prod-00.francecentral.logic.azure.com:443/workflows/304414bf35814cf1aeaa71aa63d2a2fc/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=SJaQYX-q0VoLjl0CHL8R7Lin2r7wT_cofk378uFdNQg',
    },
    PETS: {
        CREATE: 'https://prod-20.francecentral.logic.azure.com:443/workflows/9d764593c2414e86bc0a7ba281d5c30d/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=mWwW2RoVlFiKqIJxTzinwai1NXt3XB-aPSi3SZqjV90',
        GET_MY_PETS: 'https://prod-29.francecentral.logic.azure.com:443/workflows/d9ab0b8d88d145be8b07f8b7c1ff64d6/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=a8aJd5gsn1MuL8lx09BCXwMQK7ye_C6CLFPXAqMrIjA',
    },
    MOMENTS: {
        CREATE: 'https://prod-12.francecentral.logic.azure.com:443/workflows/c53f70faa023499da83f964c98a405ef/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=xUmfcUvNEczTwqWqDuEQuN_GKp2zACF9_k6L-Kmbxuo',
        GET_ALL: 'https://prod-02.francecentral.logic.azure.com:443/workflows/5d308bcc328341269eb49e9aca7e2a4c/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=gYMuR2BXzQpz4qapAraOEwYOu_iP7KBGZgY6zuERlRM',
        GET_BY_ID: 'https://prod-03.francecentral.logic.azure.com:443/workflows/002dce10369744cb8dde987ec04ab04a/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=j0TTnLa49WtIEMjunda6QWkDJtbgig3OQKCfO8VpkP8',
        UPDATE: 'https://prod-29.francecentral.logic.azure.com:443/workflows/36ed7363bd604315bf269e57dc3c1491/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=dsmUVVa_CEk1onlfZkohvsrNPOHS1q9JS7uNFn7n2ZQ',
        DELETE: 'https://prod-10.francecentral.logic.azure.com:443/workflows/e0a0cb77ca3944a58a9cceb87ae61059/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=FByY9E5UUUrRx0vGFBYhj37G95MpA6tFYT-3021VP1Y',
    },
};

// Azure AI Search Configuration (if needed in the future)
export const SEARCH_CONFIG = {
    ENDPOINT: 'https://petmoments-search.search.windows.net',
    API_KEY: 'YOUR_SEARCH_QUERY_KEY',
    INDEX_NAME: 'petmoments-index',
    API_VERSION: '2023-11-01'
};
