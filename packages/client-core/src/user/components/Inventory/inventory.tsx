import { EmptyLayout } from '../../../common/components/Layout/EmptyLayout'
import { AuthService, useAuthState } from '../../services/AuthService'
import React, { useEffect, useState } from 'react'
import InventoryContent from '../UserMenu/menus/InventoryContent'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { client } from '../../../feathers'

export const InventoryPage = (): any => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [state, setState] = useState<any>({ data: [], user: [], isLoading: true, isLoadingtransfer: false })
  const { data, user, isLoading, isLoadingtransfer } = state

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

  const handleTransfer = async (ids, itemid) => {
    setState((prevState) => ({
      ...prevState,
      isLoadingtransfer: true
    }))
    try {
      const response = await client.service('user-inventory').patch({
        userId: ids,
        userInventoryId: itemid
      })
      fetchInventoryList()
      console.log('success')
    } catch (err) {
      console.error(err, 'error')
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoadingtransfer: false
      }))
    }
  }

  const fetchInventoryList = async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true
    }))
    try {
      const response = await client.service('user').get(id)
      console.log(response)
      setState((prevState) => ({
        ...prevState,
        data: [...response.inventory_items],
        isLoading: false
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
      console.log(response)
      if (response.data && response.data.length !== 0) {
        const activeUser = response.data.filter((val: any) => val.inviteCode !== null)
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

  // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

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
        <InventoryContent
          data={data}
          user={user}
          handleTransfer={handleTransfer}
          isLoadingtransfer={isLoadingtransfer}
        />
      )}
    </EmptyLayout>
  )
}

export default InventoryPage
