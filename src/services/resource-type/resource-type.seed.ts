export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: (process.env.FORCE_DB_REFRESH === 'true'),
  path: 'resource-type',
  randomize: false,
  templates:
    [
      { type: 'accessControlScope' },
      { type: 'accessControl' },
      { type: 'attribution' },
      { type: 'collection' },
      { type: 'collectionType' },
      { type: 'component' },
      { type: 'componentType' },
      { type: 'entity' },
      { type: 'entityType' },
      { type: 'party' },
      { type: 'partyUser' },
      { type: 'instance' },
      { type: 'identityProviderType' },
      { type: 'license' },
      { type: 'location' },
      { type: 'locationUser' },
      { type: 'group' },
      { type: 'groupUser' },
      { type: 'resourceType' },
      { type: 'userRole' },
      { type: 'staticResource' },
      { type: 'staticResourceType' },
      { type: 'user' }
    ]
}

export default seed
