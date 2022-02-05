import { AuthService, useAuthState } from '../../../services/AuthService'
import React, { useEffect, useState } from 'react'
import { client } from '../../../../feathers'
import { useDispatch, store } from '../../../../store'
import TradingContent from './TradingContent'
import styles from '../UserMenu.module.scss'
import { TradingAction, TradingService, useTradingState } from '../../../services/TradingService'

interface Props {
  changeActiveMenu?: any
  id: String
}

export const Trading = (props: Props): any => {
  const tradingState = useTradingState()
  const dispatch = useDispatch()
  let { data, user, type, isLoading, isLoadingtransfer, inventory, data1, data0 } = tradingState.value

  const authState = useAuthState()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  useEffect(() => {
    if (authState.isLoggedIn.value) {
      TradingService.fetchInventoryList(props.id)
      TradingService.fetchfromTradingList(props.id)
      TradingService.fetchtoTradingList(props.id)
      TradingService.fetchUserList(props.id)
    }
  }, [authState.isLoggedIn.value])

  const removeiteminventory = (index) => {
    const inventorytemp = [...inventory]
    inventorytemp.splice(index, 1)
    dispatch(TradingAction.setinventorydata(inventorytemp))
  }

  const removeofferinventory = (index) => {
    const datatemp = [...data0]
    datatemp.splice(index, 1)
    dispatch(TradingAction.fromTradingList(datatemp))
  }
  const removereceiveinventory = (index) => {
    const datatemp = [...data1]
    datatemp.splice(index, 1)
    dispatch(TradingAction.toTradingList(datatemp))
  }

  const additeminventory = (values) => {
    const inventorytemp = [...inventory]
    inventorytemp.push(values)
    dispatch(TradingAction.setinventorydata(inventorytemp))
  }

  const addofferiteminventory = (values) => {
    const datatemp = [...data0]
    datatemp.push(values)
    dispatch(TradingAction.fromTradingList(datatemp))
  }

  const addreceiveiteminventory = (values) => {
    const datatemp = [...data1]
    datatemp.push(values)
    dispatch(TradingAction.toTradingList(datatemp))
  }

  return (
    <div className={styles.menuPanel}>
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
          propid={props.id}
          changeActiveMenu={props.changeActiveMenu}
          removeiteminventory={removeiteminventory}
          removeofferinventory={removeofferinventory}
          removereceiveinventory={removereceiveinventory}
          additeminventory={additeminventory}
          addofferiteminventory={addofferiteminventory}
          addreceiveiteminventory={addreceiveiteminventory}
          handleTransfer={TradingService.handleTransfer}
          acceptOfferSent={TradingService.acceptOfferSent}
          acceptOfferReceived={TradingService.acceptOfferReceived}
          isLoadingtransfer={isLoadingtransfer}
          rejectOfferSent={TradingService.rejectOfferSent}
          rejectOfferReceived={TradingService.rejectOfferReceived}
        />
      )}
    </div>
  )
}

export default Trading
