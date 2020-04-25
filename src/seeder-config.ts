import license from './licenses/mit.json'

const disabled = (process.env.FORCE_DB_REFRESH !== 'true' && process.env.GENERATE_FAKES !== 'true')

module.exports = {
  services: [
    // TYPES
    {
      disabled: false,
      delete: true,
      path: 'collection-type',
      templates:
        [
          { name: 'scene' },
          { name: 'inventory' }]
    },
    {
      disabled: false,
      delete: true,
      path: 'component-type',
      randomize: false,
      templates:
        [
          // Default Aframe components
          { name: 'animation' },
          { name: 'background' },
          { name: 'camera' },
          { name: 'cursor' },
          { name: 'debug' },
          { name: 'device-orientation-permission-ui' },
          { name: 'embedded' },
          { name: 'fog' },
          { name: 'geometry' },
          { name: 'gltf-model' },
          { name: 'hand-controls' },
          { name: 'keyboard-shortcuts' },
          { name: 'laser-controls' },
          { name: 'light' },
          { name: 'line' },
          { name: 'link' },
          { name: 'loading-screen' },
          { name: 'look-controls' },
          { name: 'obj-model' },
          { name: 'oculus-go-controls' },
          { name: 'pool' },
          { name: 'position' },
          { name: 'raycaster' },
          { name: 'renderer' },
          { name: 'rotation' },
          { name: 'scale' },
          { name: 'screenshot' },
          { name: 'shadow' },
          { name: 'sound' },
          { name: 'stats' },
          { name: 'text' },
          { name: 'tracked-controls' },
          { name: 'visible' },
          { name: 'vive-controls' },
          { name: 'vive-focus-controls' },
          { name: 'vr-mode-ui' },
          { name: 'wasd-controls' },
          { name: 'windows-motion-controls' },
          // Networked Aframe
          { name: 'networked' },
          // Custom Components
          { name: 'grid' }
        ]
    },
    {
      disabled: false,
      delete: true,
      path: 'entity-type',
      randomize: false,
      templates:
        [
          // Entities that don't have a template don't need a type
          { name: 'default' },
          // Aframe Default Types
          { name: 'box' },
          { name: 'camera' },
          { name: 'circle' },
          { name: 'cone' },
          { name: 'cursor' },
          { name: 'curvedimage' },
          { name: 'dodecahedron' },
          { name: 'gltf-model' },
          { name: 'icosahedron' },
          { name: 'image' },
          { name: 'light' },
          { name: 'link' },
          { name: 'obj-model' },
          { name: 'octahdreon' },
          { name: 'plane' },
          { name: 'ring' },
          { name: 'sky' },
          { name: 'sound' },
          { name: 'sphere' },
          { name: 'tetrahedron' },
          { name: 'text' },
          { name: 'torus-knot' },
          { name: 'torus' },
          { name: 'triangle' },
          { name: 'video' },
          { name: 'videosphere' },
          // Custom Types
          { name: 'grid' }
        ]
    },
    {
      disabled: false,
      delete: true,
      path: 'user-relationship-type',
      randomize: false,
      templates:
        [
          { name: 'requested' }, // Default state of relatedUser
          { name: 'friend' },
          { name: 'blocked' }
        ]
    },
    {
      disabled: false,
      delete: true,
      path: 'user-role',
      templates:
        [
          { name: 'admin' },
          { name: 'moderator' },
          { name: 'user' },
          { name: 'guest' }
        ]
    },
    {
      disabled: false,
      delete: true,
      path: 'organization-user-rank',
      templates:
        [
          { name: 'principal' },
          { name: 'teacer' },
          { name: 'student' }
        ]
    },
    {
      disabled: false,
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
          { name: 'group' },
          { name: 'group-user' },
          { name: 'instance' },
          { name: 'license' },
          { name: 'location' },
          { name: 'location-user' },
          { name: 'organization' },
          { name: 'resourceType' },
          { name: 'userRole' },
          { name: 'staticResource' },
          { name: 'staticResourceType' },
          { name: 'user' }
        ]
    },
    {
      disabled: false,
      delete: true,
      path: 'access-control-scope',
      randomize: false,
      templates:
        [
          { name: 'none' },
          { name: 'self' },
          { name: 'all' }
        ]
    },
    {
      disabled: false,
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
            resourceType: 'organization',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'organization-user',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'admin',
            resourceType: 'organization-user-rank',
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
            resourceType: 'organization',
            list: 'all',
            create: 'all',
            read: 'all',
            update: 'all',
            delete: 'all'
          },
          {
            role: 'moderator',
            resourceType: 'organization-user',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'moderator',
            resourceType: 'organization-user-rank',
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
            resourceType: 'organization',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'organization-user',
            list: 'all',
            create: 'self',
            read: 'all',
            update: 'self',
            delete: 'self'
          },
          {
            role: 'user',
            resourceType: 'organization-user-rank',
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
            resourceType: 'organization',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'organization-user',
            list: 'all',
            create: 'none',
            read: 'all',
            update: 'none',
            delete: 'none'
          },
          {
            role: 'guest',
            resourceType: 'organization-user-rank',
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
    },
    {
      disabled: false,
      delete: true,
      path: 'static-resource-type',
      randomize: false,
      templates: [
        { type: 'image' },
        { type: 'video' }, // parse metadata for video type (eg 360-eac)
        { type: 'audio' },
        { type: 'model3d' },
        { type: 'script' },
        { type: 'volumetric' }, // any volumetric file, parse metadata for type
        { type: 'json' }, // JSON data
        { type: 'data' } // arbitrary data of any other type
      ]
    },
    // GENERATE ADMIN ACCOUNT
    {
      disabled: disabled,
      count: 10,
      delete: false,
      path: 'user',
      template: {
        email: 'admin@admin.com',
        password: 'adminxrchat',
        isVerified: true
      }
    },
    // FAKES - These will not be generated in production
    {
      disabled: disabled,
      count: 10,
      delete: false,
      path: 'user',
      template: {
        email: '{{internet.email}}',
        password: '{{internet.password}}',
        isVerified: true
      }
    },
    {
      disabled: disabled,
      delete: true,
      count: 10,
      path: 'attribution',
      template: {
        source: 'YouTube',
        creator: '{{name.firstName}} {{name.lastName}}',
        url: '{{image.imageUrl}}',
        license: { type: 'ID', faker: { fk: 'license:random' } }
      }
    },
    {
      disabled: disabled,
      delete: true,
      path: 'collection',
      template: {
        name: 'A test scene',
        description: 'A test scene description',
        metadata: '',
        collection_type: { type: 'ID', faker: { fk: 'collection-type:scene' } },
        entity: { type: 'ID', faker: { fk: 'entity:random' } },
        attribution: { type: 'ID', faker: { fk: 'attribution:random' } }
      }
    },
    {
      disabled: disabled,
      delete: true,
      path: 'component',
      template: {
        data: '{}',
        component_type: { type: 'ID', faker: { fk: 'component_type:random' } },
        entity: { type: 'ID', faker: { fk: 'entity:random' } }
      }
    },
    {
      disabled: disabled,
      delete: true,
      path: 'entity',
      templates: [{
        name: 'boxentity',
        type: 'box' // Test archetype
      },
      {
        name: 'defaultentity',
        type: 'default' // Test default empty entity
      }]
    },
    {
      disabled: disabled,
      delete: true,
      path: 'group',
      template: {
        // Groups are semi-ephemeral, and have no properties other than ID
      }
    },
    {
      disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
      delete: true,
      path: 'license',
      template: {
        name: license.name,
        text: license.text
      }
    },
    {
      disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
      delete: true,
      path: 'location',
      template: {
        name: 'test location',
        instances: [
          {
            location: { type: 'ID', faker: { fk: 'location:random' } },
            address: '{{internet.url}}'
          }
        ]
      }
    },
    {
      disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
      delete: true,
      path: 'organization',
      template: {
        name: 'test organization'
      }
    },
    {
      disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
      delete: true,
      path: 'static-resource',
      template: {
        name: 'static test resource',
        description: 'a static test resource for the database',
        resource_type: { type: 'ID', faker: { fk: 'resource_type:random' } },
        url: '{{internet.url}}',
        mime_type: '{{system.mimeType}}',
        metadata: {},
        attribution: { type: 'ID', faker: { fk: 'attribution:random' } },
        component: [{ type: 'ID', faker: { fk: 'component:random' } }],
        user: [{ type: 'ID', faker: { fk: 'user:random' } }]
      }
    }
  ]
}
