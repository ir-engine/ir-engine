import { AmbientLight, DirectionalLight, HemisphereLight, Mesh, Object3D, PerspectiveCamera, PointLight, SpotLight } from "three"
import AudioSource from "../../scene/classes/AudioSource"
import Image from "../../scene/classes/Image"
import { Interior } from "../../scene/classes/Interior"
import { Sky } from "../../scene/classes/Sky"
import Video from "../../scene/classes/Video"
import { ComponentNames } from "./ComponentNames"

export type Object3DClassMapType = {
  [key in ComponentNames]?: any | {
    client: any,
    server: any
  }
}

export const Object3DClassMap: Object3DClassMapType = {
  [ComponentNames._MT_DATA]: Object3D,
  [ComponentNames.HEMISPHERE_LIGHT]: HemisphereLight,
  [ComponentNames.AMBIENT_LIGHT]: AmbientLight,
  [ComponentNames.DIRECTIONAL_LIGHT]: DirectionalLight,
  [ComponentNames.POINT_LIGHT]: PointLight,
  [ComponentNames.SPOT_LIGHT]: SpotLight,
  [ComponentNames.GROUND_PLANE]: Mesh,
  [ComponentNames.IMAGE]: Image,
  [ComponentNames.VIDEO]: {
    client: Video,
    server: Object3D,
  },
  [ComponentNames.AUDIO]: {
    client: AudioSource,
    server: Object3D,
  },
  [ComponentNames.VOLUMETRIC]: Object3D,
  [ComponentNames.SPAWN_POINT]: Object3D,
  [ComponentNames.SCENE_PREVIEW_CAMERA]: PerspectiveCamera,
  [ComponentNames.TRIGGER_VOLUME]: Mesh,
  [ComponentNames.LINK]: Object3D,
  [ComponentNames.PORTAL]: Mesh,
  [ComponentNames.INTERIOR]: Interior,
  [ComponentNames.SKYBOX]: Sky,

  [ComponentNames.POSTPROCESSING]: Object3D,
  [ComponentNames.GROUP]: Object3D,

}