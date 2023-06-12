import { StaticResourceInterface } from './StaticResourceInterface'

export interface ModelInterface {
  id: string
  name?: string
  tags?: string[]
  thumbnail?: string
  src: string
  glbStaticResource: StaticResourceInterface
  gltfStaticResource: StaticResourceInterface
  fbxStaticResource: StaticResourceInterface
  usdzStaticResource: StaticResourceInterface
}
