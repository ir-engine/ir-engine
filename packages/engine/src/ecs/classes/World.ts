import { EventQueue } from '@dimforge/rapier3d-compat'
import { State } from '@hookstate/core'
import * as bitecs from 'bitecs'
import {
  AxesHelper,
  BoxGeometry,
  Group,
  LinearToneMapping,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  Raycaster,
  Scene,
  Shader,
  ShadowMapType,
  SphereGeometry,
  ToneMapping,
  Vector2
} from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { ComponentJson, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { getState } from '@etherealengine/hyperflux'
import { createState, hookstate } from '@etherealengine/hyperflux/functions/StateFunctions'

import { DEFAULT_LOD_DISTANCES } from '../../assets/constants/LoaderConstants'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { CameraMode } from '../../camera/types/CameraMode'
import { ProjectionType } from '../../camera/types/ProjectionType'
import { SceneLoaderType } from '../../common/constants/PrefabFunctionType'
import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { ButtonInputStateType } from '../../input/InputState'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { PhysicsWorld } from '../../physics/classes/Physics'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { FogType } from '../../scene/constants/FogType'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { defaultPostProcessingSchema } from '../../scene/constants/PostProcessing'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import {
  setLocalTransformComponent,
  setTransformComponent,
  TransformComponent
} from '../../transform/components/TransformComponent'
import { Widget } from '../../xrui/Widgets'
import {
  addComponent,
  Component,
  ComponentType,
  defineQuery,
  EntityRemovedComponent,
  getComponent,
  getComponentState,
  hasComponent,
  Query,
  QueryComponents,
  setComponent
} from '../functions/ComponentFunctions'
import { createEntity, removeEntity } from '../functions/EntityFunctions'
import { EntityTreeComponent, initializeSceneEntity } from '../functions/EntityTree'
import { SystemInstance, unloadAllSystems } from '../functions/SystemFunctions'
import { SystemUpdateType } from '../functions/SystemUpdateType'
import { Engine } from './Engine'
import { EngineState } from './EngineState'
import { Entity, UndefinedEntity } from './Entity'

const logger = multiLogger.child({ component: 'engine:ecs:World' })

export const CreateWorld = Symbol('CreateWorld')
/** @todo rename Scene */
export class World {
  private constructor() {
    Engine.instance.currentWorld = this

    // @todo do this as the scene loads instead of world creation
    initializeSceneEntity(this)

    this.scene.matrixAutoUpdate = false
    this.scene.matrixWorldAutoUpdate = false

    this.scene.layers.set(ObjectLayers.Scene)
  }

  static [CreateWorld] = () => new World()

  /**
   * Map of object lists by layer
   * (automatically updated by the SceneObjectSystem)
   */
  objectLayerList = {} as { [layer: number]: Set<Object3D> }

  /**
   * The scene entity
   *  @todo support multiple scenes
   */
  sceneEntity: Entity = UndefinedEntity

  /**
   * Reference to the three.js scene object.
   */
  scene = new Scene()

  sceneJson = null! as SceneJson

  fogShaders = [] as Shader[]

  sceneMetadataRegistry = {} as Record<
    string,
    {
      state: State<any>
      default: any
    }
  >
}

export function createWorld() {
  return World[CreateWorld]()
}

export function destroyWorld(world: World) {
  unloadAllSystems()
  /** @todo this is broken - re-enable with next bitecs update */
  // bitecs.deleteWorld(world)
}
