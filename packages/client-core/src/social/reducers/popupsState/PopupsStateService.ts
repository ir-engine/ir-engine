/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { PopupsStateAction } from './PopupsStateActions'

export const PopupsStateService = {
  updateCreatorPageState: (state: boolean, id?: string) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeCreatorPage(state, id))
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
        dispatch(PopupsStateAction.changeFeedPage(state, id))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateNewFeedPageState: (state: boolean, id?: string, fPath?: string, nameId?: string) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeNewFeedPage(state, id, fPath, nameId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateShareFormState: (state: boolean, id?: string, imgSrc?: string) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(PopupsStateAction.changeShareForm(state, id, imgSrc))
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
