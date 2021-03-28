import { ClientType, getClientOptions } from './types'
import axios from 'axios'
import { Tokens } from './types'
import type { SerializedUser } from '@rlvt/entity-manager-openapi-client'
import { URLSearchParams } from 'url'

export const basePathForClient: Record<keyof typeof ClientType, string> = {
  [ClientType.BLOCKS]: '/',
  [ClientType.DATASOURCES]: '/v2/datasources',
  [ClientType.WORKFLOWS]: '/v2/workflows',
  [ClientType.CONTENTS_LEGACY]: '/',
  [ClientType.ENTITIES]: '/v2/entity'
}

// create a seperate client so we don't inherent from any global config
export const standaloneAxios = axios.create()
export const verifyTokenValidity = async (endpoint: string, tokens: Tokens) => {
  return standaloneAxios.get<{ data: SerializedUser }>(endpoint, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`
    }
  })
}

type ExchangeToken = {
  access_token: string
  refresh_token: string
}

const tokenAuth = async (endpoint: string, refreshToken: string): Promise<Tokens> => {
  const params = new URLSearchParams()
  params.append('refresh_token', refreshToken)
  params.append('grant_type', 'refresh_token')
  const tokens = await standaloneAxios.post<ExchangeToken>(endpoint, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return { accessToken: tokens.data.access_token, refreshToken: tokens.data.refresh_token }
}

const passwordAuth = async (endpoint: string, email: string, password: string): Promise<Tokens> => {
  const params = new URLSearchParams()
  params.append('username', email)
  params.append('password', password)
  params.append('grant_type', 'password')
  const tokens = await standaloneAxios.post<ExchangeToken>(endpoint, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return { accessToken: tokens.data.access_token, refreshToken: tokens.data.refresh_token }
}

export const clientDefaults: getClientOptions = {
  gatewayEndpoint: `https://api.reelevant.com`,
  type: ClientType.BLOCKS,
  onAuthenticationFailure: (error: Error) => {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to authenticate with Reelevant APIs`, { message: error.message, data: error.response?.data, request: error.config })
    } else {
      console.error(`Failed to authenticate with Reelevant APIs`, error)
    }
  },
  onAuthenticationRequired: async ({ currentTokens, options, request }) => {
    switch (options.authenticationType.grantType) {
      case 'password': {
        if (currentTokens.refreshToken === undefined) {
          return passwordAuth(`${options.gatewayEndpoint}/v1/auth/token`, options.authenticationType.email, options.authenticationType.password)
        }
        return tokenAuth(`${options.gatewayEndpoint}/v1/auth/token`, currentTokens.refreshToken)
      }
      case 'refresh_token': {
        if (currentTokens.refreshToken === undefined) {
          throw new Error(`Tried to renew token but no refresh token is defined`)
        }
        return tokenAuth(`${options.gatewayEndpoint}/v1/auth/token`, currentTokens.refreshToken)
      }
      default: {
        throw new Error(`Unknown authentication type: ${options.authenticationType}`)
      }
    }
  },
  onAuthenticationSuccess: (profile) => {
    console.log(`Logged within Reelevant with account ${profile.email}`)
  },
  authenticationType: {
    grantType: 'refresh_token',
    refreshToken: '__fake__'
  }
}