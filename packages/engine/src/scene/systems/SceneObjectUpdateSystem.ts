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
import { defineActionQueue } from '@etherealengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { CloudComponent } from '../components/CloudComponent'
import { OceanComponent } from '../components/OceanComponent'
import { SpawnPointComponent } from '../components/SpawnPointComponent'
import { updateCloud } from '../functions/loaders/CloudFunctions'
import { updateOcean } from '../functions/loaders/OceanFunctions'

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
