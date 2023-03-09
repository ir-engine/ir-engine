import { useEffect } from 'react'
import { BoxGeometry, BoxHelper, Mesh, MeshPhysicalMaterial, Object3D, SphereGeometry, Vector3 } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import {
  createMappedComponent,
  defineComponent,
  hasComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { RendererState } from '../../renderer/RendererState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { EnvMapBakeRefreshTypes } from '../types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const EnvMapBakeComponent = defineComponent({
  name: 'EnvMapBakeComponent',

  onInit: (entity) => {
    return {
      bakePosition: new Vector3(),
      bakePositionOffset: new Vector3(),
      bakeScale: new Vector3().set(1, 1, 1),
      bakeType: EnvMapBakeTypes.Baked,
      resolution: 1024,
      refreshMode: EnvMapBakeRefreshTypes.OnAwake,
      envMapOrigin: '',
      boxProjection: true,
      helper: null as Object3D | null,
      helperBall: null as Mesh<SphereGeometry, MeshPhysicalMaterial> | null,
      helperBox: null as BoxHelper | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.bakePosition)) component.bakePosition.value.copy(json.bakePosition)
    if (matches.object.test(json.bakePositionOffset)) component.bakePositionOffset.value.copy(json.bakePositionOffset)
    if (matches.object.test(json.bakeScale)) component.bakeScale.value.copy(json.bakeScale)
    if (matches.string.test(json.bakeType)) component.bakeType.set(json.bakeType)
    if (matches.number.test(json.resolution)) component.resolution.set(json.resolution)
    if (matches.string.test(json.refreshMode)) component.refreshMode.set(json.refreshMode)
    if (matches.string.test(json.envMapOrigin)) component.envMapOrigin.set(json.envMapOrigin)
    if (matches.boolean.test(json.boxProjection)) component.boxProjection.set(json.boxProjection)
  },

  toJSON: (entity, component) => {
    return {
      bakePosition: component.bakePosition.value,
      bakePositionOffset: component.bakePositionOffset.value,
      bakeScale: component.bakeScale.value,
      bakeType: component.bakeType.value,
      resolution: component.resolution.value,
      refreshMode: component.refreshMode.value,
      envMapOrigin: component.envMapOrigin.value,
      boxProjection: component.boxProjection.value
    }
  },

  onRemove: (entity, component) => {
    if (component.helper.value) removeObjectFromGroup(entity, component.helper.value)
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, EnvMapBakeComponent)) throw root.stop()

    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const bake = useComponent(root.entity, EnvMapBakeComponent)

    useEffect(() => {
      if (debugEnabled.value && !bake.helper.value) {
        const helper = new Object3D()
        helper.name = `envmap-bake-helper-${root.entity}`

        const centerBall = new Mesh(new SphereGeometry(0.75), new MeshPhysicalMaterial({ roughness: 0, metalness: 1 }))
        helper.add(centerBall)

        const gizmo = new BoxHelper(new Mesh(new BoxGeometry()), 0xff0000)
        helper.add(gizmo)

        setObjectLayers(helper, ObjectLayers.NodeHelper)
        addObjectToGroup(root.entity, helper)

        bake.helper.set(helper)
        bake.helperBall.set(centerBall)
        bake.helperBox.set(gizmo)
      }

      if (!debugEnabled.value && bake.helper.value) {
        removeObjectFromGroup(root.entity, bake.helper.value)
        bake.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})

export const SCENE_COMPONENT_ENVMAP_BAKE = 'envmapbake'
