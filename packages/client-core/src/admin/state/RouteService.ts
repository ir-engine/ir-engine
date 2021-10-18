import { RouteActions } from './RouteActions'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/state/AlertService'
import { accessAuthState } from '../../user/state/AuthState'

export const RouteService = {
  setRouteActive: async (project: string, route: string, activate: boolean) => {
    const dispatch = useDispatch()
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        await client.service('route-activate').create({ project, route, activate })
        RouteService.fetchActiveRoutes()
      }
    } catch (err) {
      console.error(err)
      AlertService.dispatchAlertError(err.message)
    }
  },
  fetchActiveRoutes: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        const routes = await client.service('route').find()
        dispatch(RouteActions.activeRoutesRetrievedAction(routes))
      }
    } catch (err) {
      console.error(err)
      AlertService.dispatchAlertError(err.message)
    }
  },
  fetchInstalledRoutes: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        const routes = await client.service('routes-installed').find()
        dispatch(RouteActions.installedRoutesRetrievedAction(routes))
      }
    } catch (err) {
      console.error(err)
      AlertService.dispatchAlertError(err.message)
    }
  }
}
