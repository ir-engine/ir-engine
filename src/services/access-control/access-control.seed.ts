export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'access-control',
  randomize: false,
  templates:
        [
          // ADMIN Access Controls
          {
            userRole: 'admin',
            resourceType: 'accessControlScope',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'accessControl',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'all',
            delete: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'attribution',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'collection',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'collectionType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'component',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'componentType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'entity',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'entityType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'instance',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'license',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'group',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'group-user',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'group-user-rank',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'resourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'userRole',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'staticResource',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'admin',
            resourceType: 'staticResourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'admin',
            resourceType: 'user',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          // MODERATOR access controls
          {
            userRole: 'moderator',
            resourceType: 'accessControlScope',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'accessControl',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'attribution',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'collection',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'collectionType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'component',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'componentType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'entity',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'entityType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'instance',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'license',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'group',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'group-user',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'moderator',
            resourceType: 'group-user-rank',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'moderator',
            resourceType: 'resourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'userRole',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'staticResource',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            userRole: 'moderator',
            resourceType: 'staticResourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'moderator',
            resourceType: 'user',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          // USER access controls
          {
            userRole: 'user',
            resourceType: 'accessControlScope',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'accessControl',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'attribution',
            list: 'self',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'collection',
            list: 'self',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'collectionType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'component',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'componentType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'entity',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'entityType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'instance',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'license',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'group',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'group-user',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'group-user-rank',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'resourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'userRole',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'staticResource',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            userRole: 'user',
            resourceType: 'staticResourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'user',
            resourceType: 'user',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          // GUEST role
          {
            userRole: 'guest',
            resourceType: 'accessControlScope',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'accessControl',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'attribution',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'collection',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'collectionType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'component',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'componentType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'entity',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'entityType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'instance',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'license',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'group',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'group-user',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'group-user-rank',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'resourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'userRole',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'staticResource',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'staticResourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            userRole: 'guest',
            resourceType: 'user',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          }
        ]
}

export default seed
