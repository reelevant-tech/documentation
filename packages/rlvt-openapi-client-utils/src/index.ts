
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { of } from 'await-of'
import { Tokens, getClientOptions, ClientType } from './types'
import { basePathForClient, verifyTokenValidity, standaloneAxios, clientDefaults } from './utils'


const createAxiosClient = (options: getClientOptions) => {
  // store current tokens used by this client
  const currentTokens: Partial<Tokens> = {
    refreshToken: options.authenticationType?.grantType === 'refresh_token' ? options.authenticationType.refreshToken : undefined
  }
  // create specific axios instance for this client
  const axiosInstance = axios.create({
    baseURL: `${options.gatewayEndpoint}${basePathForClient[options.type]}`
  })
  axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
    config.headers = Object.assign(config.headers, {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentTokens.accessToken}`
    })
    return config
  })
  axiosInstance.interceptors.response.use(undefined, async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const [ tokens, renewTokenError ] = await of(options.onAuthenticationRequired({
        currentTokens,
        options,
        request: error.config
      }))
      if (tokens === undefined) {
        options.onAuthenticationFailure(renewTokenError ?? new Error('authentication_failure'))
        return error.response
      }
      const [ profile, profileError ] = await of(verifyTokenValidity(`${options.gatewayEndpoint}/v1/profile`, tokens))
      if (profile === undefined) {
        options.onAuthenticationFailure(profileError ?? new Error('authentication_failure'))
        return error.response
      }
      options.onAuthenticationSuccess(profile.data.data)
      currentTokens.accessToken = tokens.accessToken
      currentTokens.refreshToken = tokens.refreshToken
      // re-launch the request with another axios instance to avoid recursive errors
      error.config.headers = Object.assign(error.config.headers, { Authorization: `Bearer ${tokens.accessToken}`})
      return standaloneAxios(error.config)
    }
    throw error
  })
  return axiosInstance
}

export * from './types'

export const createClient = (_options: Partial<getClientOptions> & { type: ClientType }) => {
  const options = Object.assign(clientDefaults, _options)
  return createAxiosClient(options)
}


