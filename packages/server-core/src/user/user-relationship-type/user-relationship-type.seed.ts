export const userRelationshipTypeSeed = {
  path: 'user-relationship-type',
  templates: [
    { type: 'requested' }, // Default state of relatedUser. Friend request send to another user
    { type: 'pending' }, // Friend request pending by other user
    { type: 'friend' },
    { type: 'blocking' }, // Blocking another user
    { type: 'blocked' } // Blocked by other user
  ]
}
