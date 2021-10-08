/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { PopupsStateAction } from './PopupsStateActions'

export const PopupsStateService = {
  updateCreatorPageState: (state: boolean, id?: string) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeCreatorPage(state, id || null))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateCreatorFormState: (state: boolean) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeCreatorForm(state))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateFeedPageState: (state: boolean, id?: string) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeFeedPage(state, id || null))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateNewFeedPageState: (state: boolean, id?: string, fPath?: string, nameId?: string) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeNewFeedPage(state, id || null, fPath || null, nameId || null))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateShareFormState: (state: boolean, id?: string, imgSrc?: string) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeShareForm(state, id || null, imgSrc || null))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateArMediaState: (state: boolean) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeArMedia(state))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateWebXRState: (state: boolean, itemId: number) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeWebXR(state, itemId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
