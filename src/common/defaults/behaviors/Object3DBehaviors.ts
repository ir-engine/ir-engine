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
import { Object3D } from "three"
import { Scene } from "../../components/Scene"
import { Behavior } from "../../interfaces/Behavior"
export const addObject3DComponent: Behavior = (entity: ECSYThreeEntity, args: { obj: Object3D }) => {
  entity.addComponent(Object3DComponent, { value: args.obj })
  // Add the obj to our scene graph
  Scene.instance.scene.addComponent(args.obj)
  if (args.obj.type === "Audio" && (args.obj as any).panner !== undefined) {
    entity.addComponent(PositionalAudioTagComponent)
  } else if (args.obj.type === "Audio") {
    entity.addComponent(AudioTagComponent)
  } else if (args.obj.type === "AudioListener") {
    entity.addComponent(AudioListenerTagComponent)
  } else if ((args.obj as any).isCamera) {
    entity.addComponent(CameraTagComponent)

    if ((args.obj as any).isOrthographicCamera) {
      entity.addComponent(OrthographicCameraTagComponent)
    } else if ((args.obj as any).isPerspectiveCamera) {
      entity.addComponent(PerspectiveCameraTagComponent)

      if ((args.obj as any).isArrayCamera) {
        entity.addComponent(ArrayCameraTagComponent)
      }
    }
  } else if (args.obj.type === "CubeCamera") {
    entity.addComponent(CubeCameraTagComponent)
  } else if ((args.obj as any).isImmediateRenderObject) {
    entity.addComponent(ImmediateRenderObjectTagComponent)
  } else if ((args.obj as any).isLight) {
    entity.addComponent(LightTagComponent)

    if ((args.obj as any).isAmbientLight) {
      entity.addComponent(AmbientLightTagComponent)
    } else if ((args.obj as any).isDirectionalLight) {
      entity.addComponent(DirectionalLightTagComponent)
    } else if ((args.obj as any).isHemisphereLight) {
      entity.addComponent(HemisphereLightTagComponent)
    } else if ((args.obj as any).isPointLight) {
      entity.addComponent(PointLightTagComponent)
    } else if ((args.obj as any).isRectAreaLight) {
      entity.addComponent(RectAreaLightTagComponent)
    } else if ((args.obj as any).isSpotLight) {
      entity.addComponent(SpotLightTagComponent)
    } else if ((args.obj as any).isLightProbe) {
      entity.addComponent(LightProbeTagComponent)

      if ((args.obj as any).isAmbientLightProbe) {
        entity.addComponent(AmbientLightProbeTagComponent)
      } else if ((args.obj as any).isHemisphereLightProbe) {
        entity.addComponent(HemisphereLightProbeTagComponent)
      }
    }
  } else if ((args.obj as any).isBone) {
    entity.addComponent(BoneTagComponent)
  } else if ((args.obj as any).isGroup) {
    entity.addComponent(GroupTagComponent)
  } else if ((args.obj as any).isLOD) {
    entity.addComponent(LODTagComponent)
  } else if ((args.obj as any).isMesh) {
    entity.addComponent(MeshTagComponent)

    if ((args.obj as any).isInstancedMesh) {
      entity.addComponent(InstancedMeshTagComponent)
    } else if ((args.obj as any).isSkinnedMesh) {
      entity.addComponent(SkinnedMeshTagComponent)
    }
  } else if ((args.obj as any).isLine) {
    entity.addComponent(LineTagComponent)

    if ((args.obj as any).isLineLoop) {
      entity.addComponent(LineLoopTagComponent)
    } else if ((args.obj as any).isLineSegments) {
      entity.addComponent(LineSegmentsTagComponent)
    }
  } else if ((args.obj as any).isPoints) {
    entity.addComponent(PointsTagComponent)
  } else if ((args.obj as any).isSprite) {
    entity.addComponent(SpriteTagComponent)
  } else if ((args.obj as any).isScene) {
    entity.addComponent(SceneTagComponent)
  }

  return entity
}

export function removeObject3DComponent(entity, unparent = true) {
  const obj = entity.getComponent(Object3DComponent, true).value
  Scene.instance.scene.remove(obj)

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
