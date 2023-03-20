import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@etherealengine/hyperflux'

import { API } from '../../API'

//State
export const StaticResourceState = defineState({
  name: 'StaticResourceState',
  initial: () => ({})
})

export const MediaServiceReceptor = (action) => {
  const s = getState(StaticResourceState)
  matches(action)
}

//Service
export const StaticResourceService = {
  async uploadAudio(url: string) {
    return API.instance.client.service('audio-upload').create({
      url
    })
  },
  async uploadImage(url: string) {
    return API.instance.client.service('image-upload').create({
      url
    })
  },
  async uploadVideo(url: string) {
    return API.instance.client.service('video-upload').create({
      url
    })
  },
  async uploadVolumetric(url: string) {
    return API.instance.client.service('volumetric-upload').create({
      url
    })
  },
  async uploadModel(url: string) {
    return API.instance.client.service('model-upload').create({
      url
    })
  }
}

//Action
export type BooleanAction = { [key: string]: boolean }
export class StaticResourceAction {}
