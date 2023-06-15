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

import { createEntity } from '../../../../ecs/functions/EntityFunctions'
import { parseECSData } from '../../../../scene/functions/loadGLTFModel'
import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export type EE_ecs = {
  data: Record<string, any>
}

export default class EEECSImporterExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_ecs'

  createNodeAttachment(nodeIndex: number) {
    const parser = this.parser
    const json = parser.json
    const nodeDef = json.nodes[nodeIndex]
    if (!nodeDef.extensions?.[this.name]) return null
    const extensionDef: EE_ecs = nodeDef.extensions[this.name]
    const containsECSData = !!extensionDef.data && Object.keys(extensionDef.data).some((k) => k.startsWith('xrengine.'))
    if (!containsECSData) return null
    const entity = createEntity()
    parseECSData(entity, Object.entries(extensionDef.data))
    return null
  }
}
