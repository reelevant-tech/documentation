
import DatasourceSDK from '@rlvt/datasources-openapi-client'
import { createClient, ClientType } from '@rlvt/openapi-client-utils'

const sdk = new DatasourceSDK(createClient({
  type: ClientType.DATASOURCES,
  authenticationType: {
    type: 'refresh_token',
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