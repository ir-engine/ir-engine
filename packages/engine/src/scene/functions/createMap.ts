import { Group, Mesh } from 'three'
import { Text } from 'troika-three-text'

import { LoadGLTF } from '../../assets/functions/LoadGLTF'
import { avatarHalfHeight } from '../../avatar/functions/createAvatar'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { getStartCoords } from '../../map'
import { MapComponent } from '../../map/MapComponent'
import { MapProps } from '../../map/MapProps'
import { MapAction, mapReducer } from '../../map/MapReceptor'
import { getPhases, startPhases } from '../../map/functions/PhaseFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { Object3DComponent } from '../components/Object3DComponent'

export async function createMap(entity: Entity, args: MapProps): Promise<void> {
  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?
  const center = await getStartCoords(args)

  addComponent(entity, MapComponent, {})

  const mapObject3D = new Group()
  const navigationRaycastTarget = new Group()

  mapObject3D.name = '(Geographic) Map'

  addComponent(entity, Object3DComponent, {
    value: mapObject3D
  })
  if (args.enableDebug) {
    addComponent(entity, DebugNavMeshComponent, { object3d: new Group() })
  }

  const state = mapReducer(null, MapAction.initialize(center, args.scale?.x))

  // TODO fix hardcoded URL
  const spinnerGLTF = await LoadGLTF(Engine.publicPath + '/projects/default-project/EarthLowPoly.glb')
  const spinner = spinnerGLTF.scene as Mesh
  spinner.position.y = avatarHalfHeight * 2
  spinner.position.z = -150
  state.updateSpinner = spinner

  const updateTextContainer = new Text()

  updateTextContainer.fontSize = 8
  updateTextContainer.color = 0x080808
  updateTextContainer.anchorX = '50%'
  updateTextContainer.anchorY = '50%'
  updateTextContainer.strokeColor = 0x707070
  updateTextContainer.strokeWidth = '1%'
  updateTextContainer.sdfGlyphSize = 32
  updateTextContainer.text = 'Hop, skip, jump...'

  updateTextContainer.position.set(0, 0, -100)

  updateTextContainer.sync()

  state.updateTextContainer = updateTextContainer

  await startPhases(state, await getPhases({ exclude: ['navigation'] }))

  navigationRaycastTarget.scale.setScalar(state.scale)
  Engine.scene.add(navigationRaycastTarget)

  addComponent(entity, NavMeshComponent, {
    /*
  * [Mappa#2](https://github.com/lagunalabsio/mappa/issues/2)
    yukaNavMesh: store.navMesh,
  */
    navTarget: navigationRaycastTarget
  })
}
