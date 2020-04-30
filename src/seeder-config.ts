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

module.exports = {
  services: [
    CollectionType,
    ComponentTypeSeed,
    EntityTypeSeed,
    UserRelationshipTypeSeed,
    UserRoleSeed,
    GroupUserRankSeed,
    ResourceTypeSeed,
    AccessControlScopeSeed,
    AccessControlSeed,
    StaticResourceTypeSeed
  ]
}
