import axios from 'axios'

import config from '../appconfig'

export default async (fromUserId, toUserId, walletAmt, accessToken): Promise<any> => {
  let response = await axios.post(
    `${config.blockchain.blockchainUrl}/user-wallet-data/send`,
    {
      fromUserId: fromUserId,
      toUserId: toUserId,
      amount: walletAmt
    },
    {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    }
  )
  return response
}
