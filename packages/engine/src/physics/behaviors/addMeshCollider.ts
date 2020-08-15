import { Behavior } from "../../common/interfaces/Behavior"
import { ColliderComponent } from "../components/Collider"
import { RigidBody } from "../../sandbox/physics/components/RigidBody"
import { Entity } from "../../ecs/classes/Entity"
import { addComponent } from "../../ecs/functions/EntityFunctions"
import { hasRegisteredComponent, registerComponent } from "../../ecs/functions/ComponentFunctions"

export const addMeshCollider: Behavior = (entity: Entity, args: { obj: any; objArgs: any; parentEntity: Entity }) => {
  //  const object3d = args.obj ? new args.obj(args.objArgs) : new Object3D()

  if (!hasRegisteredComponent(ColliderComponent)) {
    registerComponent(ColliderComponent)
  }

  // object3d = new args.obj(args.objArgs)
  addComponent(entity, ColliderComponent, { scale: [1, 1, 1], mass: 0.2 })
  addComponent(entity, RigidBody)
  console.log(entity)

  //getMutableComponent(entity, Object3DComponent).value = object3d
  /*
  getComponentTags(object3d).forEach((component: any) => {
    addComponent(entity, component)
  })
  if (args.parentEntity && args.parentEntity.hasComponent(Object3DComponent as any)) {
    args.parentgetComponent(entity, Object3DComponent).value.add(object3d)
  }
  */
  // Add the obj to our scene graph
  //  else SceneComponent.instance.scene.add(object3d)
  return entity
}
/*
export function removeObject3DComponent(entity, unparent = true) {
  const obj = getComponent(entity, Object3DComponent, true).value
  SceneComponent.instance.scene.remove(obj)

  if (unparent) {
    // Using "true" as the entity could be removed somewhere else
    obj.parent && obj.parent.remove(obj)
  }
  removeComponent(entity, Object3DComponent)

  for (let i = entity._ComponentTypes.length - 1; i >= 0; i--) {
    const Component = entity._ComponentTypes[i]

    if (Component.isObject3DTagComponent) {
      removeComponent(entity, Component)
    }
  }

  obj.entity = null
}

*/
/*
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
  const component = getComponent(entity, Object3DComponent)
  return component && component.value
}
*/
/*
export function getComponentTags(object3d: Object3D): (Component<any> | TagComponent)[] {
  const components: Component<any>[] = []
  if (object3d.type === "Audio" && (object3d as any).panner !== undefined) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(PositionalAudioTagComponent as any))
      WorldComponent.instance.world.registerComponent(PositionalAudioTagComponent)
    components.push(PositionalAudioTagComponent as any)
  } else if (object3d.type === "Audio") {
    if (!WorldComponent.instance.world.hasRegisteredComponent(AudioTagComponent as any))
      WorldComponent.instance.world.registerComponent(AudioTagComponent)
    components.push(AudioTagComponent as any)
  } else if (object3d.type === "AudioListener") {
    if (!WorldComponent.instance.world.hasRegisteredComponent(AudioListenerTagComponent as any))
      WorldComponent.instance.world.registerComponent(AudioListenerTagComponent)
    components.push(AudioListenerTagComponent as any)
  } else if ((object3d as any).isCamera) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(CameraTagComponent as any))
      WorldComponent.instance.world.registerComponent(CameraTagComponent)
    components.push(CameraTagComponent as any)

    if ((object3d as any).isOrthographicCamera) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(OrthographicCameraTagComponent as any))
        WorldComponent.instance.world.registerComponent(OrthographicCameraTagComponent)
      components.push(OrthographicCameraTagComponent as any)
    } else if ((object3d as any).isPerspectiveCamera) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(PerspectiveCameraTagComponent as any))
        WorldComponent.instance.world.registerComponent(PerspectiveCameraTagComponent)
      components.push(PerspectiveCameraTagComponent as any)
    }
    if ((object3d as any).isArrayCamera) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(ArrayCameraTagComponent as any))
        WorldComponent.instance.world.registerComponent(ArrayCameraTagComponent)
      components.push(ArrayCameraTagComponent as any)
    } else if (object3d.type === "CubeCamera") {
      if (!WorldComponent.instance.world.hasRegisteredComponent(CubeCameraTagComponent as any))
        WorldComponent.instance.world.registerComponent(CubeCameraTagComponent)
      components.push(CubeCameraTagComponent as any)
    } else if ((object3d as any).isImmediateRenderObject) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(ImmediateRenderObjectTagComponent as any))
        WorldComponent.instance.world.registerComponent(ImmediateRenderObjectTagComponent)
      components.push(ImmediateRenderObjectTagComponent as any)
    }
  } else if ((object3d as any).isLight) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(LightTagComponent as any))
      WorldComponent.instance.world.registerComponent(LightTagComponent)
    components.push(LightTagComponent as any)

    if ((object3d as any).isAmbientLight) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(AmbientLightTagComponent as any))
        WorldComponent.instance.world.registerComponent(AmbientLightTagComponent)
      components.push(AmbientLightTagComponent as any)
    } else if ((object3d as any).isDirectionalLight) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(DirectionalLightTagComponent as any))
        WorldComponent.instance.world.registerComponent(DirectionalLightTagComponent)
      components.push(DirectionalLightTagComponent as any)
    } else if ((object3d as any).isHemisphereLight) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(HemisphereLightTagComponent as any))
        WorldComponent.instance.world.registerComponent(HemisphereLightTagComponent)
      components.push(HemisphereLightTagComponent as any)
    } else if ((object3d as any).isPointLight) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(PointLightTagComponent as any))
        WorldComponent.instance.world.registerComponent(PointLightTagComponent)
      components.push(PointLightTagComponent as any)
    } else if ((object3d as any).isRectAreaLight) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(RectAreaLightTagComponent as any))
        WorldComponent.instance.world.registerComponent(RectAreaLightTagComponent)
      components.push(RectAreaLightTagComponent as any)
    } else if ((object3d as any).isSpotLight) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(SpotLightTagComponent as any))
        WorldComponent.instance.world.registerComponent(SpotLightTagComponent)
      components.push(SpotLightTagComponent as any)
    }
  } else if ((object3d as any).isLightProbe) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(LightProbeTagComponent as any))
      WorldComponent.instance.world.registerComponent(LightProbeTagComponent)
    components.push(LightProbeTagComponent as any)

    if ((object3d as any).isAmbientLightProbe) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(AmbientLightProbeTagComponent as any))
        WorldComponent.instance.world.registerComponent(AmbientLightProbeTagComponent)
      components.push(AmbientLightProbeTagComponent as any)
    } else if ((object3d as any).isHemisphereLightProbe) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(HemisphereLightProbeTagComponent as any))
        WorldComponent.instance.world.registerComponent(HemisphereLightProbeTagComponent)
      components.push(HemisphereLightProbeTagComponent as any)
    }
  } else if ((object3d as any).isBone) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(BoneTagComponent as any))
      WorldComponent.instance.world.registerComponent(BoneTagComponent)
    components.push(BoneTagComponent as any)
  } else if ((object3d as any).isGroup) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(GroupTagComponent as any))
      WorldComponent.instance.world.registerComponent(GroupTagComponent)
    components.push(GroupTagComponent as any)
  } else if ((object3d as any).isLOD) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(LODTagComponent as any))
      WorldComponent.instance.world.registerComponent(LODTagComponent)
    components.push(LODTagComponent as any)
  } else if ((object3d as any).isMesh) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(MeshTagComponent as any))
      WorldComponent.instance.world.registerComponent(MeshTagComponent)
    components.push(MeshTagComponent as any)

    if ((object3d as any).isInstancedMesh) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(InstancedMeshTagComponent as any))
        WorldComponent.instance.world.registerComponent(InstancedMeshTagComponent)
      components.push(InstancedMeshTagComponent as any)
    } else if ((object3d as any).isSkinnedMesh) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(SkinnedMeshTagComponent as any))
        WorldComponent.instance.world.registerComponent(SkinnedMeshTagComponent)
      components.push(SkinnedMeshTagComponent as any)
    }
  } else if ((object3d as any).isLine) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(LineTagComponent as any))
      WorldComponent.instance.world.registerComponent(LineTagComponent)
    components.push(LineTagComponent as any)

    if ((object3d as any).isLineLoop) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(LineLoopTagComponent as any))
        WorldComponent.instance.world.registerComponent(LineLoopTagComponent)
      components.push(HemisphereLightProbeTagComponent as any)
    } else if ((object3d as any).isLineSegments) {
      if (!WorldComponent.instance.world.hasRegisteredComponent(LineSegmentsTagComponent as any))
        WorldComponent.instance.world.registerComponent(LineSegmentsTagComponent)
      components.push(LineSegmentsTagComponent as any)
    }
  } else if ((object3d as any).isPoints) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(PointsTagComponent as any))
      WorldComponent.instance.world.registerComponent(PointsTagComponent)
    components.push(PointsTagComponent as any)
  } else if ((object3d as any).isSprite) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(SpriteTagComponent as any))
      WorldComponent.instance.world.registerComponent(SpriteTagComponent)
    components.push(SpriteTagComponent as any)
  } else if ((object3d as any).isScene) {
    if (!WorldComponent.instance.world.hasRegisteredComponent(SceneTagComponent as any))
      WorldComponent.instance.world.registerComponent(SceneTagComponent)
    components.push(SceneTagComponent as any)
  }
  return components
}
*/
