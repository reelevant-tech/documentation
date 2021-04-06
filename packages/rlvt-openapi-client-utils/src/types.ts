
import { AxiosRequestConfig } from 'axios'
import type { SerializedUser } from '@rlvt/entity-manager-openapi-client'

export type getClientOptions = {
  type: ClientType,
  gatewayEndpoint: string
  authenticationType: AuthenticationType,
  onAuthenticationRequired: (options: {
    currentTokens: Partial<Tokens>,
    options: getClientOptions,
    request: AxiosRequestConfig
  }) => Promise<Tokens>,
  onAuthenticationFailure: (error: Error) => void,
  onAuthenticationSuccess: (profile: SerializedUser) => void
}

export enum ClientType {
  DATASOURCES = 'DATASOURCES',
  ENTITIES = 'ENTITIES',
  WORKFLOWS = 'WORKFLOWS',
  CONTENTS_LEGACY = 'CONTENTS_LEGACY',
  BLOCKS = 'BLOCKS'
}

export type Tokens = {
  accessToken: string
  refreshToken: string
}

type PasswordGrantType = {
  type: 'password'
  email: string
  password: string
}

type TokenGrantType = {
  type: 'refresh_token',
  refreshToken: string
}

type CrossSiteType = {
  type: 'cross_site'
}

export type AuthenticationType = PasswordGrantType | TokenGrantType | CrossSiteType