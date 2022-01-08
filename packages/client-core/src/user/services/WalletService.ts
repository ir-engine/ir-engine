import { DevTools, Downgraded, createState, none, useState } from '@hookstate/core'

import { Relationship } from '@xrengine/common/src/interfaces/Relationship'
import { RelationshipSeed } from '@xrengine/common/src/interfaces/Relationship'
import { User } from '@xrengine/common/src/interfaces/User'

import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
const state = createState({
  walletData: [] as Array<any>,
  coinlimit: 0,
  coinDataReceive: [] as Array<any>,
  dataReceive: [] as Array<any>,
  walletDataReceive: [] as Array<any>,
  coinData: [] as Array<any>,
  data: [] as Array<any>,
  user: [] as Array<any>,
  type: [] as Array<any>,
  isLoading: false,
  isLoadingtransfer: false,
  isSendingLoader: false
})

store.receptors.push((action: WalletActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_INVENTORY_DATA':
        return s.merge({
          data: [...action.data.filter((val) => val.isCoin === true)],
          coinData: [...action.data.filter((val) => val.isCoin === true)],
          coinlimit: action.data.filter((val) => val.isCoin === true)[0].user_inventory?.quantity
        })
      case 'RECEIVE_ID':
        return s.merge({
          dataReceive: [...action.data.filter((val) => val.isCoin === true)],
          coinDataReceive: [...action.data.filter((val) => val.isCoin === true)]
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
      case 'LOAD_SEND':
        return s.merge({ isSendingLoader: true })
      case 'STOP_LOAD_SEND':
        return s.merge({ isSendingLoader: false })
    }
  }, action.type)
})

export const accessWalletState = () => state
export const useWalletState = () => useState(state) as any as typeof state as unknown as typeof state

//Service
export const WalletService = {
  handleTransfer: async (ids, itemid, inventoryid) => {
    const dispatch = useDispatch()
    dispatch(WalletAction.loadtransfer())
    try {
      const response = await client.service('user-inventory').patch({
        userId: ids,
        userInventoryId: itemid
      })
      WalletService.fetchInventoryList(inventoryid)
    } catch (err) {
      console.error(err, 'error')
    } finally {
      dispatch(WalletAction.stoploadtransfer())
    }
  },

  fetchInventoryList: async (id) => {
    const dispatch = useDispatch()
    dispatch(WalletAction.loadinventory())
    try {
      const response = await client.service('user').get(id)
      dispatch(WalletAction.setinventorydata(response.inventory_items))
    } catch (err) {
      console.error(err, 'error')
    } finally {
      dispatch(WalletAction.stoploadinventory())
    }
  },

  sendamtsender: async (sendid, amt, userid, userquantity, id) => {
    const dispatch = useDispatch()
    dispatch(WalletAction.loadsend())

    try {
      const response = await client.service('user-inventory').patch(userid, {
        quantity: Number(userquantity) - Number(amt),
        walletAmt: Number(amt),
        type: 'transfer',
        fromUserId: id,
        toUserId: sendid
      })
    } catch (err) {
      console.error(err, 'error')
    } finally {
      dispatch(WalletAction.stoploadsend())
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

        dispatch(WalletAction.setuserdata(activeUser))
      }
    } catch (err) {
      console.error(err, 'error')
    }
  },

  getreceiverid: async (receiveid) => {
    const dispatch = useDispatch()
    try {
      const response = await client.service('user').get(receiveid)
      dispatch(WalletAction.getreceiveid(response))
    } catch (err) {
      console.error(err, 'error')
    }
  },

  sendamtreceiver: async (receiveid, amt, userid, quantity) => {
    try {
      const response = await client.service('user-inventory').patch(userid, {
        quantity: Number(quantity) + Number(amt)
      })
    } catch (err) {
      console.error(err, 'error')
    }
  },

  fetchtypeList: async () => {
    const dispatch = useDispatch()

    try {
      const response = await client.service('inventory-item-type').find()
      if (response.data && response.data.length !== 0) {
        dispatch(WalletAction.settypedata(response.data))
      }
    } catch (err) {
      console.error(err, 'error')
    }
  }
}

//Action
export const WalletAction = {
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
  loadsend: () => {
    return {
      type: 'LOAD_SEND' as const
    }
  },
  stoploadsend: () => {
    return {
      type: 'STOP_LOAD_SEND' as const
    }
  },
  setinventorydata: (arr) => {
    return {
      type: 'SET_INVENTORY_DATA' as const,
      data: [...arr]
    }
  },
  getreceiveid: (data) => {
    return {
      type: 'RECEIVE_ID' as const,
      data
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

export type WalletActionType = ReturnType<typeof WalletAction[keyof typeof WalletAction]>
