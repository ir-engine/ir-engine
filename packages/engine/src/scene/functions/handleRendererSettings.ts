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
import { useEngine } from '../../ecs/classes/Engine'
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
  if (!isClient || !useEngine().renderer.shadowMap.enabled) return

  if (remove || !directionalLights.length) {
    if (!useEngine().csm) return

    useEngine().csm.remove()
    useEngine().csm.dispose()
    useEngine().csm = undefined!

    return
  }

  if (useEngine().isHMD || useEngine().csm) return

  const csm = new CSM({
    camera: useEngine().camera as PerspectiveCamera,
    parent: useEngine().scene,
    lights: directionalLights
  })

  csm.fade = true
  useEngine().csm = csm
}

export const handleRendererSettings = (args: RenderSettingsProps, reset?: boolean): void => {
  if (!isClient) return

  if (reset) {
    useEngine().renderer.shadowMap.enabled = true
    useEngine().renderer.shadowMap.type = PCFSoftShadowMap
    useEngine().renderer.shadowMap.needsUpdate = true

    useEngine().renderer.toneMapping = LinearToneMapping
    useEngine().renderer.toneMappingExposure = 0.8

    AssetLoader.LOD_DISTANCES = Object.assign({}, DEFAULT_LOD_DISTANCES)
    return
  }

  useEngine().renderer.toneMapping = args.toneMapping
  useEngine().renderer.toneMappingExposure = args.toneMappingExposure

  if (args.LODs) AssetLoader.LOD_DISTANCES = { '0': args.LODs.x, '1': args.LODs.y, '2': args.LODs.y }

  if (typeof args.shadowMapType === 'undefined') {
    useEngine().renderer.shadowMap.enabled = false
  } else {
    useEngine().renderer.shadowMap.enabled = true
    useEngine().renderer.shadowMap.type = args.shadowMapType
    useEngine().renderer.shadowMap.needsUpdate = true
  }
}
