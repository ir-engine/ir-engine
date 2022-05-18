import axios from 'axios'
import config from '../appconfig'

export default async (userId, accessToken): Promise<any> => {
  let response = await axios.post(
    `${config.blockchain.blockchainUrl}/user-wallet-data`,
    {
      userId: userId
    },
    {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    }
  )
  return response
}
