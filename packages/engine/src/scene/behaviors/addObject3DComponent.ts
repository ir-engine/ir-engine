/** This Module contains function to perform different operations on
 *    {@link https://threejs.org/docs/#api/en/core/Object3D | Object3D } from three.js library.
 * @packageDocumentation
 * */

import { Object3DComponent } from '../components/Object3DComponent'
import { Object3D } from 'three'
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
  GroupTagComponent,
  HemisphereLightProbeTagComponent,
  HemisphereLightTagComponent,
  ImmediateRenderObjectTagComponent,
  InstancedMeshTagComponent,
  LightProbeTagComponent,
  LightTagComponent,
  LineSegmentsTagComponent,
  LineTagComponent,
  LODTagComponent,
  MeshTagComponent,
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
} from '../components/Object3DTagComponents'
import { Entity } from '../../ecs/classes/Entity'
import { Component } from '../../ecs/classes/Component'
import { hasComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions'
import { SkyboxComponent } from '../components/SkyboxComponent'

import { createObject3dFromArgs } from './createObject3dFromArgs'

/**
 * Add Object3D Component with args into Entity from the Behavior.
 */

export const addObject3DComponent = <T extends Object3D>(
  entity: Entity,
  obj3D: T | (new (...args: any[]) => T),
  objArgs?: any,
  parentEntity?: Entity
) => {
  const object3d = createObject3dFromArgs(entity, obj3D, true, objArgs, parentEntity)

  addComponent(entity, Object3DComponent, { value: object3d })

  const components: Array<Component<any>> = []
  if (object3d.type === 'Audio' && (object3d as any).panner !== undefined) {
    components.push(PositionalAudioTagComponent as any)
  }
  if (object3d.type === 'Audio' && (object3d as any).panner !== undefined) {
    components.push(PositionalAudioTagComponent as any)
  } else if (object3d.type === 'Audio') {
    components.push(AudioTagComponent as any)
  } else if (object3d.type === 'AudioListener') {
    components.push(AudioListenerTagComponent as any)
  } else if ((object3d as any).isCamera) {
    components.push(CameraTagComponent as any)

    if ((object3d as any).isOrthographicCamera) {
      components.push(OrthographicCameraTagComponent as any)
    } else if ((object3d as any).isPerspectiveCamera) {
      components.push(PerspectiveCameraTagComponent as any)
    }
    if ((object3d as any).isArrayCamera) {
      components.push(ArrayCameraTagComponent as any)
    } else if (object3d.type === 'CubeCamera') {
      components.push(CubeCameraTagComponent as any)
    } else if ((object3d as any).isImmediateRenderObject) {
      components.push(ImmediateRenderObjectTagComponent as any)
    }
  } else if ((object3d as any).isLight) {
    components.push(LightTagComponent as any)
    if ((object3d as any).isAmbientLight) {
      components.push(AmbientLightTagComponent as any)
    } else if ((object3d as any).isDirectionalLight) {
      components.push(DirectionalLightTagComponent as any)
    } else if ((object3d as any).isHemisphereLight) {
      components.push(HemisphereLightTagComponent as any)
    } else if ((object3d as any).isPointLight) {
      components.push(PointLightTagComponent as any)
    } else if ((object3d as any).isRectAreaLight) {
      components.push(RectAreaLightTagComponent as any)
    } else if ((object3d as any).isSpotLight) {
      components.push(SpotLightTagComponent as any)
    }
  } else if ((object3d as any).isLightProbe) {
    components.push(LightProbeTagComponent as any)
    if ((object3d as any).isAmbientLightProbe) {
      components.push(AmbientLightProbeTagComponent as any)
    } else if ((object3d as any).isHemisphereLightProbe) {
      components.push(HemisphereLightProbeTagComponent as any)
    }
  } else if ((object3d as any).isBone) {
    components.push(BoneTagComponent as any)
  } else if ((object3d as any).isGroup) {
    components.push(GroupTagComponent as any)
  } else if ((object3d as any).isLOD) {
    components.push(LODTagComponent as any)
  } else if ((object3d as any).isMesh) {
    components.push(MeshTagComponent as any)

    if ((object3d as any).isInstancedMesh) {
      components.push(InstancedMeshTagComponent as any)
    } else if ((object3d as any).isSkinnedMesh) {
      components.push(SkinnedMeshTagComponent as any)
    }
  } else if ((object3d as any).isLine) {
    components.push(LineTagComponent as any)

    if ((object3d as any).isLineLoop) {
      components.push(HemisphereLightProbeTagComponent as any)
    } else if ((object3d as any).isLineSegments) {
      components.push(LineSegmentsTagComponent as any)
    }
  } else if ((object3d as any).isPoints) {
    components.push(PointsTagComponent as any)
  } else if ((object3d as any).isSprite) {
    components.push(SpriteTagComponent as any)
  } else if ((object3d as any).isScene) {
    components.push(SceneTagComponent as any)
  } else if ((object3d as any).isSky) {
    components.push(SkyboxComponent as any)
  }

  components.forEach((component: any) => {
    addComponent(entity, component)
  })
  if (parentEntity && hasComponent(parentEntity, Object3DComponent as any)) {
    getComponent<Object3DComponent>(parentEntity, Object3DComponent).value.add(object3d)
  }
  object3d.entity = entity
  return entity
}
