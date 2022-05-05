export interface UserRelationshipInterface {
  id: string
  userId: string
  relatedUserId: string
  userRelationshipType: 'friend' | 'requested'
  dataValues: any
}
