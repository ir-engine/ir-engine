import { Dispatch } from 'redux'
import { RouteActions } from './RouteActions'
import { AlertService } from '../../../../common/reducers/alert/AlertService'
import { ErrorAction } from '../../../../common/reducers/error/ErrorActions'
import { client } from '../../../../feathers'
import { accessRouteState } from './RouteState'

export const RouteService = {}
