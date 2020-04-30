export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'access-control',
  randomize: false,
  templates:
        [
          // ADMIN Access Controls
          {
            role: 'admin',
            resourceType: 'accessControlScope',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'admin',
            resourceType: 'accessControl',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'all',
            delete: 'none'
          },
          {
            role: 'admin',
            resourceType: 'attribution',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'collection',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'collectionType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'admin',
            resourceType: 'component',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'componentType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'admin',
            resourceType: 'entity',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'entityType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'admin',
            resourceType: 'instance',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'license',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'group',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'group-user',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'group-user-rank',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'resourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'admin',
            resourceType: 'userRole',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'admin',
            resourceType: 'staticResource',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'staticResourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'admin',
            resourceType: 'user',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          // MODERATOR access controls
          {
            role: 'moderator',
            resourceType: 'accessControlScope',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'moderator',
            resourceType: 'accessControl',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'moderator',
            resourceType: 'attribution',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'moderator',
            resourceType: 'collection',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'moderator',
            resourceType: 'collectionType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'moderator',
            resourceType: 'component',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'moderator',
            resourceType: 'componentType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'moderator',
            resourceType: 'entity',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'moderator',
            resourceType: 'entityType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'moderator',
            resourceType: 'instance',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'moderator',
            resourceType: 'license',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'moderator',
            resourceType: 'group',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'moderator',
            resourceType: 'group-user',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'moderator',
            resourceType: 'group-user-rank',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'moderator',
            resourceType: 'resourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'moderator',
            resourceType: 'userRole',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'moderator',
            resourceType: 'staticResource',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'moderator',
            resourceType: 'staticResourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'moderator',
            resourceType: 'user',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          // USER access controls
          {
            role: 'user',
            resourceType: 'accessControlScope',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'user',
            resourceType: 'accessControl',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'user',
            resourceType: 'attribution',
            list: 'self',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'collection',
            list: 'self',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'collectionType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'user',
            resourceType: 'component',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'componentType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'user',
            resourceType: 'entity',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'entityType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'user',
            resourceType: 'instance',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'license',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'group',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'group-user',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'group-user-rank',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'resourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'user',
            resourceType: 'userRole',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'user',
            resourceType: 'staticResource',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'staticResourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'user',
            resourceType: 'user',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          // GUEST role
          {
            role: 'guest',
            resourceType: 'accessControlScope',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'accessControl',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'attribution',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'collection',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'collectionType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'component',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'componentType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'entity',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'entityType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'instance',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'license',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'group',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'group-user',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'group-user-rank',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'resourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'userRole',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'staticResource',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'staticResourceType',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
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
