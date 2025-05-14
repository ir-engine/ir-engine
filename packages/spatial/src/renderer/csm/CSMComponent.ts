import { defineComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { DirectionalLight, Shader as ShaderType, Vector3 } from 'three'
import { T } from '../../schema/schemaFunctions'
import { CSMModes } from './CSM'
import Frustum from './Frustum'

export const CSMComponent = defineComponent({
  name: 'CSMComponent',

  schema: S.Object(
    {
      cascades: S.Number({ default: 5 }),
      maxFar: S.Number({ default: 100 }),
      mode: S.String({ default: CSMModes.PRACTICAL }),
      shadowMapSize: S.Number({ default: 1024 }),
      shadowBias: S.Number({ default: 0 }),
      shadowNormalBias: S.Number({ default: 0 }),
      lightDirection: T.Vec3(new Vector3(1, -1, 1).normalize()),
      lightDirectionUp: T.Vec3(new Vector3(0, 1, 0)),
      lightColor: T.Color(),
      lightIntensity: S.Number({ default: 1 }),
      lightMargin: S.Number({ default: 200 }),
      customSplitsCallback: S.Type<
        ((amount: number, near: number, far: number, target: number[]) => void) | undefined
      >(),
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
