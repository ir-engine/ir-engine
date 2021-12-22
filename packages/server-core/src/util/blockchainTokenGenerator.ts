import axios from 'axios'
import config from '../appconfig'

export default async (): Promise<any> => {
  let response = await axios.post(`${config.blockchain.blockchainUrl}/authorizeServer`, {
    authSecretKey: config.blockchain.blockchainUrlSecret
  })
  return response
}
