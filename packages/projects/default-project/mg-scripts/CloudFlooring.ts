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
//import { System } from '../../packages/engine/src/ecs/classes/'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

export default async function DemoUpdate(world: World) {
  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshBasicMaterial({ color: 0xffffff })
  const cube = new Mesh(geometry, material)
  Engine.scene.add(cube)

  var speed1 = 0.0125
  var speed2 = speed1 / 4
  var speed3 = speed2 / 4

  var loader1 = new TextureLoader()
  var loader2 = new TextureLoader()
  var loader3 = new TextureLoader()

  var floorMaterial1 = new MeshBasicMaterial({ side: DoubleSide, transparent: true })
  var floorMaterial2 = new MeshBasicMaterial({ side: DoubleSide, transparent: true })
  var floorMaterial3 = new MeshBasicMaterial({ side: DoubleSide, transparent: true })

  loader1.load('/static/editor/cloud2.png', function (texture) {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(10, 10)
    floorMaterial1.map = texture
    floorMaterial1.needsUpdate = true

    floorMaterial1.blending = NormalBlending
  })
  var floorGeometry1 = new PlaneGeometry(10000, 10000, 50, 50)
  var floor1 = new Mesh(floorGeometry1, floorMaterial1)
  floor1.position.y = -0.5
  floor1.rotation.x = Math.PI / 2

  // cloud 2
  loader2.load('/static/editor/cloud2.png', function (texture) {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(5, 5)
    floorMaterial2.map = texture
    floorMaterial2.needsUpdate = true

    floorMaterial2.blending = NormalBlending
  })
  var floorGeometry2 = new PlaneGeometry(10000, 10000, 50, 50)
  var floor2 = new Mesh(floorGeometry2, floorMaterial2)
  floor2.position.y = -0.8
  floor2.rotation.x = Math.PI / 2

  // cloud 2
  loader3.load('/static/editor/cloud1.png', function (texture) {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(2, 2)
    floorMaterial3.map = texture
    floorMaterial3.needsUpdate = true

    floorMaterial3.blending = NormalBlending
  })
  var floorGeometry3 = new PlaneGeometry(10000, 10000, 50, 50)
  var floor3 = new Mesh(floorGeometry3, floorMaterial3)
  floor3.position.y = -1
  floor3.rotation.x = Math.PI / 2

  Engine.scene.add(floor1)
  Engine.scene.add(floor2)
  Engine.scene.add(floor3)

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
  //scene.add(floor);

  //const sphere = world.namedEntities.get('Sphere')

  const sphere = Engine.scene.getObjectByName('Sphere')

  //var sphereObject = getComponent(sphere, Object3DComponent)

  return () => {
    delta = clock.getDelta()
    floorMaterial1.map?.offset.set(
      floorMaterial1.map?.offset.x + speed1 * delta,
      floorMaterial1.map?.offset.y + speed1 * clock.getDelta()
    )
    floorMaterial2.map?.offset.set(
      floorMaterial2.map?.offset.x + speed2 * delta,
      floorMaterial2.map?.offset.y + speed2 * clock.getDelta()
    )
    floorMaterial3.map?.offset.set(
      floorMaterial3.map?.offset.x + speed3 * delta,
      floorMaterial3.map?.offset.y + speed3 * clock.getDelta()
    )
    //console.log("Updating Demo")

    floor1.material = floorMaterial1
    floor2.material = floorMaterial2
    floor3.material = floorMaterial3

    return world
  }
}
