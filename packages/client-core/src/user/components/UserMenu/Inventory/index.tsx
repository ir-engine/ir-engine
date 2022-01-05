import { AuthService, useAuthState } from '../../../services/AuthService'
import React, { useEffect, useState } from 'react'
import InventoryContent from './InventoryContent'
import styles from '../UserMenu.module.scss'
import { InventoryService, useInventoryState } from '../../../services/InventoryService'

interface Props {
  changeActiveMenu?: any
  id: String
}

export const Inventory = (props: Props): any => {
  const inventoryState = useInventoryState()
  let { data, user, type, isLoading, isLoadingtransfer, coinData } = inventoryState.value
  const authState = useAuthState()
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  useEffect(() => {
    if (authState.isLoggedIn.value) {
      InventoryService.fetchInventoryList(props.id)
      InventoryService.fetchUserList(props.id)
      InventoryService.fetchtypeList()
    }
  }, [authState.isLoggedIn.value])

  return (
    <div className={styles.menuPanel}>
      {isLoading ? (
        'Loading...'
      ) : (
        <InventoryContent
          data={data}
          coinData={coinData}
          user={user}
          id={props.id}
          type={type}
          changeActiveMenu={props.changeActiveMenu}
          InventoryService={InventoryService}
          isLoadingtransfer={isLoadingtransfer}
        />
      )}
    </div>
  )
}

export default Inventory
