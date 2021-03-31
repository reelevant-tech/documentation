# Reelevant's API Documentation

This repository host the documentation for our APIs. Most of our APIs have SDKs that are built from our openapi schema and automatically updated when we make release (if you are interested, we use [oatyp](https://github.com/Eywek/oatyp)).

Here are the different SDKs and their corresponding API:
- datasources
  - This client allows to interact with your datasource, create/update/delete etc.
  - [OpenAPI documentation](https://datasource.docs.production.reelevant.dev/)
  - [NPM package](https://www.npmjs.com/package/@rlvt/datasources-openapi-client)
- blocks
  - This client allows you to interact with blocks (block themselves, block's content and block's group)
  - [OpenAPI documentation](https://block.docs.production.reelevant.dev/)
  - [NPM package](https://www.npmjs.com/package/@rlvt/blocks-openapi-client)
- entity-manager
  - This client allows you to interact with non-specific entities used across our platform (ex: companies, users etc)
  - [OpenAPI documentation](https://entity-manager.docs.production.reelevant.dev/)
  - [NPM package](https://www.npmjs.com/package/@rlvt/entity-manager-openapi-client)

**IMPORTANT**: Since those SDKs are not stable we don't use any versioning and use a specific channel `beta` to publish update. We'll setup a proper versionning when the underlying APIs become stable.

# Usage

Each SDKs only contains endpoint and types definitions for its specific API so it doesn't handle authentication. The package `@rlvt/openapi-client-utils` exists to correctly setup each SDKs, its default export return an `axios` instance that you can give to the SDK you want to use.
Here are example:
```ts
import DatasourceSDK from '@rlvt/datasources-openapi-client'
import setupClient, { ClientType } from '@rlvt/openapi-client-utils'

const sdk = new DatasourceSDK(setupClient({
  // its important to configure for which SDK you want to configure the client
  type: ClientType.DATASOURCES,
  // see under for detail about authentication method
  authenticationType: {
    grantType: 'refresh_token',
    refreshToken: process.env.REFRESH_TOKEN as string
  }
}))
// the sdk is ready to use
```

### Authentication

We currently implement a system similar to oauth2 (we plan rewrite the authentication to fully support oauth2 at some point) with the following `grant_type`:
- `password`: Requires an `username` (which is generally the user's email) and a `password`.
- `refresh_token`: Requires a valid `refresh_token`

We currently don't have a way to find/create/delete refresh tokens from the UI, but you can find/use the one inside the `localStorage` of `https://app.reelevant.com` under the key `refreshToken` .

The endpoint used to retrieve tokens with either `grant_type` is `POST https://api.reelevant.com/v1/auth/token` with a `application/x-www-form-urlencoded` `Content-Type`.
The `@rlvt/openapi-client-utils` provides callback used to handle authentication lifecycle, you can modify its behavior by overriding `setupClient` options:
```ts
export type getClientOptions = {
  type: ClientType,
  gatewayEndpoint: string
  authenticationType: AuthenticationType,
  // Called when we get a 401 from gateway, which means we need to re-authenticate using
  // whatever `grant_type` you configured
  onAuthenticationRequired: (options: {
    currentTokens: Partial<Tokens>,
    options: getClientOptions,
    request: AxiosRequestConfig
  }) => Promise<Tokens>,
  // Called when, even after `onAuthenticationRequired`, we still get a 401.
  // Generally require to give a new refresh_token
  onAuthenticationFailure: (error: Error) => void,
  // Called when we succesfully authenticate or re-authenticate, used for debugging.
  onAuthenticationSuccess: (profile: SerializedUser) => void
}
```

**NOTE**: By default `@rlvt/openapi-client-utils` provides a working `onAuthenticationRequired` callback so you should not need to change it.