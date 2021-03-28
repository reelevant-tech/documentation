
import DatasourceSDK from '@rlvt/datasources-openapi-client'
import setupClient, { ClientType } from '@rlvt/openapi-client-utils'

const sdk = new DatasourceSDK(setupClient({
  type: ClientType.DATASOURCES,
  authenticationType: {
    grantType: 'refresh_token',
    refreshToken: process.env.REFRESH_TOKEN as string
  }
}))

const run = async () => {
  const res = await sdk.WorkerDatasource.list({
    perPage: 1,
    showReady: '1'
  })
  console.log(res.data)
}

run().then(() => console.log('Done.')).catch(err => console.error(err))