import { Paginated } from '@feathersjs/feathers'
import { useEffect } from 'react'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

type RecordingResultFetch = RecordingResult & { 'user.name': string }

export const RECORDING_PAGE_LIMIT = 10

export const AdminRecordingState = defineState({
  name: 'AdminRecordingState',
  initial: () => ({
    recordings: [] as Array<RecordingResultFetch>,
    skip: 0,
    limit: RECORDING_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

const recordingsRetrievedReceptor = (action: typeof AdminRecordingsActions.recordingsRetrieved.matches._TYPE) => {
  const state = getMutableState(AdminRecordingState)
  return state.merge({
    recordings: action.recordingsResult.data,
    skip: action.recordingsResult.skip,
    limit: action.recordingsResult.limit,
    total: action.recordingsResult.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const recordingRemovedReceptor = (_action: typeof AdminRecordingsActions.recordingsRemoved.matches._TYPE) => {
  const state = getMutableState(AdminRecordingState)
  return state.merge({ updateNeeded: true })
}

export const AdminRecordingReceptors = {
  recordingsRetrievedReceptor,
  recordingRemovedReceptor
}

//Service
export const AdminRecordingService = {
  fetchAdminRecordings: async (
    _value: string | null = null,
    $skip = 0,
    sortField = 'createdAt',
    orderBy = 'asc',
    $limit = RECORDING_PAGE_LIMIT
  ) => {
    try {
      let $sort = {}
      if (sortField.length > 0) {
        $sort[sortField] = orderBy === 'desc' ? -1 : 1
      }
      const recordings = (await API.instance.client.service('recording').find({
        query: {
          $skip,
          $sort,
          $limit,
          action: 'admin'
        }
      })) as Paginated<RecordingResultFetch>

      dispatchAction(AdminRecordingsActions.recordingsRetrieved({ recordingsResult: recordings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeRecording: async (id: string) => {
    const recording = (await API.instance.client.service('recording').remove(id)) as RecordingResult
    dispatchAction(AdminRecordingsActions.recordingsRemoved({ recording }))
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = (params) => {
        dispatchAction(AdminRecordingsActions.recordingsRemoved({ recording: params.recording }))
      }
      API.instance.client.service('instance').on('removed', listener)
      return () => {
        API.instance.client.service('instance').off('removed', listener)
      }
    }, [])
  }
}

export class AdminRecordingsActions {
  static recordingsRetrieved = defineAction({
    type: 'ee.client.AdminRecording.RECORDINGS_RETRIEVED',
    recordingsResult: matches.object as Validator<unknown, Paginated<RecordingResultFetch>>
  })

  static recordingsRemoved = defineAction({
    type: 'ee.client.AdminRecording.RECORDING_REMOVED_ROW',
    recording: matches.object as Validator<unknown, RecordingResult>
  })
}

export const AdminSingleRecordingState = defineState({
  name: 'AdminSingleRecordingState',
  initial: () => ({
    recording: null as RecordingResult | null
  })
})

export const AdminSingleRecordingService = {
  fetchSingleAdminRecording: async (id: RecordingResult['id']) => {
    const recording = await API.instance.client.service('recording').get(id)
    dispatchAction(AdminSingleRecordingsActions.recordingsRetrieved({ recording }))
  }
}

export class AdminSingleRecordingsActions {
  static recordingsRetrieved = defineAction({
    type: 'ee.client.AdminSingleRecording.RECORDING_RETRIEVED',
    recording: matches.object as Validator<unknown, RecordingResult>
  })
}

const singleRecordingFetchedReceptor = (
  action: typeof AdminSingleRecordingsActions.recordingsRetrieved.matches._TYPE
) => {
  const state = getMutableState(AdminSingleRecordingState)
  return state.merge({ recording: action.recording })
}

export const AdminSingleRecordingReceptors = {
  singleRecordingFetchedReceptor
}
