import {
  DirectionalLight,
  LinearToneMapping,
  PCFSoftShadowMap,
  PerspectiveCamera,
  ShadowMapType,
  ToneMapping,
  Vector3
} from 'three'
import { isClient } from '../../common/functions/isClient'
import { CSM } from '../../assets/csm/CSM'
import { Engine } from '../../ecs/classes/Engine'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DEFAULT_LOD_DISTANCES } from '../../assets/constants/LoaderConstants'

export type RenderSettingsProps = {
  LODs: Vector3
  overrideRendererSettings: boolean
  csm: boolean
  toneMapping: ToneMapping
  toneMappingExposure: number
  shadowMapType: ShadowMapType
}

export const configureCSM = (directionalLights: DirectionalLight[], remove?: boolean): void => {
  if (!isClient || !Engine.renderer.shadowMap.enabled) return

  if (remove || !directionalLights.length) {
    if (!Engine.csm) return

    Engine.csm.remove()
    Engine.csm.dispose()
    Engine.csm = undefined!

    return
  }

  if (Engine.isHMD || Engine.csm) return

  const csm = new CSM({
    camera: Engine.camera as PerspectiveCamera,
    parent: Engine.scene,
    lights: directionalLights
  })

  csm.fade = true
  Engine.csm = csm
}

export const handleRendererSettings = (args: RenderSettingsProps, reset?: boolean): void => {
  if (!isClient) return

  if (reset) {
    Engine.renderer.shadowMap.enabled = true
    Engine.renderer.shadowMap.type = PCFSoftShadowMap
    Engine.renderer.shadowMap.needsUpdate = true

    Engine.renderer.toneMapping = LinearToneMapping
    Engine.renderer.toneMappingExposure = 0.8

    AssetLoader.LOD_DISTANCES = Object.assign({}, DEFAULT_LOD_DISTANCES)
    return
  }

  Engine.renderer.toneMapping = args.toneMapping
  Engine.renderer.toneMappingExposure = args.toneMappingExposure

  if (args.LODs) AssetLoader.LOD_DISTANCES = { '0': args.LODs.x, '1': args.LODs.y, '2': args.LODs.y }

  if (typeof args.shadowMapType === 'undefined') {
    Engine.renderer.shadowMap.enabled = false
  } else {
    Engine.renderer.shadowMap.enabled = true
    Engine.renderer.shadowMap.type = args.shadowMapType
    Engine.renderer.shadowMap.needsUpdate = true
  }
}
