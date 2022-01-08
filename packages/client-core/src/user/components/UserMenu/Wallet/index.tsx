import React, { useEffect, useState } from 'react'

import { client } from '../../../../feathers'
import { AuthService, useAuthState } from '../../../services/AuthService'
import { WalletService, useWalletState } from '../../../services/WalletService'
import styles from '../UserMenu.module.scss'
import WalletContent from './WalletContent'

interface Props {
  changeActiveMenu?: any
  id: String
}
export const Wallet = (props: Props): any => {
  const WalletState = useWalletState()
  let { data, user, type, coinlimit, isLoading, dataReceive, isLoadingtransfer, coinData, coinDataReceive } =
    WalletState.value

  const authState = useAuthState()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  useEffect(() => {
    if (authState.isLoggedIn.value) {
      WalletService.fetchInventoryList(props.id)
      WalletService.fetchUserList(props.id)
    }
  }, [authState.isLoggedIn.value])

  return (
    <div className={styles.menuPanel}>
      {isLoading ? (
        'Loading...'
      ) : (
        <WalletContent
          user={user}
          ids={props.id}
          coinlimit={coinlimit}
          getreceiverid={WalletService.getreceiverid}
          sendamtsender={WalletService.sendamtsender}
          sendamtreceiver={WalletService.sendamtreceiver}
          changeActiveMenu={props.changeActiveMenu}
          dataReceive={dataReceive}
          data={data}
        />
      )}
    </div>
  )
}

export default Wallet
