import {
  AmbientLightProbeTagComponent,
  AmbientLightTagComponent,
  ArrayCameraTagComponent,
  AudioListenerTagComponent,
  AudioTagComponent,
  BoneTagComponent,
  CameraTagComponent,
  CubeCameraTagComponent,
  DirectionalLightTagComponent,
  ECSYThreeEntity,
  GroupTagComponent,
  HemisphereLightProbeTagComponent,
  HemisphereLightTagComponent,
  ImmediateRenderObjectTagComponent,
  InstancedMeshTagComponent,
  LightProbeTagComponent,
  LightTagComponent,
  LineLoopTagComponent,
  LineSegmentsTagComponent,
  LineTagComponent,
  LODTagComponent,
  MeshTagComponent,
  Object3DComponent,
  OrthographicCameraTagComponent,
  PerspectiveCameraTagComponent,
  PointLightTagComponent,
  PointsTagComponent,
  PositionalAudioTagComponent,
  RectAreaLightTagComponent,
  SceneTagComponent,
  SkinnedMeshTagComponent,
  SpotLightTagComponent,
  SpriteTagComponent
} from "ecsy-three"
import { SceneComponent } from "../../components/SceneComponent"
import { Behavior } from "../../interfaces/Behavior"
import { BoxBufferGeometry } from "three"

let object3d
export const addObject3DComponent: Behavior = (entity: ECSYThreeEntity, args: { obj: any; objArgs: any }) => {
  console.log("Obj args")
  console.log(args.objArgs)
  object3d = new args.obj(new BoxBufferGeometry(1, 1, 1))
  // object3d = new args.obj(args.objArgs)
  console.log("object3d")
  console.log(object3d)
  entity.addComponent(Object3DComponent, { value: object3d })
  // Add the obj to our scene graph
  SceneComponent.instance.scene.add(object3d)
  if (object3d.type === "Audio" && (object3d as any).panner !== undefined) {
    entity.addComponent(PositionalAudioTagComponent)
  } else if (object3d.type === "Audio") {
    entity.addComponent(AudioTagComponent)
  } else if (object3d.type === "AudioListener") {
    entity.addComponent(AudioListenerTagComponent)
  } else if ((object3d as any).isCamera) {
    entity.addComponent(CameraTagComponent)

    if ((object3d as any).isOrthographicCamera) {
      entity.addComponent(OrthographicCameraTagComponent)
    } else if ((object3d as any).isPerspectiveCamera) {
      entity.addComponent(PerspectiveCameraTagComponent)

      if ((object3d as any).isArrayCamera) {
        entity.addComponent(ArrayCameraTagComponent)
      }
    }
  } else if (object3d.type === "CubeCamera") {
    entity.addComponent(CubeCameraTagComponent)
  } else if ((object3d as any).isImmediateRenderObject) {
    entity.addComponent(ImmediateRenderObjectTagComponent)
  } else if ((object3d as any).isLight) {
    entity.addComponent(LightTagComponent)

    if ((object3d as any).isAmbientLight) {
      entity.addComponent(AmbientLightTagComponent)
    } else if ((object3d as any).isDirectionalLight) {
      entity.addComponent(DirectionalLightTagComponent)
    } else if ((object3d as any).isHemisphereLight) {
      entity.addComponent(HemisphereLightTagComponent)
    } else if ((object3d as any).isPointLight) {
      entity.addComponent(PointLightTagComponent)
    } else if ((object3d as any).isRectAreaLight) {
      entity.addComponent(RectAreaLightTagComponent)
    } else if ((object3d as any).isSpotLight) {
      entity.addComponent(SpotLightTagComponent)
    } else if ((object3d as any).isLightProbe) {
      entity.addComponent(LightProbeTagComponent)

      if ((object3d as any).isAmbientLightProbe) {
        entity.addComponent(AmbientLightProbeTagComponent)
      } else if ((object3d as any).isHemisphereLightProbe) {
        entity.addComponent(HemisphereLightProbeTagComponent)
      }
    }
  } else if ((object3d as any).isBone) {
    entity.addComponent(BoneTagComponent)
  } else if ((object3d as any).isGroup) {
    entity.addComponent(GroupTagComponent)
  } else if ((object3d as any).isLOD) {
    entity.addComponent(LODTagComponent)
  } else if ((object3d as any).isMesh) {
    entity.addComponent(MeshTagComponent)

    if ((object3d as any).isInstancedMesh) {
      entity.addComponent(InstancedMeshTagComponent)
    } else if ((object3d as any).isSkinnedMesh) {
      entity.addComponent(SkinnedMeshTagComponent)
    }
  } else if ((object3d as any).isLine) {
    entity.addComponent(LineTagComponent)

    if ((object3d as any).isLineLoop) {
      entity.addComponent(LineLoopTagComponent)
    } else if ((object3d as any).isLineSegments) {
      entity.addComponent(LineSegmentsTagComponent)
    }
  } else if ((object3d as any).isPoints) {
    entity.addComponent(PointsTagComponent)
  } else if ((object3d as any).isSprite) {
    entity.addComponent(SpriteTagComponent)
  } else if ((object3d as any).isScene) {
    entity.addComponent(SceneTagComponent)
  }

  return entity
}

export function removeObject3DComponent(entity, unparent = true) {
  const obj = entity.getComponent(Object3DComponent, true).value
  SceneComponent.instance.scene.remove(obj)

  if (unparent) {
    // Using "true" as the entity could be removed somewhere else
    obj.parent && obj.parent.remove(obj)
  }
  entity.removeComponent(Object3DComponent)

  for (let i = entity._ComponentTypes.length - 1; i >= 0; i--) {
    const Component = entity._ComponentTypes[i]

    if (Component.isObject3DTagComponent) {
      entity.removeComponent(Component)
    }
  }

  obj.entity = null
}

export function remove(entity, forceImmediate) {
  if (entity.hasComponent(Object3DComponent)) {
    const obj = entity.getObject3D()
    obj.traverse(o => {
      if (o.entity) {
        entity._entityManager.removeEntity(o.entity, forceImmediate)
      }
      o.entity = null
    })
    obj.parent && obj.parent.remove(obj)
  }
  entity._entityManager.removeEntity(entity, forceImmediate)
}

export function getObject3D(entity) {
  const component = entity.getComponent(Object3DComponent)
  return component && component.value
}
