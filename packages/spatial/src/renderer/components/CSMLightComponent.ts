import {
  Engine,
  Entity,
  createEntity,
  defineComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { NO_PROXY, matches, useImmediateEffect } from '@etherealengine/hyperflux'
import { Color, ColorRepresentation, DirectionalLight, MathUtils, ShaderChunk } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { NameComponent } from '../../common/NameComponent'
import { matchesColor } from '../../common/functions/MatchesUtils'
import { createDisposable } from '../../resources/resourceHooks'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import Frustum from '../csm/Frustum'
import Shader from '../csm/Shader'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { VisibleComponent } from './VisibleComponent'

const originalLightsFragmentBegin = ShaderChunk.lights_fragment_begin
const originalLightsParsBegin = ShaderChunk.lights_pars_begin

const _uniformArray = []
const _logArray = []

const enum CSMMode {
  UNIFORM = 'UNIFORM',
  LOGARITHMIC = 'LOGARITHMIC',
  PRACTICAL = 'PRACTICAL'
}

export const CSMLightComponent = defineComponent({
  name: 'CSMLightComponent',
  jsonID: 'EE_CSM_Light_Component',

  onInit: (entity) => {
    return {
      color: new Color() as ColorRepresentation,
      intensity: 1,
      lightMargin: 200,
      shadowMapSize: 1024,
      shadowBias: -0.00001,
      shadowNormalBias: 0,
      shadowRadius: 1,
      maxFar: 200,
      cascades: 5,
      mode: CSMMode.PRACTICAL,
      fade: true,

      // Internal
      lights: [] as DirectionalLight[],
      mainFrustum: new Frustum(),
      frustums: [] as Frustum[],
      breaks: [] as number[],
      needsUpdate: true
    }
  },

  toJSON: (entity, component) => {
    return {
      color: component.color.value,
      intensity: component.intensity.value,
      lightMargin: component.lightMargin.value,
      shadowMapSize: component.shadowMapSize.value,
      shadowBias: component.shadowBias.value,
      shadowNormalBias: component.shadowNormalBias.value,
      shadowRadius: component.shadowRadius.value,
      far: component.maxFar.value,
      cascades: component.cascades.value,
      mode: component.mode.value,
      fade: component.fade.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matchesColor.test(json.color)) component.color.set(json.color)
    if (matches.number.test(json.intensity)) component.intensity.set(json.intensity)
    if (matches.number.test(json.lightMargin)) component.lightMargin.set(json.lightMargin)
    if (matches.number.test(json.shadowMapSize)) component.shadowMapSize.set(json.shadowMapSize)
    if (matches.number.test(json.shadowBias)) component.shadowBias.set(json.shadowBias)
    if (matches.number.test(json.shadowNormalBias)) component.shadowNormalBias.set(json.shadowNormalBias)
    if (matches.number.test(json.shadowRadius)) component.shadowRadius.set(json.shadowRadius)
    if (matches.number.test(json.far)) component.maxFar.set(json.far)
    if (matches.number.test(json.cascades)) component.cascades.set(json.cascades)
    if (matches.string.test(json.mode)) component.mode.set(json.mode)
    if (matches.boolean.test(json.fade)) component.fade.set(json.fade)
  },

  onRemove: (entity, component) => {},

  reactor: function () {
    const entity = useEntityContext()
    const csmLightComponent = useComponent(entity, CSMLightComponent)

    /** @todo get camera from non deprecatetd api */
    const camera = useComponent(Engine.instance.cameraEntity, CameraComponent)

    useImmediateEffect(() => {
      return () => {
        ShaderChunk.lights_fragment_begin = originalLightsFragmentBegin
        ShaderChunk.lights_pars_begin = originalLightsParsBegin
      }
    }, [])

    useImmediateEffect(() => {
      const cascades = csmLightComponent.cascades.value
      const lightDisposals = [] as (() => void)[]
      const lightEntities = [] as Entity[]
      const lights = [] as DirectionalLight[]

      for (let i = 0; i < cascades; i++) {
        const lightEntity = createEntity()
        const [light, unload] = createDisposable(DirectionalLight, lightEntity)
        lightDisposals.push(unload)
        lightEntities.push(lightEntity)
        lights.push(light)

        light.castShadow = true
        light.frustumCulled = false

        addObjectToGroup(entity, light)
        setComponent(lightEntity, NameComponent, 'CSM light ' + i)
        setComponent(lightEntity, VisibleComponent)
        setComponent(lightEntity, EntityTreeComponent, { parentEntity: entity })
      }

      csmLightComponent.lights.set(lights)

      ShaderChunk.lights_fragment_begin = Shader.lights_fragment_begin(cascades)
      ShaderChunk.lights_pars_begin = Shader.lights_pars_begin()

      return () => {
        for (const unload of lightDisposals) {
          unload()
        }
        for (const light of lights) {
          removeObjectFromGroup(entity, light)
        }
        for (const entity of lightEntities) {
          removeEntity(entity)
        }
      }
    }, [csmLightComponent.cascades])

    useImmediateEffect(() => {
      for (const light of csmLightComponent.lights.get(NO_PROXY) as DirectionalLight[]) {
        light.shadow.mapSize.width = this.shadowMapSize
        light.shadow.mapSize.height = this.shadowMapSize
      }
    }, [csmLightComponent.lights, csmLightComponent.shadowMapSize])

    useImmediateEffect(() => {
      const color = csmLightComponent.color.value
      for (const light of csmLightComponent.lights.get(NO_PROXY) as DirectionalLight[]) {
        light.color.set(color)
      }
    }, [csmLightComponent.lights, csmLightComponent.color])

    useImmediateEffect(() => {
      const intensity = csmLightComponent.intensity.value
      for (const light of csmLightComponent.lights.get(NO_PROXY) as DirectionalLight[]) {
        light.intensity = intensity
      }
    }, [csmLightComponent.lights, csmLightComponent.intensity])

    useImmediateEffect(() => {
      const cascades = csmLightComponent.cascades.value
      const near = camera.near.value
      const far = Math.min(camera.far.value, csmLightComponent.maxFar.value)
      const breaks = [] as number[]

      const uniformSplit = (into: number[]) => {
        for (let i = 1; i < cascades; i++) {
          into.push((near + ((far - near) * i) / cascades) / far)
        }
        into.push(1)
      }

      const logarithmicSplit = (into: number[]) => {
        for (let i = 1; i < cascades; i++) {
          into.push((near * (far / near) ** (i / cascades)) / far)
        }
        into.push(1)
      }

      switch (csmLightComponent.mode.value) {
        case CSMMode.UNIFORM:
          uniformSplit(breaks)
          break
        case CSMMode.LOGARITHMIC:
          logarithmicSplit(breaks)
          break
        case CSMMode.PRACTICAL:
          _uniformArray.length = 0
          _logArray.length = 0
          logarithmicSplit(_logArray)
          uniformSplit(_uniformArray)
          for (let i = 1; i < cascades; i++) {
            breaks.push(MathUtils.lerp(_uniformArray[i - 1], _logArray[i - 1], 0.5))
          }

          breaks.push(1)
          break
      }

      csmLightComponent.breaks.set(breaks)
    }, [
      csmLightComponent.lights,
      csmLightComponent.cascades,
      camera.near,
      camera.far,
      csmLightComponent.maxFar,
      csmLightComponent.mode
    ])

    useImmediateEffect(() => {
      csmLightComponent.needsUpdate.set(true)
    }, [
      csmLightComponent.lights,
      csmLightComponent.shadowMapSize,
      csmLightComponent.color,
      csmLightComponent.intensity,
      csmLightComponent.shadowBias,
      csmLightComponent.breaks
    ])

    return null
  },

  errors: []
})
