const baseURL = process.env.REACT_APP_API_BASE_URL;

export default {
  meEndpoint: `${baseURL}/api/account/refreshtoken`,
  loginEndpoint: `${baseURL}/api/account/login`,
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken'
}
