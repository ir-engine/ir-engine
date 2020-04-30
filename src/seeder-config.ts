import license from './licenses/mit.json'

import AccessControlSeed from './services/access-control/access-control.seed'
import AccessControlScopeSeed from './services/access-control-scope/access-control-scope.seed'
import CollectionType from './services/collection-type/collection-type.seed'
import ComponentTypeSeed from './services/component-type/component-type.seed'
import EntityTypeSeed from './services/entity-type/entity-type.seed'
import UserRelationshipTypeSeed from './services/user-relationship-type/user-relationship-type.seed'
import UserRoleSeed from './services/user-role/user-role.seed'
import GroupUserRankSeed from './services/group-user-rank/group-user-rank.seed'
import ResourceTypeSeed from './services/resource-type/resource-type.seed'
import StaticResourceTypeSeed from './services/static-resource-type/static-resource-type.seed'

const disabled = (process.env.FORCE_DB_REFRESH !== 'true' && process.env.GENERATE_FAKES !== 'true')

module.exports = {
  services: [
    // TYPES
    CollectionType,
    ComponentTypeSeed,
    EntityTypeSeed,
    UserRelationshipTypeSeed,
    UserRoleSeed,
    GroupUserRankSeed,
    ResourceTypeSeed,
    AccessControlScopeSeed,
    AccessControlSeed,
    StaticResourceTypeSeed,
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
      path: 'party',
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
      path: 'group',
      template: {
        name: 'test group'
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
