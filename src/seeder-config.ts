import license from './licenses/mit.json'

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
      path: 'relationship-type',
      templates:
        [
          { name: 'requested' }, // Default state of user2
          { name: 'denied' }, // user2 denied user1 friend request
          { name: 'friend' }, // Default state of user1 on friend request
          { name: 'blocked' } // Default state of user1 on blocking user2
        ]
    },
    {
      disabled: false,
      delete: true,
      path: 'resource-type',
      templates: [
        { name: 'image' },
        { name: 'video' }, // parse metadata for video type (eg 360-eac)
        { name: 'audio' },
        { name: 'model3d' },
        { name: 'script' },
        { name: 'volumetric' }, // any volumetric file, parse metadata for type
        { name: 'json' }, // JSON data
        { name: 'data' } // arbitrary data of any other type
      ]
    },
    // FAKES
    // TODO: If production, disable
    // {
    //   disabled: false,
    //   delete: false,
    //   path: 'user',
    //   template: {
    //     email: '{{internet.email}}',
    //     password: '{{internet.password}}',
    //     isVerified: true
    //   }
    // },
    {
      disabled: false,
      delete: true,
      path: 'attribution',
      template: {
        source: 'YouTube',
        creator: '{{name.firstName}} {{name.lastName}}',
        url: '{{image.imageUrl}}',
        license: { type: 'ID', faker: { fk: 'license:random' } }
      }
    },
    {
      disabled: false,
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
      disabled: false,
      delete: true,
      path: 'component',
      template: {
        data: '{}',
        component_type: { type: 'ID', faker: { fk: 'component_type:random' } },
        entity: { type: 'ID', faker: { fk: 'entity:random' } }
      }
    },
    {
      disabled: false,
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
    // {
    //   disabled: false,
    //   delete: true,
    //   path: 'group',
    //   template: {
    //     // Groups are semi-ephemeral, and have no properties other than ID
    //   }
    // },
    // {
    //   disabled: false,
    //   delete: true,
    //   path: 'instance',
    //   template: {
    //     location: { type: 'ID', faker: { fk: 'location:random' } },
    //     url: '{{internet.url}}'
    //   }
    // },
    {
      disabled: false,
      delete: true,
      path: 'license',
      template: {
        name: license.name,
        text: license.text
      }
    },
    // {
    //   disabled: false,
    //   delete: true,
    //   path: 'location',
    //   template: {
    //     name: 'test location',
    //     instance: [
    //       { type: 'ID', faker: { fk: 'instance:random' } }
    //     ]
    //   }
    // },
    {
      disabled: false,
      delete: true,
      path: 'organization',
      template: {
        name: 'test organization'
      }
    },
    // {
    //   disabled: false,
    //   delete: true,
    //   path: 'resource',
    //   template: {
    //     name: 'test resource',
    //     description: 'a test resource for the database',
    //     resource_type: { type: 'ID', faker: { fk: 'resource_type:random' } },
    //     url: '{{internet.url}}',
    //     mime_type: '{{system.mimeType}}',
    //     metadata: {},
    //     attribution: { type: 'ID', faker: { fk: 'attribution:random' } },
    //     component: [{ type: 'ID', faker: { fk: 'component:random' } }],
    //     user: [{ type: 'ID', faker: { fk: 'user:random' } }]
    //   }
    // },
    // // // Relationship tables
    // {
    //   disabled: false,
    //   delete: true,
    //   path: 'group-user',
    //   template: {
    //     group: {
    //       type: 'ID', faker: { fk: 'group:random' }
    //     },
    //     user: {
    //       type: 'ID', faker: { fk: 'user:random' }
    //     }
    //   }
    // },
    // {
    //   disabled: false,
    //   delete: true,
    //   path: 'relationship',
    //   template: {
    //     userOne: {
    //       type: 'ID', faker: { fk: 'user:random' }
    //     },
    //     userTwo: {
    //       type: 'ID', faker: { fk: 'user:random' }
    //     },
    //     userOneRelationshipType: {
    //       type: 'ID', faker: { fk: 'relationship_type:random' }
    //     },
    //     userTwoRelationshipType: {
    //       type: 'ID', faker: { fk: 'relationship_type:random' }
    //     }
    //   }
    // },
    // {
    //   disabled: false,
    //   delete: true,
    //   path: 'user-entity',
    //   template: {
    //     user: {
    //       type: 'ID', faker: { fk: 'user:random' }
    //     },
    //     entity: {
    //       type: 'ID', faker: { fk: 'entity:random' }
    //     }
    //   }
    // }
  ]
}
