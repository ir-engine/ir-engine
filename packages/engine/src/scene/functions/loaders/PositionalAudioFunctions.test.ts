import assert from 'assert'
import proxyquire from 'proxyquire'
import { Object3D } from 'three'

import { PositionalAudioComponent } from '../../../audio/components/PositionalAudioComponent'
import { AudioType, AudioTypeType } from '../../../audio/constants/AudioConstants'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, ComponentType, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import { Object3DComponent } from '../../components/Object3DComponent'
import { deserializePositionalAudio } from './PositionalAudioFunctions'

const testURLs = {
  noContentType: { url: 'noContentType' },
  'test.mp3': { url: 'test.mp3', contentType: 'audio/mpeg', buffer: 123 },
  noBuffer: { url: 'noBuffer', contentType: 'audio/mpeg' }
}

class Audio extends Object3D {
  loop: boolean
  isPlaying: boolean
  buffer: any
  volume: number
  distanceModel: DistanceModelType
  rolloffFactor: number
  refDistance: number
  maxDistance: number
  panner = {}
  setLoop(loop: boolean) {
    this.loop = loop
  }
  setBuffer(buffer: any) {
    this.buffer = buffer
  }
  stop() {
    this.isPlaying = false
  }
  play() {
    this.isPlaying = true
  }
  setVolume(volume: number) {
    this.volume = volume
  }
  setDistanceModel(distanceModel: DistanceModelType) {
    this.distanceModel = distanceModel
  }
  setRolloffFactor(rolloffFactor: number) {
    this.rolloffFactor = rolloffFactor
  }
  setRefDistance(refDistance: number) {
    this.refDistance = refDistance
  }
  setMaxDistance(maxDistance: number) {
    this.maxDistance = maxDistance
  }
}

class PositionalAudio extends Audio {}

