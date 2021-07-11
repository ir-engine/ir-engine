/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { dispatchAlertError } from '../../../common/reducers/alert/service'
import {
  changeCreatorPage,
  changeCreatorForm,
  changeFeedPage,
  changeArMedia,
  changeNewFeedPage,
  changeShareForm,
  changeWebXR
} from './actions'

export function updateCreatorPageState(state: boolean, id?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(changeCreatorPage(state, id || null))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateCreatorFormState(state: boolean) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(changeCreatorForm(state))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateFeedPageState(state: boolean, id?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(changeFeedPage(state, id || null))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateNewFeedPageState(state: boolean, id?: string, fPath?: string, nameId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(changeNewFeedPage(state, id || null, fPath || null, nameId || null))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateShareFormState(state: boolean, id?: string, imgSrc?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(changeShareForm(state, id || null, imgSrc || null))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateArMediaState(state: boolean) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(changeArMedia(state))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateWebXRState(state: boolean, itemId: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(changeWebXR(state, itemId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
