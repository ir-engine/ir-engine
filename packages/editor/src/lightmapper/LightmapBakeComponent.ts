import { defineComponent, S } from '@ir-engine/ecs'
import { Mesh, OrthographicCamera, WebGLRenderTarget } from 'three'
import { LightmapperMaterial } from './LightmapperMaterial'

export const LightmapBakeComponent = defineComponent({
  name: 'LightmapBakeComponent',
  jsonID: 'IR_lightmapbake',

  schema: S.Object({
    entities: S.Array(S.Entity()),
    renderTarget: S.Type<WebGLRenderTarget>({ serialized: false }),
    raycastMesh: S.Type<Mesh>({ serialized: false }),
    orthographicCamera: S.Type<OrthographicCamera>({ serialized: false }),
    raycastMaterial: S.Type<LightmapperMaterial>({ serialized: false })
  })
})
