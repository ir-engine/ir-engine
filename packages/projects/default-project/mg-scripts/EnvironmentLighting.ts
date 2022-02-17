import {
  Vector3,
  Matrix4,
  Material,
  Quaternion,
  Plane,
  PerspectiveCamera,
  Color,
  OrthographicCamera,
  BoxGeometry,
  DirectionalLight,
  MeshBasicMaterial,
  Mesh,
  ImageUtils,
  RepeatWrapping,
  PlaneGeometry,
  DoubleSide,
  TextureLoader,
  NormalBlending,
  Clock
} from 'three'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { RaycastComponent } from '@xrengine/engine/src/physics/components/RaycastComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import debug from 'debug'
import { update } from 'lodash'
//import { System } from '@xrengine/engine/src/ecs/classes/'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

export default async function DemoUpdate(world: World) {
  const KeyLight = new DirectionalLight(new Color('rgb(252, 226, 104)'), 1.2)
  KeyLight.rotation.set(5, 270, 0)
  Engine.scene.add(KeyLight)

  const FillLight = new DirectionalLight(new Color('rgb(108, 204, 248)'), 1.5)
  FillLight.rotation.set(5, 120, 0)
  FillLight.castShadow = false
  Engine.scene.add(FillLight)

  const RimLight = new DirectionalLight(new Color('rgb(166, 25, 252)'), 2.5)
  RimLight.rotation.set(5, 120, 0)
  RimLight.castShadow = false
  Engine.scene.add(RimLight)

  var clock = new Clock()
  var delta = 0

  return () => {
    delta = clock.getDelta()

    return world
  }
}
