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
  const { data, user, type, coinlimit, isLoading, dataReceive, isLoadingtransfer, coinData, coinDataReceive } = state

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
        coinlimit: response.inventory_items.filter((val) => val.isCoin === true)[0].user_inventory?.quantity
      }))
    } catch (err) {
      console.error(err, 'error')
    }
  }

  const fetchUserList = async () => {
    try {
      const response = await client.service('inventory-item').find()
      const prevData = [...response.data.filter((val: any) => val.isCoin === true)[0].users]
      if (response.data && response.data.length !== 0) {
        const activeUser = prevData.filter((val: any) => val.inviteCode !== null && val.id !== props.id)
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
        coinDataReceive: [...response.inventory_items.filter((val) => val.isCoin === true)]
      }))
    } catch (err) {
      console.error(err, 'error')
    }
  }

  const sendamtsender = async (sendid, amt) => {
    setState((prevState) => ({
      ...prevState,
      isSendingLoader: true
    }))
    try {
      const response = await client.service('user-inventory').patch(data[0].user_inventory.userInventoryId, {
        quantity: Number(data[0].user_inventory.quantity) - Number(amt),
        walletAmt: Number(amt),
        type: 'transfer',
        fromUserId: id,
        toUserId: sendid
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

  return (
    <div className={styles.menuPanel}>
      {isLoading ? (
        'Loading...'
      ) : (
        <WalletContent
          user={user}
          coinlimit={coinlimit}
          getreceiverid={getreceiverid}
          sendamtsender={sendamtsender}
          sendamtreceiver={sendamtreceiver}
          changeActiveMenu={props.changeActiveMenu}
        />
      )}
    </div>
  )
}

export default Wallet
