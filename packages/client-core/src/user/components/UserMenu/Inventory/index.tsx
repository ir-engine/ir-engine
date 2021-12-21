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
  // const [state, setState] = useState<any>({
  //   coinData: [],
  //   data: [],
  //   user: [],
  //   type: [],
  //   isLoading: true,
  //   isLoadingtransfer: false
  // })
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

  // const handleTransfer = async (ids, itemid) => {
  //   setState((prevState) => ({
  //     ...prevState,
  //     isLoadingtransfer: true
  //   }))
  //   try {
  //     const response = await client.service('user-inventory').patch({
  //       userId: ids,
  //       userInventoryId: itemid
  //     })
  //     fetchInventoryList()
  //   } catch (err) {
  //     console.error(err, 'error')
  //   } finally {
  //     setState((prevState) => ({
  //       ...prevState,
  //       isLoadingtransfer: false
  //     }))
  //   }
  // }

  // const fetchInventoryList = async () => {
  //   setState((prevState) => ({
  //     ...prevState,
  //     isLoading: true
  //   }))
  //   try {
  //     const response = await client.service('user').get(props.id)
  //     console.log(response,props.id,"idses")
  //     setState((prevState) => ({
  //       ...prevState,
  //       data: [...response.inventory_items.filter((val) => val.isCoin === false)],
  //       coinData: [...response.inventory_items.filter((val) => val.isCoin === true)],
  //       isLoading: false
  //     }))
  //   } catch (err) {
  //     console.error(err, 'error')
  //   }
  // }

  // const fetchUserList = async () => {
  //   try {
  //     const response = await client.service('inventory-item').find()
  //     const prevData = [...response.data.filter((val: any) => val.isCoin === true)[0].users]
  //     if (response.data && response.data.length !== 0) {
  //       const activeUser = prevData.filter((val: any) => val.inviteCode !== null && val.id !== props.id)
  //       setState((prevState: any) => ({
  //         ...prevState,
  //         user: [...activeUser],
  //         isLoading: false
  //       }))
  //     }
  //   } catch (err) {
  //     console.error(err, 'error')
  //   }
  // }

  // const fetchtypeList = async () => {
  //   try {
  //     const response = await client.service('inventory-item-type').find()
  //     if (response.data && response.data.length !== 0) {
  //       setState((prevState: any) => ({
  //         ...prevState,
  //         type: [...response.data]
  //       }))
  //     }
  //   } catch (err) {
  //     console.error(err, 'error')
  //   }
  // }

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
