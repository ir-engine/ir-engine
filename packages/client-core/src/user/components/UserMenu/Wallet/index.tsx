import { AuthService, useAuthState } from '../../../services/AuthService'
import React, { useEffect, useState } from 'react'
import { client } from '../../../../feathers'
import WalletContent from './WalletContent'
import styles from '../UserMenu.module.scss'

interface Props {
  changeActiveMenu?: any
  id: String
}
export const Wallet = (props: Props): any => {
  const [state, setState] = useState<any>({
    coinData: [],
    walletData: [],
    data: [],
    coinlimit: 0,
    coinDataReceive: [],
    dataReceive: [],
    walletDataReceive: [],
    user: [],
    type: [],
    isLoading: true,
    isLoadingtransfer: false,
    isSendingLoader: false
  })
  const {
    data,
    user,
    type,
    coinlimit,
    isLoading,
    walletDataReceive,
    walletData,
    dataReceive,
    isLoadingtransfer,
    coinData,
    coinDataReceive
  } = state

  const authState = useAuthState()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  useEffect(() => {
    if (authState.isLoggedIn.value) {
      fetchInventoryList()
      fetchUserList()
    }
  }, [authState.isLoggedIn.value])

  const fetchInventoryList = async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true
    }))
    try {
      const response = await client.service('user').get(props.id)
      setState((prevState) => ({
        ...prevState,
        data: [...response.inventory_items.filter((val) => val.isCoin === true)],
        coinData: [...response.inventory_items.filter((val) => val.isCoin === true)],
        isLoading: false,
        walletData: [...response.user_wallets],
        coinlimit: response.inventory_items.filter((val) => val.isCoin === true)[0]?.user_inventory?.quantity
      }))
    } catch (err) {
      console.error(err, 'error')
    }
  }

  const fetchUserList = async () => {
    try {
      const response = await client.service('user').find({
        query: {
          action: 'inventory'
        }
      })
      if (response.data && response.data.length !== 0) {
        const activeUser = response.data.filter((val: any) => val.inviteCode !== null && val.id !== props.id)
        setState((prevState: any) => ({
          ...prevState,
          user: [...activeUser],
          isLoading: false
        }))
      }
    } catch (err) {
      console.error(err, 'error')
    }
  }

  const getreceiverid = async (receiveid) => {
    try {
      const response = await client.service('user').get(receiveid)
      setState((prevState) => ({
        ...prevState,
        dataReceive: [...response.inventory_items.filter((val) => val.isCoin === true)],
        coinDataReceive: [...response.inventory_items.filter((val) => val.isCoin === true)],
        walletDataReceive: [...response.user_wallets]
      }))
    } catch (err) {
      console.error(err, 'error')
    }
  }

  const sendamtsender = async (amt) => {
    setState((prevState) => ({
      ...prevState,
      isSendingLoader: true
    }))
    try {
      const response = await client.service('user-inventory').patch(data[0].user_inventory.userInventoryId, {
        privateKey: walletData[0].privateKey,
        fromUserAddress: walletData[0].userAddress,
        toUserAddress: walletDataReceive[0].userAddress,
        quantity: Number(data[0].user_inventory.quantity) - Number(amt),
        walletAmt: Number(amt),
        type: 'Wallet transfer'
      })
    } catch (err) {
      console.error(err, 'error')
    } finally {
      setState((prevState) => ({
        ...prevState,
        isSendingLoader: false
      }))
    }
  }

  const sendamtreceiver = async (receiveid, amt) => {
    try {
      const response = await client.service('user-inventory').patch(dataReceive[0].user_inventory.userInventoryId, {
        quantity: Number(dataReceive[0].user_inventory.quantity) + Number(amt)
      })
    } catch (err) {
      console.error(err, 'error')
    }
  }
  /*
  const sendamtwallet = async (amt) => {
    try {
      // const response = await client.service('wallet').create("send", {
      //   privateKey: walletData[0].privateKey,
      //   fromUserAddress: walletData[0].userAddress,
      //   toUserAddress: walletDataReceive[0].userAddress,
      //   amount: amt
      // })
      // const httpAgent = new https.Agent({
      //   rejectUnauthorized: false
      // })
      console.log("1, DRC")
      // GET RESPONSE FOR TOKEN
      const response_token = await axios.post(
        'http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com/api/v1/authorizeServer',
        {
          authSecretKey: 'secret',
        },
      )

      console.log("DEVJEET:", response_token)
      // KEEP TOKEN
      var accessToken = response_token.data.accessToken

      // CALL WALLET API WITH HEADER SETUP
      var walletData = await axios.post(
        'http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com/api/v1/wallet/send',
        {
          privateKey: walletData[0].privateKey,
          fromUserAddress: walletData[0].userAddress,
          toUserAddress: walletDataReceive[0].userAddress,
          amount: amt
        },
        {
          headers: {
            Authorization: 'Bearer ' + accessToken
            
          }
        }
      )

      console.log(response_token, 'sendamtwallet')
    } catch (err) {
      console.error(err, 'error')
    }
  }
*/

  return (
    <div className={styles.menuPanel}>
      {isLoading ? (
        'Loading...'
      ) : (
        <WalletContent
          data={walletData}
          user={user}
          coinlimit={coinlimit}
          getreceiverid={getreceiverid}
          sendamtsender={sendamtsender}
          sendamtreceiver={sendamtreceiver}
          changeActiveMenu={props.changeActiveMenu}
          //sendamtwallet={sendamtwallet}
        />
      )}
    </div>
  )
}

export default Wallet
