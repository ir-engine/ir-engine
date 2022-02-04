import { Relationship } from '@xrengine/common/src/interfaces/Relationship'
import { User } from '@xrengine/common/src/interfaces/User'
import { useDispatch, store } from '../../store'
import { client } from '../../feathers'
import { createState, DevTools, useState, none, Downgraded } from '@speigg/hookstate'
import { RelationshipSeed } from '@xrengine/common/src/interfaces/Relationship'

//State
const state = createState({
  coinData: [] as Array<any>,
  data: [] as Array<any>,
  user: [] as Array<any>,
  type: [] as Array<any>,
  isLoading: false,
  isLoadingtransfer: false
})

store.receptors.push((action: InventoryActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_INVENTORY_DATA':
        return s.merge({
          data: [...action.data.filter((val) => val.isCoin === false)],
          coinData: [...action.data.filter((val) => val.isCoin === true)]
        })
      case 'SET_USER_DATA':
        return s.merge({
          user: [...action.user]
        })
      case 'SET_TYPE_DATA':
        return s.merge({
          type: [...action.types]
        })
      case 'LOAD_TRANFER':
        return s.merge({ isLoadingtransfer: true })
      case 'STOP_LOAD_TRANFER':
        return s.merge({ isLoadingtransfer: false })
      case 'LOAD_INVENTORY':
        return s.merge({ isLoading: true })
      case 'STOP_LOAD_INVENTORY':
        return s.merge({ isLoading: false })
    }
  }, action.type)
})

export const accessInventoryState = () => state
export const useInventoryState = () => useState(state) as any as typeof state as unknown as typeof state

//Service
export const InventoryService = {
  handleTransfer: async (ids, itemid, inventoryid) => {
    const dispatch = useDispatch()
    dispatch(InventoryAction.loadtransfer())
    try {
      const response = await client.service('user-inventory').patch({
        userId: ids,
        userInventoryId: itemid
      })
      InventoryService.fetchInventoryList(inventoryid)
    } catch (err) {
      console.error(err, 'error')
    } finally {
      dispatch(InventoryAction.stoploadtransfer())
    }
  },

  fetchInventoryList: async (id) => {
    const dispatch = useDispatch()
    dispatch(InventoryAction.loadinventory())
    try {
      const response = await client.service('user').get(id)
      dispatch(InventoryAction.setinventorydata(response.inventory_items))
    } catch (err) {
      console.error(err, 'error')
    } finally {
      dispatch(InventoryAction.stoploadinventory())
    }
  },

  fetchUserList: async (id) => {
    const dispatch = useDispatch()
    try {
      const response = await client.service('inventory-item').find({
        query: {
          isCoin: true
        }
      })
      const resp = response?.data[0]
      const prevData = [...resp?.users]
      if (response.data && response.data.length !== 0) {
        const activeUser = prevData.filter((val: any) => val.inviteCode !== null && val.id !== id)

        dispatch(InventoryAction.setuserdata(activeUser))
      }
    } catch (err) {
      console.error(err, 'error')
    }
  },

  fetchtypeList: async () => {
    const dispatch = useDispatch()

    try {
      const response = await client.service('inventory-item-type').find()
      if (response.data && response.data.length !== 0) {
        dispatch(InventoryAction.settypedata(response.data))
      }
    } catch (err) {
      console.error(err, 'error')
    }
  }
}

//Action
export const InventoryAction = {
  loadtransfer: () => {
    return {
      type: 'LOAD_TRANFER' as const
    }
  },
  stoploadtransfer: () => {
    return {
      type: 'STOP_LOAD_TRANFER' as const
    }
  },
  loadinventory: () => {
    return {
      type: 'LOAD_INVENTORY' as const
    }
  },
  stoploadinventory: () => {
    return {
      type: 'STOP_LOAD_INVENTORY' as const
    }
  },
  setinventorydata: (arr) => {
    return {
      type: 'SET_INVENTORY_DATA' as const,
      data: [...arr]
    }
  },
  setuserdata: (userarr) => {
    return {
      type: 'SET_USER_DATA' as const,
      user: [...userarr]
    }
  },
  settypedata: (typearr) => {
    return {
      type: 'SET_TYPE_DATA' as const,
      types: [...typearr]
    }
  }
}

export type InventoryActionType = ReturnType<typeof InventoryAction[keyof typeof InventoryAction]>
