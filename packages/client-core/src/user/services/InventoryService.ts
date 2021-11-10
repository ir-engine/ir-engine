import { number } from './../../../../common/src/libs/ts-matches/parsers/SimpleParsers'
import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { accessInventoryState } from './InventoryState'
import { InventoryAction } from './InventoryAction'
import { UserInventoryResult } from '@xrengine/common/src/interfaces/UserInventoryResult'

export const InventoryService = {
  getUserInventory: async (userId: String, limit?: Number, skip?: Number) => {
    const dispatch = useDispatch()
    {
      const inventoryState = accessInventoryState()
      const pageLimit = limit || inventoryState.limit.value
      const pageSkip = skip || inventoryState.skip.value

      dispatch(InventoryAction.loadUserInventory(true))
      client
        .service('user-inventory')
        .find({
          query: {
            $limit: pageLimit,
            $skip: pageSkip
          }
        })
        .then((res: any) => {
          dispatch(InventoryAction.loadedUserInventory(res as UserInventoryResult))
        })
        .catch((err: any) => {
          dispatch(InventoryAction.loadUserInventory(false))
          console.log(err)
        })
    }
  },
  getInventoryType: async () => {
    const dispatch = useDispatch()
    {
      client
        .service('inventory-item-type')
        .find()
        .then((res: any) => {
          dispatch(InventoryAction.inventoryType(res))
        })
        .catch((err: any) => {
          console.log(err)
        })
    }
  }
}
