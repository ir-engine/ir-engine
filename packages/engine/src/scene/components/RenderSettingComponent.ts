import { ShadowMapType, ToneMapping, Vector3 } from 'three'
import { ComponentName } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type RenderSettingComponentType = {
  LODs: Vector3
  overrideRendererSettings: boolean
  csm: boolean
  toneMapping: ToneMapping
  toneMappingExposure: number
  shadowMapType: ShadowMapType
}

export const RenderSettingComponent = createMappedComponent<RenderSettingComponentType>(ComponentName.RENDERER_SETTINGS)
