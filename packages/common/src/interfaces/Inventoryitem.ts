export interface InventoryItem {
  id: string
  sid: string
  name: string
  description?: string
  version: number
  metadata: InventoryItemMetaData
  isPublic: number
  url: string
  createdAt: string
  updatedAt: string
  type: string
}

interface InventoryItemMetaData {
  name?: string
}
