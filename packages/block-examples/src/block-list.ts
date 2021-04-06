
import { createClient, ClientType } from '@rlvt/openapi-client-utils'
import BlockSDK from '@rlvt/blocks-openapi-client'

const blockSDK = new BlockSDK(createClient({
  type: ClientType.BLOCKS,
  authenticationType: {
    type: 'refresh_token',
    refreshToken: process.env.REFRESH_TOKEN as string
  }
}))

const run = async () => {
  const list = await blockSDK.Block.list({ per_page: 1, filter: 'status:generated', sort: 'updatedAt:desc' })
  console.log(list.data.data)
}

run().then(() => console.log('Done.')).catch(err => console.error(err.message, err!.response.data))