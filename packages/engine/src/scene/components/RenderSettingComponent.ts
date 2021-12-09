import { ShadowMapType, ToneMapping, Vector3 } from 'three'
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
