import { BehaveGraphSystem } from '../behave-graph/systems/BehaveGraphSystem'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { MountPointSystem } from '../interaction/systems/MountPointSystem'
import { MaterialLibrarySystem } from '../renderer/materials/systems/MaterialLibrarySystem'
import { LightSystem } from './systems/LightSystem'
import { LODSystem } from './systems/LODSystem'
import { ParticleSystem } from './systems/ParticleSystemSystem'
import { PortalLoadSystem } from './systems/PortalLoadSystem'
import { SceneLoadingSystem } from './systems/SceneLoadingSystem'
import { SceneObjectDynamicLoadSystem } from './systems/SceneObjectDynamicLoadSystem'
import { SceneObjectSystem } from './systems/SceneObjectSystem'
import { SceneObjectUpdateSystem } from './systems/SceneObjectUpdateSystem'

export const SceneSystemUpdateGroup = defineSystem({
  uuid: 'ee.engine.scene.SceneSystemUpdateGroup',
  subSystems: [BehaveGraphSystem, ParticleSystem, LightSystem, SceneObjectSystem, MountPointSystem]
})

export const SceneSystemLoadGroup = defineSystem({
  uuid: 'ee.engine.scene.SceneSystemLoadGroup',
  subSystems: [
    SceneLoadingSystem,
    LODSystem,
    PortalLoadSystem,
    SceneObjectDynamicLoadSystem,
    MaterialLibrarySystem,
    SceneObjectUpdateSystem
  ]
})
