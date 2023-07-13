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

import { SceneElementsRecord } from '@etherealengine/common/src/interfaces/SceneInterface'
import AmbientLightNodeEditor from '@etherealengine/editor/src/components/properties/AmbientLightNodeEditor'
import DirectionalLightNodeEditor from '@etherealengine/editor/src/components/properties/DirectionalLightNodeEditor'
import HemisphereLightNodeEditor from '@etherealengine/editor/src/components/properties/HemisphereLightNodeEditor'
import PointLightNodeEditor from '@etherealengine/editor/src/components/properties/PointLightNodeEditor'
import SpotLightNodeEditor from '@etherealengine/editor/src/components/properties/SpotLightNodeEditor'

import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AmbientLightComponent } from '../components/AmbientLightComponent'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { HemisphereLightComponent } from '../components/HemisphereLightComponent'
import { PointLightComponent } from '../components/PointLightComponent'
import { SelectTagComponent } from '../components/SelectTagComponent'
import { SpotLightComponent } from '../components/SpotLightComponent'
import { VisibleComponent } from '../components/VisibleComponent'

export const LightElements: SceneElementsRecord = {
  ambientLight: {
    name: 'Ambient Light',
    components: [{ name: VisibleComponent.jsonID }, { name: AmbientLightComponent.jsonID }],
    icon: AmbientLightNodeEditor.iconComponent
  },
  directionalLight: {
    name: 'Directional Light',
    components: [
      { name: VisibleComponent.jsonID },
      { name: TransformComponent.jsonID },
      { name: DirectionalLightComponent.jsonID }
    ],
    icon: DirectionalLightNodeEditor.iconComponent
  },
  hemisphereLight: {
    name: 'Hemisphere Light',
    components: [{ name: VisibleComponent.jsonID }, { name: HemisphereLightComponent.jsonID }],
    icon: HemisphereLightNodeEditor.iconComponent
  },
  pointLight: {
    name: 'Point Light',
    components: [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: PointLightComponent.jsonID }
    ],
    icon: PointLightNodeEditor.iconComponent
  },
  spotLight: {
    name: 'Spot Light',
    components: [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: SpotLightComponent.jsonID }
    ],
    icon: SpotLightNodeEditor.iconComponent
  }
}

const directionalLightSelectQuery = defineQuery([TransformComponent, DirectionalLightComponent, SelectTagComponent])

const execute = () => {
  for (const entity of directionalLightSelectQuery()) {
    const helper = getComponent(entity, DirectionalLightComponent)?.helper
    if (helper) helper.update()
    // light.cameraHelper.update()
  }
}

export const LightSystem = defineSystem({
  uuid: 'ee.engine.LightSystem',
  execute
})
