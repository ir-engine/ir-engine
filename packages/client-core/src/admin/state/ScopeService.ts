import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { ScopeAction } from './ScopeActions'
import { AlertService } from '../../common/state/AlertService'
import { accessScopeState } from './ScopeState'

export const ScopeService = {
  createScope: async (scopeItem: any) => {
    const dispatch = useDispatch()
    {
      try {
        const newItem = await client.service('scope').create({
          ...scopeItem
        })
        dispatch(ScopeAction.addAdminScope(newItem))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getScopeService: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const scopeState = accessScopeState()
      const skip = scopeState.scope.skip.value
      const limit = scopeState.scope.limit.value
      try {
        dispatch(ScopeAction.fetchingScope())
        const list = await client.service('scope').find({
          query: {
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit
          }
        })
        dispatch(ScopeAction.setAdminScope(list))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateScopeService: async (scopeId, scopeItem) => {
    const dispatch = useDispatch()
    {
      try {
        const updatedScope = await client.service('scope').patch(scopeId, {
          ...scopeItem
        })
        dispatch(ScopeAction.updateAdminScope(updatedScope))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeScope: async (scopeId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('scope').remove(scopeId)
        dispatch(ScopeAction.removeScopeItem(scopeId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getScopeTypeService: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const scopeState = accessScopeState()
      const skip = scopeState.scopeType.skip.value
      const limit = scopeState.scopeType.limit.value
      try {
        const result = await client.service('scope-type').find({
          query: {
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit
          }
        })
        dispatch(ScopeAction.getScopeType(result))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
