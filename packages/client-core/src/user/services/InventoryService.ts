import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { accessInventoryState } from './InventoryState'
import { InventoryAction } from './InventoryAction'

export const InventoryService = {
  getUserInventory: async (userId: String) => {
    const dispatch = useDispatch()
    {
      const inventoryState = accessInventoryState()
      client
        .service('user-inventory')
        .find({
          query: {
            userId,
            $limit: inventoryState.limit.value,
            $skip: inventoryState.skip.value
          }
        })
        .then((res: any) => {
          dispatch(InventoryAction.loadedUserInventory(res))
        })
        .catch((err: any) => {
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
