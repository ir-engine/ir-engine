import { AuthService, useAuthState } from '../../../services/AuthService'
import React, { useEffect, useState } from 'react'
import InventoryContent from './InventoryContent'
import { client } from '../../../../feathers'
import styles from '../UserMenu.module.scss'

interface Props {
  changeActiveMenu?: any
  id: String
}

export const Inventory = (props: Props): any => {
  const [state, setState] = useState<any>({
    coinData: [],
    data: [],
    user: [],
    type: [],
    isLoading: true,
    isLoadingtransfer: false
  })
  const { data, user, type, isLoading, isLoadingtransfer, coinData } = state

  const authState = useAuthState()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  useEffect(() => {
    if (authState.isLoggedIn.value) {
      fetchInventoryList()
      fetchUserList()
      fetchtypeList()
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
      const response = await client.service('user').get(props.id)
      setState((prevState) => ({
        ...prevState,
        data: [...response.inventory_items.filter((val) => val.isCoin === false)],
        coinData: [...response.inventory_items.filter((val) => val.isCoin === true)],
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

  const fetchtypeList = async () => {
    try {
      const response = await client.service('inventory-item-type').find()
      if (response.data && response.data.length !== 0) {
        setState((prevState: any) => ({
          ...prevState,
          type: [...response.data]
        }))
      }
    } catch (err) {
      console.error(err, 'error')
    }
  }

  // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

  return (
    <div className={styles.menuPanel}>
      {isLoading ? (
        'Loading...'
      ) : (
        <InventoryContent
          data={data}
          coinData={coinData}
          user={user}
          type={type}
          changeActiveMenu={props.changeActiveMenu}
          handleTransfer={handleTransfer}
          isLoadingtransfer={isLoadingtransfer}
        />
      )}
    </div>
  )
}

export default Inventory
