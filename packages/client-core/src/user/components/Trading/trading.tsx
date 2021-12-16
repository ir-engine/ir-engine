import { EmptyLayout } from '../../../common/components/Layout/EmptyLayout'
import { AuthService, useAuthState } from '../../services/AuthService'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { client } from '../../../feathers'
import { bindActionCreators, Dispatch } from 'redux'
import axios from 'axios'
import TradingContent from '../UserMenu/menus/TradingContent'

export const TradingPage = (): any => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [state, setState] = useState<any>({
    data: [],
    data1: [],
    data0: [],
    inventory: [],
    user: [],
    type: [],
    isLoading: true,
    isLoadingtransfer: false
  })
  const { data, user, type, isLoading, isLoadingtransfer, inventory, data1, data0 } = state

  const authState = useAuthState()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  useEffect(() => {
    if (authState.isLoggedIn.value) {
      fetchInventoryList()
      fetchfromTradingList()
      fetchtoTradingList(), fetchUserList()
    }
  }, [authState.isLoggedIn.value])

  const handleTransfer = async (ids, items) => {
    setState((prevState) => ({
      ...prevState,
      isLoadingtransfer: true
    }))
    const data = {
      fromUserId: id,
      toUserId: ids,
      fromUserInventoryIds: [...items],
      fromUserStatus: 'REQUEST',
      toUserStatus: 'REQUEST'
    }

    try {
      const response = await client.service('user-trade').create(data)
      if (response) {
        fetchInventoryList()
        fetchfromTradingList()
        fetchtoTradingList()
      }
    } catch (err) {
      console.error(err, 'error')
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoadingtransfer: false
      }))
    }
  }

  const acceptOfferSent = async (tradeId, items) => {
    setState((prevState) => ({
      ...prevState,
      isLoadingtransfer: true
    }))
    const data = {
      fromUserInventoryIds: items,
      fromUserStatus: 'ACCEPT'
    }

    try {
      const response = await client.service('user-trade').patch(tradeId, data)
      if (response) {
        fetchInventoryList()
        fetchfromTradingList()
        fetchtoTradingList()
      }
    } catch (err) {
      console.error(err, 'error')
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoadingtransfer: false
      }))
      localStorage.removeItem('tradeId')
    }
  }

  const acceptOfferReceived = async (tradeId, items) => {
    setState((prevState) => ({
      ...prevState,
      isLoadingtransfer: true
    }))
    const data = {
      toUserInventoryIds: items,
      toUserStatus: 'ACCEPT'
    }

    try {
      const response = await client.service('user-trade').patch(tradeId, data)
      if (response) {
        fetchInventoryList()
        fetchfromTradingList()
        fetchtoTradingList()
      }
    } catch (err) {
      console.error(err, 'error')
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoadingtransfer: false
      }))
      localStorage.removeItem('tradeId')
    }
  }

  const rejectOfferSent = async (tradeId, items) => {
    setState((prevState) => ({
      ...prevState,
      isLoadingtransfer: true
    }))
    const data = {
      fromUserStatus: 'REJECT'
    }

    try {
      const response = await client.service('user-trade').patch(tradeId, data)
      if (response) {
        fetchInventoryList()
        fetchfromTradingList()
        fetchtoTradingList()
      }
    } catch (err) {
      console.error(err, 'error')
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoadingtransfer: false
      }))
      localStorage.removeItem('tradeId')
    }
  }

  const rejectOfferReceived = async (tradeId, items) => {
    setState((prevState) => ({
      ...prevState,
      isLoadingtransfer: true
    }))
    const data = {
      toUserStatus: 'REJECT'
    }

    try {
      const response = await client.service('user-trade').patch(tradeId, data)
      if (response) {
        fetchInventoryList()
        fetchfromTradingList()
        fetchtoTradingList()
      }
    } catch (err) {
      console.error(err, 'error')
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoadingtransfer: false
      }))
      localStorage.removeItem('tradeId')
    }
  }

  const fetchfromTradingList = async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true
    }))
    try {
      const response = await client.service('user-trade').find({ query: { fromUserId: id } })
      setState((prevState) => ({
        ...prevState,
        data0: [...response.data],
        isLoading: false
      }))
    } catch (err) {
      console.error(err, 'error')
    }
  }

  const fetchtoTradingList = async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true
    }))
    try {
      const response = await client.service('user-trade').find({ query: { toUserId: id } })
      setState((prevState) => ({
        ...prevState,
        data1: [...response.data],
        isLoading: false
      }))
    } catch (err) {
      console.error(err, 'error')
    }
  }

  const fetchInventoryList = async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true
    }))
    try {
      const response = await client.service('user').get(id)
      setState((prevState) => ({
        ...prevState,
        inventory: [...response.inventory_items.filter((val) => val.isCoin === false)],
        isLoading: false
      }))
    } catch (err) {
      console.error(err, 'error')
    }
  }

  const removeiteminventory = (index) => {
    const inventorytemp = [...inventory]
    inventorytemp.splice(index, 1)
    setState((prevState) => ({
      ...prevState,
      inventory: [...inventorytemp]
    }))
  }

  const removeofferinventory = (index) => {
    const datatemp = [...data0]
    datatemp.splice(index, 1)
    setState((prevState) => ({
      ...prevState,
      data0: [...datatemp]
    }))
  }
  const removereceiveinventory = (index) => {
    const datatemp = [...data1]
    datatemp.splice(index, 1)

    setState((prevState) => ({
      ...prevState,
      data1: [...datatemp]
    }))
  }

  const additeminventory = (values) => {
    const inventorytemp = [...inventory]
    inventorytemp.push(values)
    setState((prevState) => ({
      ...prevState,
      inventory: [...inventorytemp]
    }))
  }

  const addofferiteminventory = (values) => {
    const datatemp = [...data0]
    datatemp.push(values)
    setState((prevState) => ({
      ...prevState,
      data0: [...datatemp]
    }))
  }

  const addreceiveiteminventory = (values) => {
    const datatemp = [...data1]
    datatemp.push(values)
    setState((prevState) => ({
      ...prevState,
      data1: [...datatemp]
    }))
  }

  const fetchUserList = async () => {
    try {
      const response = await client.service('inventory-item').find()
      const prevData = [...response.data.filter((val: any) => val.isCoin === true)[0].users]
      if (response.data && response.data.length !== 0) {
        const activeUser = prevData.filter((val: any) => val.inviteCode !== null && val.id !== id)
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

  return (
    <EmptyLayout pageTitle={t('Inventory.pageTitle')}>
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
        <TradingContent
          data={data}
          data1={data1}
          data0={data0}
          inventory={inventory}
          user={user}
          type={type}
          removeiteminventory={removeiteminventory}
          removeofferinventory={removeofferinventory}
          removereceiveinventory={removereceiveinventory}
          additeminventory={additeminventory}
          addofferiteminventory={addofferiteminventory}
          addreceiveiteminventory={addreceiveiteminventory}
          handleTransfer={handleTransfer}
          acceptOfferSent={acceptOfferSent}
          acceptOfferReceived={acceptOfferReceived}
          isLoadingtransfer={isLoadingtransfer}
          rejectOfferSent={rejectOfferSent}
          rejectOfferReceived={rejectOfferReceived}
        />
      )}
    </EmptyLayout>
  )
}

export default TradingPage