describe.skip('AudioFunctions', () => {
  let entity: Entity
  let audioFunctions = proxyquire('./PositionalAudioFunctions', {
    '../../../common/functions/isClient': { isClient: true },
    three: {
      Audio: Audio,
      PositionalAudio: PositionalAudio
    }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)
  })

  const sceneComponentData = {
    audioSource: 'test.mp3',
    volume: Math.random(),
    audioType: AudioType.Positional as AudioTypeType,
    distanceModel: 'linear' as DistanceModelType,
    rolloffFactor: Math.random(),
    refDistance: Math.random(),
    maxDistance: Math.random(),
    coneInnerAngle: Math.random(),
    coneOuterAngle: Math.random(),
    coneOuterGain: Math.random()
  }

  describe('deserializePositionalAudio()', () => {
    describe('Object 3D Tests', () => {
      it('add object 3d component if not present', () => {
        deserializePositionalAudio(entity, sceneComponentData)
        assert(hasComponent(entity, Object3DComponent))
      })
    })

    describe('Client vs Server', () => {
      it('will add audio component while running on client', () => {
        audioFunctions.deserializePositionalAudio(entity, sceneComponentData)
        assert(hasComponent(entity, PositionalAudioComponent))
      })

      it('will not add audio component while running on server', () => {
        const _audioFunctions = proxyquire('./PositionalAudioFunctions', {
          '../../../common/functions/isClient': {
            isClient: false
          }
        })

        _audioFunctions.deserializePositionalAudio(entity, sceneComponentData)
        assert(!hasComponent(entity, PositionalAudioComponent))
      })
    })

    it('sets loop and autoplay', () => {
      // addComponent(entity, MediaComponent, { autoplay: true, loop: true } as MediaComponentType)
      audioFunctions.deserializePositionalAudio(entity, sceneComponentData)

      const obj3d = getComponent(entity, Object3DComponent).value
      assert(obj3d.userData.audioEl.autoplay === true, 'Autoplay is not being set')
      assert(obj3d.userData.audioEl.loop === true, 'Loop is not being set')
    })
  })

  describe('updateAudio()', () => {
    let positionalAudio: any
    let obj3d: Object3D

    beforeEach(() => {
      audioFunctions.deserializePositionalAudio(entity, sceneComponentData)
      positionalAudio = getComponent(entity, PositionalAudioComponent)
      obj3d = getComponent(entity, Object3DComponent)?.value as Object3D
    })

    describe('Property tests for "audioType"', () => {
      it('should not update property', () => {
        audioFunctions.updateAudio(entity, {})
        assert(obj3d.userData.audioEl instanceof PositionalAudio)
      })

      it('should update property', () => {
        audioFunctions.updateAudio(entity, { audioType: AudioType.Stereo })

        assert(obj3d.userData.audioEl instanceof Audio)

        audioFunctions.updateAudio(entity, { audioType: AudioType.Positional })
        assert(obj3d.userData.audioEl.constructor === Audio, 'should not update property to passed value')
      })
    })

    // describe('Property tests for "audioSource"', () => {
    //   it('should not update property', () => {
    //     audioFunctions.updateAudio(entity, {})

    //     assert(audioComponent.audioSource === sceneComponentData.audioSource)
    //   })

    //   it('should add error component if some error occurs while fetching data', () => {
    //     audioComponent.audioSource = 'error'
    //     audioFunctions.updateAudio(entity, { audioSource: 'error' })
    //     assert(hasComponent(entity, ErrorComponent))
    //   })

    //   it('should add error component if content type of source can not be determined', () => {
    //     audioComponent.audioSource = 'noContentType'
    //     audioFunctions.updateAudio(entity, { audioSource: 'noContentType' })
    //     assert(hasComponent(entity, ErrorComponent))
    //   })

    //   it('should not update buffer', () => {
    //     audioComponent.audioSource = 'noBuffer'
    //     const num = Math.random()
    //     obj3d.userData.audioEl.buffer = num
    //     audioFunctions.updateAudio(entity, { audioSource: audioComponent.audioSource })

    //     assert.equal(obj3d.userData.audioEl.buffer, num)
    //   })

    //   it('should update property', () => {
    //     obj3d.userData.audioEl.isPlaying = true
    //     AssetLoader.Cache.set(
    //       AssetLoader.getAbsolutePath(audioComponent.audioSource),
    //       testURLs[audioComponent.audioSource].buffer
    //     )
    //     audioFunctions.updateAudio(entity, { audioSource: audioComponent.audioSource })

    //     assert.equal(obj3d.userData.audioEl.buffer, testURLs[audioComponent.audioSource].buffer)
    //     assert(!hasComponent(entity, ErrorComponent))
    //     assert(!obj3d.userData.audioEl.isPlaying)
    //   })
    // })

    describe('Positional Audio Properties', () => {
      it('should not update positional properties for sterio type', () => {
        positionalAudio.rolloffFactor = Math.random()
        audioFunctions.updateAudio(entity, { rolloffFactor: positionalAudio.rolloffFactor })

        assert(obj3d.userData.audioEl.rolloffFactor !== positionalAudio.rolloffFactor)
      })

      describe('Property tests for "distanceModel"', () => {
        it('should not update property', () => {
          audioFunctions.updateAudio(entity, {})
          assert(positionalAudio.distanceModel.value === sceneComponentData.distanceModel)
          assert(obj3d.userData.audioEl.distanceModel === sceneComponentData.distanceModel)
        })

        it('should update property', () => {
          positionalAudio.distanceModel = 'exponential'

          audioFunctions.updateAudio(entity, { distanceModel: positionalAudio.distanceModel })
          assert(obj3d.userData.audioEl.distanceModel === positionalAudio.distanceModel)

          audioFunctions.updateAudio(entity, { distanceModel: 'linear' })
          assert(
            obj3d.userData.audioEl.distanceModel === positionalAudio.distanceModel,
            'should not update property to passed value'
          )
        })
      })

      describe('Property tests for "rolloffFactor"', () => {
        it('should not update property', () => {
          audioFunctions.updateAudio(entity, {})

          assert(positionalAudio.rolloffFactor === sceneComponentData.rolloffFactor)
          assert(obj3d.userData.audioEl.rolloffFactor === sceneComponentData.rolloffFactor)
        })

        it('should update property', () => {
          positionalAudio.rolloffFactor = Math.random()

          audioFunctions.updateAudio(entity, { rolloffFactor: positionalAudio.rolloffFactor })
          assert(obj3d.userData.audioEl.rolloffFactor === positionalAudio.rolloffFactor)

          audioFunctions.updateAudio(entity, { rolloffFactor: Math.random() })
          assert(
            obj3d.userData.audioEl.rolloffFactor === positionalAudio.rolloffFactor,
            'should not update property to passed value'
          )
        })
      })

      describe('Property tests for "refDistance"', () => {
        it('should not update property', () => {
          audioFunctions.updateAudio(entity, {})

          assert(positionalAudio.refDistance === sceneComponentData.refDistance)
          assert(obj3d.userData.audioEl.refDistance === sceneComponentData.refDistance)
        })

        it('should update property', () => {
          positionalAudio.refDistance = Math.random()

          audioFunctions.updateAudio(entity, { refDistance: positionalAudio.refDistance })
          assert(obj3d.userData.audioEl.refDistance === positionalAudio.refDistance)

          audioFunctions.updateAudio(entity, { refDistance: Math.random() })
          assert(
            obj3d.userData.audioEl.refDistance === positionalAudio.refDistance,
            'should not update property to passed value'
          )
        })
      })

      describe('Property tests for "maxDistance"', () => {
        it('should not update property', () => {
          audioFunctions.updateAudio(entity, {})

          assert(positionalAudio.maxDistance === sceneComponentData.maxDistance)
          assert(obj3d.userData.audioEl.maxDistance === sceneComponentData.maxDistance)
        })

        it('should update property', () => {
          positionalAudio.maxDistance = Math.random()

          audioFunctions.updateAudio(entity, { maxDistance: positionalAudio.maxDistance })
          assert(obj3d.userData.audioEl.maxDistance === positionalAudio.maxDistance)

          audioFunctions.updateAudio(entity, { maxDistance: Math.random() })
          assert(
            obj3d.userData.audioEl.maxDistance === positionalAudio.maxDistance,
            'should not update property to passed value'
          )
        })
      })

      describe('Property tests for "coneInnerAngle"', () => {
        it('should not update property', () => {
          audioFunctions.updateAudio(entity, {})

          assert(positionalAudio.coneInnerAngle === sceneComponentData.coneInnerAngle)
          assert(obj3d.userData.audioEl.panner.coneInnerAngle === sceneComponentData.coneInnerAngle)
        })

        it('should update property', () => {
          positionalAudio.coneInnerAngle = Math.random()

          audioFunctions.updateAudio(entity, { coneInnerAngle: positionalAudio.coneInnerAngle })
          assert(obj3d.userData.audioEl.panner.coneInnerAngle === positionalAudio.coneInnerAngle)

          audioFunctions.updateAudio(entity, { coneInnerAngle: Math.random() })
          assert(
            obj3d.userData.audioEl.panner.coneInnerAngle === positionalAudio.coneInnerAngle,
            'should not update property to passed value'
          )
        })
      })

      describe('Property tests for "coneOuterAngle"', () => {
        it('should not update property', () => {
          audioFunctions.updateAudio(entity, {})

          assert(positionalAudio.coneOuterAngle === sceneComponentData.coneOuterAngle)
          assert(obj3d.userData.audioEl.panner.coneOuterAngle === sceneComponentData.coneOuterAngle)
        })

        it('should update property', () => {
          positionalAudio.coneOuterAngle = Math.random()

          audioFunctions.updateAudio(entity, { coneOuterAngle: positionalAudio.coneOuterAngle })
          assert(obj3d.userData.audioEl.panner.coneOuterAngle === positionalAudio.coneOuterAngle)

          audioFunctions.updateAudio(entity, { coneOuterAngle: Math.random() })
          assert(
            obj3d.userData.audioEl.panner.coneOuterAngle === positionalAudio.coneOuterAngle,
            'should not update property to passed value'
          )
        })
      })

      describe('Property tests for "coneOuterGain"', () => {
        it('should not update property', () => {
          audioFunctions.updateAudio(entity, {})

          assert(positionalAudio.coneOuterGain === sceneComponentData.coneOuterGain)
          assert(obj3d.userData.audioEl.panner.coneOuterGain === sceneComponentData.coneOuterGain)
        })

        it('should update property', () => {
          positionalAudio.coneOuterGain = Math.random()

          audioFunctions.updateAudio(entity, { coneOuterGain: positionalAudio.coneOuterGain })
          assert(obj3d.userData.audioEl.panner.coneOuterGain === positionalAudio.coneOuterGain)

          audioFunctions.updateAudio(entity, { coneOuterGain: Math.random() })
          assert(
            obj3d.userData.audioEl.panner.coneOuterGain === positionalAudio.coneOuterGain,
            'should not update property to passed value'
          )
        })
      })
    })
  })

  describe('serializeAudio()', () => {
    it('should properly serialize audio', () => {
      audioFunctions.deserializePositionalAudio(entity, sceneComponentData)
      assert.deepEqual(audioFunctions.serializeAudio(entity), sceneComponentData)
    })

    it('should return undefine if there is no audio component', () => {
      assert(audioFunctions.serializeAudio(entity) === undefined)
    })
  })

  describe('toggleAudio()', () => {
    it('should properly toggle audio', () => {
      audioFunctions.deserializePositionalAudio(entity, sceneComponentData)

      const audioEl = getComponent(entity, Object3DComponent)?.value.userData.audioEl as Audio
      let prevState = audioEl.isPlaying
      audioFunctions.toggleAudio(entity)

      assert(audioEl.isPlaying !== prevState)

      prevState = audioEl.isPlaying
      audioFunctions.toggleAudio(entity)

      assert(audioEl.isPlaying !== prevState)
    })
  })

  describe('prepareAudioForGLTFExport()', () => {
    let audio: Object3D = new Object3D()
    let audioEl: Object3D = new Object3D()
    let textureMesh: Object3D = new Object3D()

    describe('Audio Element', () => {
      beforeEach(() => {
        audio = new Object3D()
        audioEl = new Object3D()
        audio.userData.audioEl = audioEl
        audio.add(audioEl)
      })

      it('should remove audio element', () => {
        audioFunctions.prepareAudioForGLTFExport(audio)
        assert(!audio.children.includes(audioEl))
        assert(!audio.userData.audioEl)
      })
    })

    describe('Audio Texture mesh', () => {
      beforeEach(() => {
        audio = new Object3D()
        textureMesh = new Object3D()
        audio.userData.textureMesh = textureMesh
        audio.add(textureMesh)
      })

      it('should remove texture mesh', () => {
        audioFunctions.prepareAudioForGLTFExport(audio)
        assert(!audio.children.includes(audio.userData.textureMesh))
        assert(!audio.userData.textureMesh)
      })
    })
  })
})
