# Reelevant's API Documentation

This repository host the documentation for our APIs. Most of our APIs have SDKs that are built from our openapi schema and automatically updated when we make release (if you are interested, we use [oatyp](https://github.com/Eywek/oatyp)).

Here are the different SDKs and their corresponding API:
- datasources
  - This APIs allows to interact with your datasource, create/update/delete etc.
  - [OpenAPI documentation](https://datasource.docs.production.reelevant.dev/)
  - [OpenAPI definition](https://datasource-openapi.docs.production.reelevant.dev/openapi)
  - [NPM package](https://www.npmjs.com/package/@rlvt/datasources-openapi-client)
  - Production base URL: `https://api.reelevant.com/v2/datasources/`
- blocks
  - This APIs allows you to interact with blocks (block themselves, block's content and block's group)
  - [OpenAPI documentation](https://block.docs.production.reelevant.dev/)
  - [OpenAPI definition](https://block-openapi.docs.production.reelevant.dev/v1/openapi)
  - [NPM package](https://www.npmjs.com/package/@rlvt/blocks-openapi-client)
  - Production base URL: `https://api.reelevant.com/`
- entity-manager
  - This APIs allows you to interact with non-specific entities used across our platform (ex: companies, users etc)
  - [OpenAPI documentation](https://entity-manager.docs.production.reelevant.dev/)
  - [OpenAPI definition](https://entity-manager-openapi.docs.production.reelevant.dev/openapi)
  - [NPM package](https://www.npmjs.com/package/@rlvt/entity-manager-openapi-client)
  - Production base URL: `https://api.reelevant.com/v2/entity/`

**IMPORTANT**: Since those SDKs are not stable we don't use any versioning and use a specific channel `beta` to publish update. We'll setup a proper versionning when the underlying APIs become stable.

# HTTPs Usage

All of our APIs are exposed through our gateway (available at `https://api.reelevant.com`) which requires authentication. 

### Authentication

We currently implement a system similar to oauth2 (we plan rewrite the authentication to fully support oauth2 at some point) with the following `grant_type`:
- `password`: Requires an `username` (which is generally the user's email) and a `password`.
- `refresh_token`: Requires a valid `refresh_token`

We currently don't have a way to find/create/delete refresh tokens from the UI, but you can find/use the one inside the `localStorage` of `https://app.reelevant.com` under the key `refreshToken`.

The endpoint used to retrieve tokens with is `POST https://api.reelevant.com/v1/auth/token` with a `application/x-www-form-urlencoded` `Content-Type`.

Here is an example to get tokens based on a `username`/`password`:
```bash
curl -XPOST https://api.reelevant.com/v1/auth/token -d 'username=myemail&password=mypassword&grant_type=password'
```
And here is if you already have a `refresh_token`:
```bash
curl -XPOST https://api.reelevant.com/v1/auth/token -d 'refresh_token=myrefreshtoken&grant_type=refresh_token'
```

After getting a valid `access_token`, you'll need to add it for every call to the gateway to within the `Authorization` header like so `Authorization: Bearer ${access_token}`. **Please ignore any other authentication header that you can find in all OpenAPI documentation as they are purely internal.**

**NOTE**: Access token are valid for 1h after creation whereas refresh token are valid for 30 days starting from the last access token generation (so if you refresh it one a month, it doesnt expire).

### Access / URLs

As said before our gateway is available at `https://api.reelevant.com/` however each API is exposed in different paths:
- Datasource is available at `https://api.reelevant.com/v2/datasources/` (if you'd want to list datasources, the endpoint would be `GET https://api.reelevant.com/v2/datasources/`)
- Block is available at `https://api.reelevant.com/` (if you'd want to list the blocks, the endpoint would be `GET https://api.reelevant.com/v1/blocks`)
- Entity is available at `https://api.reelevant.com/v2/entity/` (if you'd want to list users in your company, the endpoint would be `GET https://api.reelevant.com/v2/entity/users/`)

# Typescript/Javascript Usage

Each SDKs only contains endpoint and types definitions for its specific API so it doesn't handle authentication. The package `@rlvt/openapi-client-utils` exists to correctly setup each SDKs, its default export return an `axios` instance that you can give to the SDK you want to use.


Here are an example):
```ts
import DatasourceSDK from '@rlvt/datasources-openapi-client'
import setupClient, { ClientType } from '@rlvt/openapi-client-utils'

const sdk = new DatasourceSDK(setupClient({
  // its important to configure for which SDK you want to configure the client
  type: ClientType.DATASOURCES,
  // see above for detail about authentication method
  // but you can either use `grantType: refresh_token` or `grantType: password`
  authenticationType: {
    grantType: 'refresh_token',
    refreshToken: process.env.REFRESH_TOKEN as string
  }
}))
// the sdk is ready to use
```

**NOTE**: You can find more examples in the `packages/` folder.

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

**NOTE**: By default `@rlvt/openapi-client-utils` provides a working `onAuthenticationRequired` callback that automatically try to refresh tokens so you should not need to change it.