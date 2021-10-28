import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { InventoryAction } from './InventoryAction'

export const InventoryService = {
  getUserInventory: async (userId: String) => {
    const dispatch = useDispatch()
    {
      client
        .service('user-inventory')
        .get({
          query: {
            userId
          }
        })
        .then((res: any) => {
          console.log(res)
        })
        .catch((err: any) => {
          console.log(err)
        })
    }
  }
}
