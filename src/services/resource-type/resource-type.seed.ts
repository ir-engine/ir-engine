export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'resource-type',
  randomize: false,
  templates:
        [
          { name: 'accessControlScope' },
          { name: 'accessControl' },
          { name: 'attribution' },
          { name: 'collection' },
          { name: 'collectionType' },
          { name: 'component' },
          { name: 'componentType' },
          { name: 'entity' },
          { name: 'entityType' },
          { name: 'party' },
          { name: 'partyUser' },
          { name: 'instance' },
          { name: 'identityProviderType' },
          { name: 'license' },
          { name: 'location' },
          { name: 'locationUser' },
          { name: 'group' },
          { name: 'groupUser' },
          { name: 'resourceType' },
          { name: 'userRole' },
          { name: 'staticResource' },
          { name: 'staticResourceType' },
          { name: 'user' }
        ]
}

export default seed
