/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { AlertService } from '../../common/services/AlertService'
import { client } from '../../feathers'
import { useDispatch, store } from '../../store'
import { upload } from '../../util/upload'
import { TheFeedsShort, TheFeeds } from '@xrengine/common/src/interfaces/Feeds'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
const state = createState({
  thefeeds: [] as Array<TheFeeds>,
  fetching: false
})

store.receptors.push((action: TheFeedsActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'THEFEEDS_FETCH':
        return s.fetching.set(true)
      case 'THEFEEDS_RETRIEVED':
        return s.merge({ thefeeds: action.thefeeds, fetching: false })
      case 'ADD_THEFEEDS':
        return s.thefeeds.set([...s.thefeeds.value, action.thefeeds])
      case 'UPDATE_THEFEEDS':
        return s.thefeeds.set(
          s.thefeeds.value.map((thefeeds) => {
            if (thefeeds.id === action.thefeeds.id) {
              return { ...thefeeds, ...action.thefeeds }
            }
            return { ...thefeeds }
          })
        )
      case 'REMOVE_THEFEEDS':
        return s.thefeeds.set([...s.thefeeds.value.filter((thefeeds) => thefeeds.id !== action.thefeeds)])
    }
  }, action.type)
})

export const accessTheFeedsState = () => state
export const useTheFeedsState = () => useState(state)

//Service
export const TheFeedsService = {
  getTheFeedsNew: async () => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(TheFeedsAction.fetchingTheFeeds())
        const thefeeds = await client.service('thefeeds').find()
        dispatch(TheFeedsAction.thefeedsRetrieved(thefeeds.data))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  createTheFeedsNew: async (data) => {
    const dispatch = useDispatch()
    {
      try {
        const storedVideo = await upload(data.video, null)
        console.log('storedVideo', storedVideo)
        const thefeeds = await client.service('thefeeds').create({
          title: data.title,
          videoId: (storedVideo as any).file_id,
          description: data.description
        })
        dispatch(TheFeedsAction.addTheFeeds(thefeeds))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  updateTheFeedsAsAdmin: async (data: any) => {
    const dispatch = useDispatch()
    {
      try {
        let thefeeds = { id: data.id, title: data.title, videoId: data.video, description: data.description }
        if (typeof data.video === 'object') {
          const storedVideo = await upload(data.video, null)
          thefeeds['videoId'] = (storedVideo as any).file_id
        }
        const updatedItem = await client.service('thefeeds').patch(thefeeds.id, thefeeds)
        dispatch(TheFeedsAction.updateTheFeedsInList(updatedItem))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  removeTheFeeds: async (thefeedsId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('thefeeds').remove(thefeedsId)
        dispatch(TheFeedsAction.deleteTheFeeds(thefeedsId))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  }
}

// Action
export const TheFeedsAction = {
  thefeedsRetrieved: (thefeeds: TheFeeds[]) => {
    return {
      type: 'THEFEEDS_RETRIEVED' as const,
      thefeeds: thefeeds
    }
  },
  fetchingTheFeeds: () => {
    return {
      type: 'THEFEEDS_FETCH' as const
    }
  },
  deleteTheFeeds: (thefeedsId: string) => {
    return {
      type: 'REMOVE_THEFEEDS' as const,
      thefeeds: thefeedsId
    }
  },
  addTheFeeds: (thefeeds: TheFeeds) => {
    return {
      type: 'ADD_THEFEEDS' as const,
      thefeeds: thefeeds
    }
  },
  updateTheFeedsInList: (thefeeds: TheFeeds) => {
    return {
      type: 'UPDATE_THEFEEDS' as const,
      thefeeds: thefeeds
    }
  },
  addTheFeedsFire: (thefeeds: string) => {
    return {
      type: 'ADD_THEFEEDS_FIRES' as const,
      thefeeds: thefeeds
    }
  },
  removeTheFeedsFire: (thefeeds: string) => {
    return {
      type: 'REMOVE_THEFEEDS_FIRES' as const,
      thefeeds: thefeeds
    }
  }
}
//The code below is not in use END

export type TheFeedsActionType = ReturnType<typeof TheFeedsAction[keyof typeof TheFeedsAction]>
