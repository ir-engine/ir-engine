/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/state/AlertService'
import { PopupsStateAction } from './PopupsStateActions'

export const PopupsStateService = {
  updateCreatorPageState: async (state: boolean, id?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeCreatorPage(state, id))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateCreatorFormState: async (state: boolean) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeCreatorForm(state))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateFeedPageState: async (state: boolean, id?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeFeedPage(state, id))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateNewFeedPageState: async (state: boolean, id?: string, fPath?: string, nameId?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeNewFeedPage(state, id, fPath, nameId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateShareFormState: async (state: boolean, id?: string, imgSrc?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeShareForm(state, id, imgSrc))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateArMediaState: async (state: boolean) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeArMedia(state))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateWebXRState: async (state: boolean, itemId: number) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeWebXR(state, itemId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
