/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { ComponentJson, SceneElementsRecord } from '@etherealengine/common/src/interfaces/SceneInterface'
import GroundPlaneNodeEditor from '@etherealengine/editor/src/components/properties/GroundPlaneNodeEditor'
import GroupNodeEditor from '@etherealengine/editor/src/components/properties/GroupNodeEditor'
import ImageNodeEditor from '@etherealengine/editor/src/components/properties/ImageNodeEditor'
import ModelNodeEditor from '@etherealengine/editor/src/components/properties/ModelNodeEditor'
import ParticleSystemNodeEditor from '@etherealengine/editor/src/components/properties/ParticleSystemNodeEditor'
import { PrefabNodeEditor } from '@etherealengine/editor/src/components/properties/PrefabNodeEditor'
import ScenePreviewCameraNodeEditor from '@etherealengine/editor/src/components/properties/ScenePreviewCameraNodeEditor'
import SpawnPointNodeEditor from '@etherealengine/editor/src/components/properties/SpawnPointNodeEditor'
import SystemNodeEditor from '@etherealengine/editor/src/components/properties/SystemNodeEditor'
import { defineActionQueue } from '@etherealengine/hyperflux'

import { LoopAnimationComponent } from '../../avatar/components/LoopAnimationComponent'
import { EngineActions } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CloudComponent } from '../components/CloudComponent'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { GroundPlaneComponent } from '../components/GroundPlaneComponent'
import { GroupComponent } from '../components/GroupComponent'
import { ImageComponent } from '../components/ImageComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import { InteriorComponent } from '../components/InteriorComponent'
import { LoadVolumeComponent } from '../components/LoadVolumeComponent'
import { ModelComponent } from '../components/ModelComponent'
import { OceanComponent } from '../components/OceanComponent'
import { ParticleSystemComponent } from '../components/ParticleSystemComponent'
import { PrefabComponent } from '../components/PrefabComponent'
import { ScenePreviewCameraComponent } from '../components/ScenePreviewCamera'
import { ShadowComponent } from '../components/ShadowComponent'
import { SpawnPointComponent } from '../components/SpawnPointComponent'
import { SplineComponent } from '../components/SplineComponent'
import { SystemComponent } from '../components/SystemComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { WaterComponent } from '../components/WaterComponent'
import { updateCloud } from '../functions/loaders/CloudFunctions'
import { updateOcean } from '../functions/loaders/OceanFunctions'

export const defaultSpatialComponents: ComponentJson[] = [
  { name: TransformComponent.jsonID },
  { name: VisibleComponent.jsonID },
  { name: ShadowComponent.jsonID }
]

export const SceneElements: SceneElementsRecord = {
  behaveGraph: { name: 'Behave Graph', components: [] },
  cloud: { name: 'Cloud', components: [...defaultSpatialComponents, { name: CloudComponent.jsonID }] },
  groundPlane: {
    name: 'Ground Plane',
    components: [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: ShadowComponent.jsonID, props: { receive: true, cast: false } },
      { name: GroundPlaneComponent.jsonID }
    ],
    icon: GroundPlaneNodeEditor.iconComponent
  },
  group: {
    name: 'Group',
    components: [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: GroupComponent.jsonID }
    ],
    icon: GroupNodeEditor.iconComponent
  },
  image: {
    name: 'Image',
    components: [
      ...defaultSpatialComponents,
      {
        name: ImageComponent.jsonID,
        props: { source: '__$project$__/default-project/assets/sample_etc1s.ktx2' }
      }
    ],
    icon: ImageNodeEditor.iconComponent
  },
  instancing: {
    name: 'Instancing',
    components: [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: InstancingComponent.jsonID }
    ]
  },
  interior: { name: 'Interior', components: [...defaultSpatialComponents, { name: InteriorComponent.jsonID }] },
  loadVolume: { name: 'Load Volume', components: [{ name: LoadVolumeComponent.jsonID }] },
  model: {
    name: 'Model',
    components: [
      ...defaultSpatialComponents,
      { name: ModelComponent.jsonID },
      { name: EnvmapComponent.jsonID },
      { name: LoopAnimationComponent.jsonID }
    ],
    icon: ModelNodeEditor.iconComponent
  },
  ocean: { name: 'Ocean', components: [] },
  particleEmitter: {
    name: 'Particle Emitter',
    components: [...defaultSpatialComponents, { name: ParticleSystemComponent.jsonID }],
    icon: ParticleSystemNodeEditor.iconComponent
  },

  prefab: {
    name: 'Prefab',
    components: [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: PrefabComponent.jsonID }
    ],
    icon: PrefabNodeEditor.iconComponent
  },
  previewCamera: {
    name: 'Preview Camera',
    components: [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: ScenePreviewCameraComponent.jsonID }
    ],
    icon: ScenePreviewCameraNodeEditor.iconComponent
  },

  spawnPoint: {
    name: 'Spawn Point',
    components: [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: SpawnPointComponent.jsonID }
    ],
    icon: SpawnPointNodeEditor.iconComponent
  },
  spline: { name: 'Spline', components: [...defaultSpatialComponents, { name: SplineComponent.jsonID }] },
  system: { name: 'System', components: [{ name: SystemComponent.jsonID }], icon: SystemNodeEditor.iconComponent },
  water: { name: 'Water', components: [...defaultSpatialComponents, { name: WaterComponent.jsonID }] }
}

const cloudQuery = defineQuery([CloudComponent])
const oceanQuery = defineQuery([OceanComponent])
const spawnPointComponent = defineQuery([SpawnPointComponent])

const modifyPropertyActionQueue = defineActionQueue(EngineActions.sceneObjectUpdate.matches)

const execute = () => {
  for (const action of modifyPropertyActionQueue()) {
    for (const entity of action.entities) {
      if (hasComponent(entity, CloudComponent)) updateCloud(entity)
      if (hasComponent(entity, OceanComponent)) updateOcean(entity)
    }
  }

  for (const entity of cloudQuery.enter()) updateCloud(entity)
  for (const entity of oceanQuery.enter()) updateOcean(entity)
  for (const entity of spawnPointComponent()) getComponent(entity, SpawnPointComponent).helperBox?.update()
}

export const SceneObjectUpdateSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectUpdateSystem',
  execute
})
