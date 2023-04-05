import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

export const StaticResourceService = {
  async uploadAudio(url: string) {
    return Engine.instance.api.service('audio-upload').create({
      url
    })
  },
  async uploadImage(url: string) {
    return Engine.instance.api.service('image-upload').create({
      url
    })
  },
  async uploadVideo(url: string) {
    return Engine.instance.api.service('video-upload').create({
      url
    })
  },
  async uploadVolumetric(url: string) {
    return Engine.instance.api.service('volumetric-upload').create({
      url
    })
  },
  async uploadModel(url: string) {
    return Engine.instance.api.service('model-upload').create({
      url
    })
  }
}
