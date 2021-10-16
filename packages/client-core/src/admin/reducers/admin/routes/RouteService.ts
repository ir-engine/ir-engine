import { RouteActions } from './RouteActions'
import { AlertService } from '../../../../common/reducers/alert/AlertService'
import { client } from '../../../../feathers'
import { accessAuthState } from '../../../../user/reducers/auth/AuthState'
import Store from '../../../../store'

export const RouteService = {
  setRouteActive: async (project: string, route: string, activate: boolean) => {
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        await client.service('route-activate').create({ project, route, activate })
        RouteService.fetchActiveRoutes()
      }
    } catch (err) {
      console.error(err)
      AlertService.dispatchAlertError(Store.store.dispatch, err.message)
    }
  },
  fetchActiveRoutes: async (incDec?: 'increment' | 'decrement') => {
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        const routes = await client.service('route').find()
        Store.store.dispatch(RouteActions.activeRoutesRetrievedAction(routes))
      }
    } catch (err) {
      console.error(err)
      AlertService.dispatchAlertError(Store.store.dispatch, err.message)
    }
  },
  fetchInstalledRoutes: async (incDec?: 'increment' | 'decrement') => {
    const user = accessAuthState().user
    try {
      if (user.userRole.value === 'admin') {
        const routes = await client.service('routes-installed').find()
        Store.store.dispatch(RouteActions.installedRoutesRetrievedAction(routes))
      }
    } catch (err) {
      console.error(err)
      AlertService.dispatchAlertError(Store.store.dispatch, err.message)
    }
  }
}
