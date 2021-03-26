# Reelevant's API Documentation

This repository host the documentation for our APIs. Most of our APIs have SDKs that are built from our openapi schema and automatically updated when we make release (if you are interested, we use [oatyp](https://github.com/Eywek/oatyp)).

Here are the different SDKs and their corresponding API:
- datasources
  - This client allows to interact with your datasource, create/update/delete etc.
  - [OpenAPI documentation](https://datasource.docs.production.reelevant.dev/)
  - [NPM package](https://www.npmjs.com/package/@rlvt/datasources-openapi-client)
- entity-manager
  - This client allows you to interact with non-specific entities used across our platform (ex: companies, users etc)
  - [OpenAPI documentation](https://entity-manager.docs.production.reelevant.dev/)
  - [NPM package](https://www.npmjs.com/package/@rlvt/entity-manager-openapi-client)

**IMPORTANT**: Since those SDKs are not stable we don't use any versioning and use a specific channel `beta` to publish update. We'll setup a proper versionning when the underlying APIs become stable.
