import { Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, NoToneMapping, PerspectiveCamera, ShadowMapType, ToneMapping } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DEFAULT_LOD_DISTANCES, LODType } from '../../assets/constants/LoaderConstants'
import { CSM } from '../../assets/csm/CSM'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { Engine } from '../../ecs/classes/Engine'
import { createMappedComponent, getAllComponentsOfType } from '../../ecs/functions/ComponentFunctions'
import { beforeMaterialCompile } from '../classes/BPCEMShader'
import { SceneOptions } from '../systems/SceneObjectSystem'
import { DirectionalLightComponent, DirectionalLightData } from './DirectionalLightComponent'

export type RenderSettingsDataProps = {
  overrideRendererSettings?: boolean
  useSimpleMaterial?: boolean
  toneMapping?: ToneMapping
  toneMappingExposure?: number
  shadowMapType?: ShadowMapType
  LODs?: LODType
  csm?: boolean
}

export class RenderSettingsData implements ComponentData {
  static legacyComponentName = ComponentNames.RENDERER_SETTINGS

  constructor(props: RenderSettingsDataProps) {
    this.overrideRendererSettings = props.overrideRendererSettings || false
    this.useSimpleMaterial = props.useSimpleMaterial || false
    this.toneMapping = props.toneMapping || NoToneMapping
    this.toneMappingExposure = props.toneMappingExposure || 1
    this.shadowMapType = props.shadowMapType
    this.LODs = props.LODs || DEFAULT_LOD_DISTANCES
    this.csm = props.csm || false
  }

  overrideRendererSettings: boolean
  _csm: boolean

  get toneMapping(): ToneMapping {
    return Engine.renderer.toneMapping
  }

  set toneMapping(toneMapping: ToneMapping) {
    Engine.renderer.toneMapping = this.overrideRendererSettings ? toneMapping : NoToneMapping
  }

  get toneMappingExposure(): number {
    return Engine.renderer.toneMappingExposure
  }

  set toneMappingExposure(toneMappingExposure: number) {
    Engine.renderer.toneMappingExposure = this.overrideRendererSettings ? toneMappingExposure : 1
  }

  get shadowMapType(): ShadowMapType {
    return Engine.renderer.shadowMap.type
  }

  set shadowMapType(shadowMapType: ShadowMapType | undefined) {
    if (shadowMapType) {
      Engine.renderer.shadowMap.enabled = true
      Engine.renderer.shadowMap.type = shadowMapType
      Engine.renderer.shadowMap.needsUpdate = true
    } else {
      Engine.renderer.shadowMap.enabled = false
      Engine.renderer.shadowMap.needsUpdate = true
    }
  }

  get LODs(): LODType {
    return AssetLoader.LOD_DISTANCES
  }

  set LODs(LODs: LODType) {
    AssetLoader.LOD_DISTANCES = LODs
  }

  get useSimpleMaterial(): boolean {
    return Engine.useSimpleMaterials
  }

  set useSimpleMaterial(useSimpleMaterial: boolean) {
    Engine.useSimpleMaterials = useSimpleMaterial

    if (Engine.useSimpleMaterials) {
      Engine.scene.traverse((obj: Mesh) => {
        if (obj.material instanceof MeshStandardMaterial) {
          const prevMaterial = obj.material
          obj.material = new MeshPhongMaterial()
          MeshBasicMaterial.prototype.copy.call(obj.material, prevMaterial)
          ;(obj as any).prevMaterial = prevMaterial
        }
      })
    } else {
      Engine.scene.traverse((obj: Mesh) => {
        if ((obj as any).prevMaterial) {
          obj.material = (obj as any).prevMaterial
          ;(obj as any).prevMaterial = null

          if (typeof obj.material !== 'undefined') {
            // BPCEM
            if (SceneOptions.instance.boxProjection) {
              ;(obj.material as Material).onBeforeCompile = beforeMaterialCompile(
                SceneOptions.instance.bpcemOptions.bakeScale,
                SceneOptions.instance.bpcemOptions.bakePositionOffset
              )
            }

            ;(obj.material as any).envMapIntensity = SceneOptions.instance.envMapIntensity

            if (obj.receiveShadow) {
              Engine.csm?.setupMaterial(obj)
            }
          }
        }
      })
    }
  }

  get csm(): boolean {
    return this._csm
  }

  set csm(csm: boolean) {
    this._csm = csm

    if (csm && !Engine.csm) {
      const directionalLightComponents = getAllComponentsOfType(DirectionalLightComponent)

      Engine.csm = new CSM({
        camera: Engine.camera as PerspectiveCamera,
        parent: Engine.scene,
        lights: directionalLightComponents ? directionalLightComponents.map((c: DirectionalLightData) => c.obj3d) : []
      })

      Engine.csm.fade = true
    } else {
      if (!Engine.csm) return

      Engine.csm.remove()
      Engine.csm.dispose()
      Engine.csm = undefined!
    }
  }

  serialize(): object {
    return {
      overrideRendererSettings: this.overrideRendererSettings,
      toneMapping: this.toneMapping,
      toneMappingExposure: this.toneMappingExposure,
      shadowMapType: this.shadowMapType,
      LODs: this.LODs,
      useSimpleMaterial: this.useSimpleMaterial,
      csm: this.csm
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const RenderSettingsComponent = createMappedComponent<RenderSettingsData>(ComponentNames.RENDERER_SETTINGS)
