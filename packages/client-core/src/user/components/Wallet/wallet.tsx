import { EmptyLayout } from '../../../common/components/Layout/EmptyLayout'
import { AuthService, useAuthState } from '../../services/AuthService'
import React, { useEffect, useState } from 'react'
import InventoryContent from '../UserMenu/menus/InventoryContent'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { client } from '../../../feathers'
import { bindActionCreators, Dispatch } from 'redux'
import axios from 'axios'
import WalletContent from '../UserMenu/menus/WalletContent'
import https from 'https'

export const WalletPage = (): any => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
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
      const response = await client.service('user').get(id)
      setState((prevState) => ({
        ...prevState,
        data: [...response.inventory_items.filter((val) => val.isCoin === true)],
        coinData: [...response.inventory_items.filter((val) => val.isCoin === true)],
        isLoading: false,
        coinlimit: response.inventory_items.filter((val) => val.isCoin === true)[0].user_inventory.quantity
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
        const activeUser = response.data.filter((val: any) => val.inviteCode !== null && val.id !== id)
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

  const sendamtsender = async (amt) => {
    setState((prevState) => ({
      ...prevState,
      isSendingLoader: true
    }))
    try {
      const response = await client.service('user-inventory').patch(data[0].user_inventory.userInventoryId, {
        quantity: Number(data[0].user_inventory.quantity) - Number(amt),
        walletAmt: Number(amt),
        type: 'transfer'
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
    <EmptyLayout pageTitle={t('Wallet.pageTitle')}>
      <style>
        {' '}
        {`
                [class*=menuPanel] {
                    top: 75px;
                    bottom: initial;
                }
            `}
      </style>
      {isLoading ? (
        'Loading...'
      ) : (
        <WalletContent
          user={user}
          coinlimit={coinlimit}
          getreceiverid={getreceiverid}
          sendamtsender={sendamtsender}
          sendamtreceiver={sendamtreceiver}
        />
      )}
    </EmptyLayout>
  )
}

export default WalletPage
