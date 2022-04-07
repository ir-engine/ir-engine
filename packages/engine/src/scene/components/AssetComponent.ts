import { AssetType } from 'src/assets/enum/AssetType'
import { createMappedComponent } from 'src/ecs/functions/ComponentFunctions'

export type AssetId = string

export type AssetComponentType = {
  path: AssetId
  metadata?: {
    author?: string
    license?: string
  }
  loaded: boolean
}

export const AssetComponent = createMappedComponent<AssetComponentType>('AssetComponent')
