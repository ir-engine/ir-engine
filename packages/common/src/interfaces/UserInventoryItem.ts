export interface UserInventoryItem {
  userInventoryId: string
  quantity: number
  userId: string
  inventoryItemId: string
  sid: string
  name: string
  description?: string
  version: number
  metadata: UserInventoryItemMetaData
  isPublic: number
  url: string
  ownedFileIds?: string
  createdAt: string
  updatedAt: string
  inventoryItemTypeId: string
}

interface UserInventoryItemMetaData {
  name?: string
}
