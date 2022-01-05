import { Box3, Sphere, PropertyBinding, Mesh } from 'three'
import Model from '@xrengine/engine/src/scene/classes/Model'
import EditorNodeMixin from './EditorNodeMixin'
import { setStaticMode, StaticModes } from '../functions/StaticMode'
import cloneObject3D from '@xrengine/engine/src/scene/functions/cloneObject3D'
import { makeCollidersInvisible } from '@xrengine/engine/src/physics/functions/parseModelColliders'
import { AnimationManager } from '@xrengine/engine/src/avatar/AnimationManager'
import { RethrownError } from '@xrengine/client-core/src/util/errors'
import { resolveMedia } from '@xrengine/engine/src/common/functions/resolveMedia'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { CacheManager } from '../managers/CacheManager'
import { ControlManager } from '../managers/ControlManager'
import { LoadInstancedGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import SceneNode from './SceneNode'

export default class ModelNode extends EditorNodeMixin(Model) {
  static nodeName = 'Model'
  static legacyComponentName = 'gltf-model'
  static initialElementProps = {
    initialScale: 'fit',
    src: ''
  }

  meshColliders = []

  static async deserialize(json, loadAsync, onError) {
    const node = await super.deserialize(json)
    loadAsync(
      (async () => {
        const { src, envMapOverride, textureOverride, matrixAutoUpdate, isUsingGPUInstancing, isDynamicObject } =
          json.components.find((c) => c.name === 'gltf-model').props

        node.isDynamicObject = isDynamicObject
        node.isUsingGPUInstancing = isUsingGPUInstancing

        await node.load(src, onError)
        if (node.envMapOverride) node.envMapOverride = envMapOverride
        if (typeof matrixAutoUpdate !== undefined) node._matrixAutoUpdate = matrixAutoUpdate
        if (textureOverride) {
          // Using this to pass texture override uuid to event callback instead of creating a new variable
          node.textureOverride = textureOverride
          CommandManager.instance.addListener(EditorEvents.PROJECT_LOADED.toString(), () => {
            Engine.scene.traverse((obj) => {
              if (obj.uuid === node.textureOverride) {
                node.textureOverride = obj.uuid
              }
            })
          })
        }

        const loopAnimationComponent = json.components.find((c) => c.name === 'loop-animation')
        if (loopAnimationComponent && loopAnimationComponent.props) {
          const { clip, activeClipIndex, hasAvatarAnimations } = loopAnimationComponent.props
          node.hasAvatarAnimations = hasAvatarAnimations
          if (activeClipIndex !== undefined) {
            node.activeClipIndex = loopAnimationComponent.props.activeClipIndex
          } else if (clip !== undefined && node.model && node.model.animations) {
            // DEPRECATED: Old loop-animation component stored the clip name rather than the clip index
            // node.activeClipIndex = node.model.animations.findIndex(
            //   animation => animation.name === clip
            // );
            const clipIndex = node.model.animations.findIndex((animation) => animation.name === clip)

            if (clipIndex !== -1) {
              node.activeClipIndices = [clipIndex]
            }
          }
        }
        const shadowComponent = json.components.find((c) => c.name === 'shadow')
        if (shadowComponent) {
          node.castShadow = shadowComponent.props.cast
          node.receiveShadow = shadowComponent.props.receive
        }
        const interactableComponent = json.components.find((c) => c.name === 'interact')

        if (interactableComponent) {
          node.interactable = interactableComponent.props.interactable
          node.interactionType = interactableComponent.props.interactionType
          node.interactionText = interactableComponent.props.interactionText
          node.interactionDistance = interactableComponent.props.interactionDistance
          node.interactionThemeIndex = interactableComponent.props.interactionThemeIndex
          node.interactionName = interactableComponent.props.interactionName
          node.interactionDescription = interactableComponent.props.interactionDescription
          node.interactionImages = interactableComponent.props.interactionImages
          node.interactionVideos = interactableComponent.props.interactionVideos
          node.interactionUrls = interactableComponent.props.interactionUrls
          node.interactionModels = interactableComponent.props.interactionModels
        }
      })()
    )
    return node
  }

  _canonicalUrl = ''
  envMapOverride = ''
  textureOverride = ''
  initialScale: string | number = 1
  boundingBox = new Box3()
  boundingSphere = new Sphere()
  gltfJson = null
  isValidURL = false
  _matrixAutoUpdate = false
  animations = []
  isUsingGPUInstancing = false
  isDynamicObject = false
  model: Mesh

  constructor() {
    super()
  }
  // Overrides Model's src property and stores the original (non-resolved) url.
  get src(): string {
    return this._canonicalUrl
  }
  // When getters are overridden you must also override the setter.
  set src(value: string) {
    this.load(value).catch(console.error)
  }
  reload() {
    console.log('reload')
    this.load(this.src).catch(console.error)
  }
  // Overrides Model's loadGLTF method and uses the Editor's gltf cache.
  async loadGLTF(src) {
    let loadPromise = null
    if (this.isUsingGPUInstancing) {
      console.log('instanced')
      // TODO: Look into how to support caching for this
      loadPromise = LoadInstancedGLTF(src)
    } else {
      console.log('non-instanced')
      loadPromise = CacheManager.gltfCache.get(src)
    }
    const { scene, json, animations } = await loadPromise
    this.gltfJson = json
    const clonedScene = cloneObject3D(scene)
    clonedScene.animations = animations

    return clonedScene
  }
  // Overrides Model's load method and resolves the src url before loading.
  async load(src, onError?) {
    const nextSrc = src || ''
    if (nextSrc === '') {
      return
    }
    this._canonicalUrl = nextSrc
    this.issues = []
    this.gltfJson = null
    if (this.model) {
      // SceneManager.instance.renderer.removeBatchedObject(this.model)
      this.remove(this.model)
      this.model = null
    }
    this.hideErrorIcon()
    try {
      this.isValidURL = true
      const { url, files } = await resolveMedia(src)
      if (this.model) {
        // SceneManager.instance.renderer.removeBatchedObject(this.model)
      }
      await super.load(url)

      if (this.initialScale === 'fit') {
        this.scale.set(1, 1, 1)
        if (this.model) {
          this.updateMatrixWorld()
          this.boundingBox.setFromObject(this.model)
          this.boundingBox.getBoundingSphere(this.boundingSphere)
          const diameter = this.boundingSphere.radius * 2
          if ((diameter > 1000 || diameter < 0.1) && diameter !== 0) {
            // Scale models that are too big or to small to fit in a 1m bounding sphere.
            const scaleFactor = 1 / diameter
            this.scale.set(scaleFactor, scaleFactor, scaleFactor)
          } else if (diameter > 20) {
            // If the bounding sphere of a model is over 20m in diameter, assume that the model was
            // exported with units as centimeters and convert to meters.
            // disabled this because we import scenes that are often bigger than this threshold
            // this.scale.set(0.01, 0.01, 0.01);
          }
        }
        // Clear scale to fit property so that the swapped model maintains the same scale.
        this.initialScale = 1
      } else {
        this.scale.multiplyScalar(this.initialScale)
        this.initialScale = 1
      }
      if (this.model) {
        this.model.traverse((object: any) => {
          if (object.material && object.material.isMeshStandardMaterial) {
            object.material.envMap = (Engine.scene as any as SceneNode)?.environmentMap
            object.material.needsUpdate = true
          }
        })
      }
      makeCollidersInvisible(this.model)
      this.updateStaticModes()
    } catch (error) {
      this.showErrorIcon()
      const modelError = new RethrownError(`Error loading model "${this._canonicalUrl}"`, error)
      if (onError) {
        onError(this, modelError)
      }
      console.error(modelError)
      this.issues.push({ severity: 'error', message: 'Error loading model.' })
      this.isValidURL = false
      //this._canonicalUrl = "";
    }
    CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
    CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
    // this.hideLoadingCube();
    return this
  }
  onAdd() {
    if (this.model) {
      // SceneManager.instance.renderer.addBatchedObject(this.model)
    }
  }
  onRemove() {
    if (this.model) {
      // SceneManager.instance.renderer.removeBatchedObject(this.model)
    }
  }
  onPlay() {
    this.playAnimation()
  }
  onPause() {
    this.stopAnimation()
  }
  onUpdate(delta: number, time: number) {
    super.onUpdate(delta, time)
    if (ControlManager.instance.isInPlayMode || this.animationMixer) {
      this.update(delta)
    }
  }
  simplyfyFloat(arr) {
    return arr.map((v: number) => parseFloat((Math.round(v * 10000) / 10000).toFixed(4)))
  }

  updateStaticModes() {
    if (!this.model) return
    setStaticMode(this.model, StaticModes.Static)
    AnimationManager.instance.getAnimations().then((animations) => {
      if (animations && animations.length > 0) {
        for (const animation of animations) {
          for (const track of animation.tracks) {
            const { nodeName: uuid } = PropertyBinding.parseTrackName(track.name)
            const animatedNode = this.model.getObjectByProperty('uuid', uuid)
            if (!animatedNode) {
              // throw new Error(
              //   `Model.updateStaticModes: model with url "${this._canonicalUrl}" has an invalid animation "${animation.name}"`
              // )
            } else {
              setStaticMode(animatedNode, StaticModes.Dynamic)
            }
          }
        }
      }
    })
  }
  async serialize(projectID) {
    const components = {
      'gltf-model': {
        src: this._canonicalUrl,
        envMapOverride: this.envMapOverride !== '' ? this.envMapOverride : undefined,
        textureOverride: this.textureOverride,
        matrixAutoUpdate: this._matrixAutoUpdate,
        isUsingGPUInstancing: this.isUsingGPUInstancing,
        isDynamicObject: this.isDynamicObject
      },
      shadow: {
        cast: this.castShadow,
        receive: this.receiveShadow
      },
      interact: {
        interactable: this.interactable,
        interactionType: this.interactionType,
        interactionText: this.interactionText,
        interactionDistance: this.interactionDistance,
        interactionThemeIndex: this.interactionThemeIndex,
        interactionName: this.interactionName,
        interactionDescription: this.interactionDescription,
        interactionImages: this.interactionImages,
        interactionVideos: this.interactionVideos,
        interactionUrls: this.interactionUrls,
        interactionModels: this.interactionModels
      }
    }

    if (this.activeClipIndex !== -1) {
      components['loop-animation'] = {
        activeClipIndex: this.activeClipIndex,
        hasAvatarAnimations: this.hasAvatarAnimations
      }
    }
    return await super.serialize(projectID, components)
  }
  copy(source, recursive = true) {
    super.copy(source, recursive)
    if (source.loadingCube) {
      this.initialScale = source.initialScale
      this.load(source.src)
    } else {
      this.updateStaticModes()
      this.gltfJson = source.gltfJson
      this._canonicalUrl = source._canonicalUrl
      this.envMapOverride = source.envMapOverride
    }
    this.textureOverride = source.textureOverride
    return this
  }

  prepareForExport(ctx: any): void {
    super.prepareForExport()
    this.addGLTFComponent('shadow', {
      cast: this.castShadow,
      receive: this.receiveShadow
    })
    // TODO: Support exporting more than one active clip.
    if (this.activeClip) {
      const activeClipIndex = ctx.animations.indexOf(this.activeClip)
      if (activeClipIndex === -1) {
        throw new Error(
          `Error exporting model "${this.name}" with url "${this._canonicalUrl}". Animation could not be found.`
        )
      } else {
        this.addGLTFComponent('loop-animation', {
          hasAvatarAnimations: this.hasAvatarAnimations,
          activeClipIndex: activeClipIndex
        })
      }
    }
  }
}
