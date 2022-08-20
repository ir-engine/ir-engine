import { LinearToneMapping, PCFSoftShadowMap, ShadowMapType, ToneMapping, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type RenderSettingComponentType = {
  LODs: Vector3
  overrideRendererSettings: boolean
  csm: boolean
  toneMapping: ToneMapping
  toneMappingExposure: number
  shadowMapType: ShadowMapType
}

export const RenderSettingComponent = createMappedComponent<RenderSettingComponentType>('RenderSettingComponent')

export const SCENE_COMPONENT_RENDERER_SETTINGS = 'renderer-settings'
export const SCENE_COMPONENT_RENDERER_SETTINGS_DEFAULT_VALUES = {
  LODs: { x: 5, y: 15, z: 30 },
  overrideRendererSettings: false,
  csm: true,
  toneMapping: LinearToneMapping,
  toneMappingExposure: 0.2,
  shadowMapType: PCFSoftShadowMap
}
