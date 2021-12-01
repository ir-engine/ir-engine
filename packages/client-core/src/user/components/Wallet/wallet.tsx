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

export const WalletPage = (): any => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [state, setState] = useState<any>({
    coinData: [],
    walletData: [],
    data: [],
    user: [],
    type: [],
    isLoading: true,
    isLoadingtransfer: false
  })
  const { data, user, type, isLoading, walletData, isLoadingtransfer, coinData } = state

  const authState = useAuthState()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  useEffect(() => {
    if (authState.isLoggedIn.value) {
      fetchInventoryList()
    }
  }, [authState.isLoggedIn.value])

  const fetchInventoryList = async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true
    }))
    try {
      const response = await client.service('user').get(id)
      console.log(response, 'inventory')
      setState((prevState) => ({
        ...prevState,
        data: [...response.inventory_items.filter((val) => val.isCoin === false)],
        coinData: [...response.inventory_items.filter((val) => val.isCoin === true)],
        isLoading: false,
        walletData: [...response.user_wallets]
      }))
      console.log(state, 'inventorylist')
    } catch (err) {
      console.error(err, 'error')
    }
  }

  // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

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
      {isLoading ? 'Loading...' : <WalletContent data={walletData} />}
    </EmptyLayout>
  )
}

export default WalletPage
