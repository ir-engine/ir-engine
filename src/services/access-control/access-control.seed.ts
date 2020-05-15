export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: (process.env.FORCE_DB_REFRESH === 'true'),
  path: 'access-control',
  randomize: false,
  templates:
        [
          // ADMIN Access Controls
          {
            userRole: 'admin',
            resourceType: 'accessControlScope',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'accessControl',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'attribution',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'collection',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'collectionType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'component',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'componentType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'entity',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'entityType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'instance',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'license',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'group',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'group-user',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'group-user-rank',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'resourceType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'userRole',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'staticResource',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'staticResourceType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'user',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          // MODERATOR access controls
          {
            userRole: 'moderator',
            resourceType: 'accessControlScope',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'accessControl',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'attribution',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'collection',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'collectionType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'component',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'componentType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'entity',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'entityType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'instance',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'license',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'group',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'group-user',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'moderator',
            resourceType: 'group-user-rank',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'moderator',
            resourceType: 'resourceType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'userRole',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'staticResource',
            listScope: 'all',
            createScope: 'all',
            readScope: 'all',
            updateScope: 'all',
            deleteScope: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'staticResourceType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'user',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          // USER access controls
          {
            userRole: 'user',
            resourceType: 'accessControlScope',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'accessControl',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'attribution',
            listScope: 'self',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'collection',
            listScope: 'self',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'collectionType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'component',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'componentType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'entity',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'entityType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'instance',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'license',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'group',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'group-user',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'group-user-rank',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'resourceType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'userRole',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'staticResource',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'staticResourceType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'user',
            listScope: 'all',
            createScope: 'self',
            readScope: 'all',
            updateScope: 'self',
            deleteScope: 'self'
          },
          // GUEST role
          {
            userRole: 'guest',
            resourceType: 'accessControlScope',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'accessControl',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'attribution',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'collection',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'collectionType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'component',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'componentType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'entity',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'entityType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'instance',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'license',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'group',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'group-user',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'group-user-rank',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'resourceType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'userRole',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'staticResource',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'staticResourceType',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'user',
            listScope: 'all',
            createScope: 'none',
            readScope: 'all',
            updateScope: 'none',
            deleteScope: 'none'
          }
        ]
}

export default seed
