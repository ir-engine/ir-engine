import assert from 'assert'
import Hls from 'hls.js'
import proxyquire from 'proxyquire'
import { LinearFilter, Mesh, Object3D, sRGBEncoding } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VideoComponent, VideoComponentType } from '../../components/VideoComponent'
import { SCENE_COMPONENT_VIDEO, SCENE_COMPONENT_VIDEO_DEFAULT_VALUES } from './VideoFunctions'

class Media {
  paused: boolean = false
  stop() {
    this.paused = true
  }
  pause() {
    this.paused = true
  }
  play() {
    this.paused = false
  }
}

const testURLs = {
  'fakePath.mp4': { url: 'fakePath.mp4', contentType: 'video/mpeg', buffer: 123 },
  'test.mp4': { url: 'test.mp4', contentType: 'video/mpeg', buffer: 123 },
  noBuffer: { url: 'noBuffer', contentType: 'video/mpeg' }
}

describe('VideoFunctions', () => {
  let entity: Entity
  let videoFunctions = proxyquire('./VideoFunctions', {
    '../../../common/functions/isClient': { isClient: true }
    // '../../../common/functions/resolveMedia': {
    //   resolveMedia: (url: string) => {
    //     return testURLs[url]
    //   }
    // }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    addComponent(entity, MediaComponent, { autoplay: true })
    const obj3d = addComponent(entity, Object3DComponent, { value: new Object3D() }).value
    obj3d.userData.mesh = new Mesh()
  })

  const sceneComponentData = {
    videoSource: testURLs['test.mp4'].url,
    elementId: 'Element Id 123'
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_VIDEO,
    props: sceneComponentData
  }

  describe('deserializeVideo', () => {
    it('does not create Video Component while not on client side', () => {
      const _videoFunctions = proxyquire('./VideoFunctions', {
        '../../../common/functions/isClient': { isClient: false }
      })
      _videoFunctions.deserializeVideo(entity, sceneComponent)

      const videoComponent = getComponent(entity, VideoComponent)
      assert(!videoComponent)
    })

    it('creates Video Component with provided component data', () => {
      videoFunctions.deserializeVideo(entity, sceneComponent)

      const videoComponent = getComponent(entity, VideoComponent)
      assert(videoComponent)
      assert.deepEqual(videoComponent, sceneComponentData)

      const mediaComponent = getComponent(entity, MediaComponent)
      assert(mediaComponent.el)
      assert(mediaComponent.el.muted)
      assert(mediaComponent.el.hidden)
      assert(mediaComponent.el.getAttribute('crossOrigin') === 'anonymous')
      assert(mediaComponent.el.getAttribute('loop') === 'true')
      assert(mediaComponent.el.getAttribute('preload') === 'metadata')
      assert(mediaComponent.el.getAttribute('playsInline') === 'true')
      assert(mediaComponent.el.getAttribute('playsinline') === 'true')
      assert(mediaComponent.el.getAttribute('webkit-playsInline') === 'true')
      assert(mediaComponent.el.getAttribute('webkit-playsinline') === 'true')
      assert(mediaComponent.el.getAttribute('muted') === 'true')
      assert(document.body.firstChild)
    })

    it('creates Video Object3D if none is there', () => {
      videoFunctions.deserializeVideo(entity, sceneComponent)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d, 'Video is not created')
      assert(obj3d.userData.videoEl)
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      videoFunctions.deserializeVideo(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_VIDEO))
    })
  })

  describe('updateVideo()', () => {
    let videoComponent: VideoComponentType
    let obj3d: Object3D

    beforeEach(() => {
      videoFunctions.deserializeVideo(entity, sceneComponent)
      videoComponent = getComponent(entity, VideoComponent) as VideoComponentType
      obj3d = getComponent(entity, Object3DComponent)?.value
    })

    describe('Property tests for "elementId"', () => {
      it('should not update property', () => {
        videoFunctions.updateVideo(entity, {})

        assert(videoComponent.elementId === sceneComponentData.elementId)
        assert(obj3d.userData.videoEl.id === sceneComponentData.elementId)
      })

      it('should update property', () => {
        const newId = 'New Element ID'
        videoComponent.elementId = newId
        videoFunctions.updateVideo(entity, { elementId: newId })

        assert(obj3d.userData.videoEl.id === newId)

        videoFunctions.updateVideo(entity, { elementId: 'Fake Id' })
        assert(obj3d.userData.videoEl.id === newId, 'should not update property to passed value')
      })
    })

    describe('Property tests for "videoSource"', () => {
      it('should not update property', () => {
        videoFunctions.updateVideo(entity, {})

        assert(videoComponent.videoSource === sceneComponentData.videoSource)
        assert(obj3d.userData.videoEl.src === sceneComponentData.videoSource)
      })

      it('should update property', async () => {
        const newSource = 'fakePath.mp4'
        videoComponent.videoSource = newSource
        await videoFunctions.updateVideo(entity, { videoSource: newSource })

        assert(obj3d.userData.videoEl.src === newSource)

        videoFunctions.updateVideo(entity, { videoSource: 'newFakepath.mp4' })
        assert(obj3d.userData.videoEl.src === newSource, 'should not update property to passed value')
        assert(obj3d.userData.videoEl.currentTime === 1)
        assert(obj3d.userData.mesh.material.map.encoding === sRGBEncoding)
        assert(obj3d.userData.mesh.material.map.minFilter === LinearFilter)
      })
    })
  })

  describe('serializeVideo()', () => {
    it('should properly serialize video', () => {
      videoFunctions.deserializeVideo(entity, sceneComponent)
      assert.deepEqual(videoFunctions.serializeVideo(entity), sceneComponent)
    })

    it('should return undefine if there is no video component', () => {
      assert(videoFunctions.serializeVideo(entity) === undefined)
    })
  })

  describe('parseVideoProperties()', () => {
    it('should use default component values', () => {
      const componentData = videoFunctions.parseVideoProperties({})
      assert(componentData.videoSource === SCENE_COMPONENT_VIDEO_DEFAULT_VALUES.videoSource)
      assert(componentData.elementId.includes('video-'))
    })

    it('should use passed values', () => {
      const componentData = videoFunctions.parseVideoProperties({ ...sceneComponentData })
      assert.deepEqual(componentData, sceneComponentData)
    })
  })

  describe('toggleVideo()', () => {
    it('should properly toggle video', async () => {
      const obj3d = getComponent(entity, Object3DComponent).value
      obj3d.userData.videoEl = new Media()
      obj3d.userData.audioEl = new Media()

      let prevStateVideo = obj3d.userData.videoEl.paused
      let prevStateAudio = obj3d.userData.audioEl.paused
      videoFunctions.toggleVideo(entity)

      assert(obj3d.userData.videoEl.paused !== prevStateVideo)
      assert(obj3d.userData.audioEl.paused !== prevStateAudio)

      prevStateVideo = obj3d.userData.videoEl.paused
      prevStateAudio = obj3d.userData.audioEl.paused
      videoFunctions.toggleVideo(entity)

      assert(obj3d.userData.videoEl.paused !== prevStateVideo)
      assert(obj3d.userData.audioEl.paused !== prevStateAudio)
    })

    it('should do nothing if no audio component is there', async () => {
      const entity = createEntity()
      videoFunctions.toggleVideo(entity)
      assert(true)
    })
  })

  describe('prepareVideoForGLTFExport()', () => {
    let video: Object3D = new Object3D()
    let videoEl: Object3D = new Object3D()
    let textureMesh: Object3D = new Object3D()

    describe('Video Element', () => {
      beforeEach(() => {
        video = new Object3D()
        videoEl = new Object3D()
        video.userData.videoEl = videoEl
        video.add(videoEl)
      })

      it('should remove video element', () => {
        videoFunctions.prepareVideoForGLTFExport(video)
        assert(!video.children.includes(videoEl))
        assert(!video.userData.videoEl)
      })
    })

    describe('Video Texture mesh', () => {
      beforeEach(() => {
        video = new Object3D()
        textureMesh = new Object3D()
        video.userData.mesh = textureMesh
        video.add(textureMesh)
      })

      it('should remove texture mesh', () => {
        videoFunctions.prepareVideoForGLTFExport(video)
        assert(!video.children.includes(video.userData.mesh))
        assert(!video.userData.mesh)
      })
    })
  })

  describe('setupHLS()', () => {
    it('returns Hls object', () => {
      const res = videoFunctions.setupHLS(entity, 'fake.mp4')
      document.dispatchEvent(new Event(Hls.Events.MEDIA_ATTACHED))
      document.dispatchEvent(new Event(Hls.Events.MANIFEST_PARSED))

      assert(res instanceof Hls)
    })
  })
})
