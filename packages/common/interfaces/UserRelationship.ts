export type RelationshipType = 'friend' | 'requested' | 'blocked' | 'blocking'
export interface UserRelationship {
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  userRelationshipType: RelationshipType
  relatedUserId: string
}
