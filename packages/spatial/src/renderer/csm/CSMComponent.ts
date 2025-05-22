/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { defineComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { DirectionalLight, Shader as ShaderType, Vector3 } from 'three'
import { T } from '../../schema/schemaFunctions'
import Frustum from './Frustum'

export const CSMComponent = defineComponent({
  name: 'CSMComponent',

  schema: S.Object(
    {
      cascades: S.Number({ default: 5 }),
      maxFar: S.Number({ default: 100 }),
      mode: S.String({ default: 'PRACTICAL' }),
      shadowMapSize: S.Number({ default: 1024 }),
      shadowBias: S.Number({ default: 0 }),
      shadowNormalBias: S.Number({ default: 0 }),
      lightDirection: T.Vec3(new Vector3(1, -1, 1).normalize()),
      lightDirectionUp: T.Vec3(new Vector3(0, 1, 0)),
      lightColor: T.Color(),
      lightIntensity: S.Number({ default: 1 }),
      lightMargin: S.Number({ default: 200 }),
      fade: S.Bool({ default: true }),
      mainFrustum: S.Type<Frustum>({ default: new Frustum() }),
      frustums: S.Array(S.Type<Frustum>()),
      breaks: S.Array(S.Number()),
      sourceLight: S.Type<DirectionalLight | undefined>(),
      lights: S.Array(S.Type<DirectionalLight>({ serialized: false })),
      lightEntities: S.Array(S.Entity()),
      shaders: S.Record(S.String(), S.Type<ShaderType>()),
      needsUpdate: S.Bool({ default: false })
    },
    { serialized: false }
  )
})
