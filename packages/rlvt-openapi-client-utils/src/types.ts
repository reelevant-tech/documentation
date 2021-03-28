
import { AxiosRequestConfig } from 'axios'
import type { SerializedUser } from '@rlvt/entity-manager-openapi-client'

export type getClientOptions = {
  type: ClientType,
  authenticationType: AuthenticationType,
  onAuthenticationRequired: (options: {
    currentTokens: Partial<Tokens>,
    authentication: AuthenticationType,
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
  grantType: 'password'
  email: string
  password: string
}

type TokenGrantType = {
  grantType: 'refresh_token',
  refreshToken: string
}

export type AuthenticationType = PasswordGrantType | TokenGrantType