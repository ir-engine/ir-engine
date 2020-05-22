import AccessControlSeed from './services/access-control/access-control.seed'
import AccessControlScopeSeed from './services/access-control-scope/access-control-scope.seed'
import CollectionType from './services/collection-type/collection-type.seed'
import ComponentTypeSeed from './services/component-type/component-type.seed'
import EntityTypeSeed from './services/entity-type/entity-type.seed'
import GroupUserRankSeed from './services/group-user-rank/group-user-rank.seed'
import IdentityProviderTypeSeed from './services/identity-provider-type/identity-provider-type.seed'
import ResourceTypeSeed from './services/resource-type/resource-type.seed'
import StaticResourceTypeSeed from './services/static-resource-type/static-resource-type.seed'
import SubscriptionTypeSeed from './services/subscription-type/subscription-type.seed'
import UserRelationshipTypeSeed from './services/user-relationship-type/user-relationship-type.seed'
import UserRoleSeed from './services/user-role/user-role.seed'

module.exports = {
  services: [
    AccessControlScopeSeed,
    AccessControlSeed,
    CollectionType,
    ComponentTypeSeed,
    EntityTypeSeed,
    GroupUserRankSeed,
    IdentityProviderTypeSeed,
    ResourceTypeSeed,
    StaticResourceTypeSeed,
    SubscriptionTypeSeed,
    UserRelationshipTypeSeed,
    UserRoleSeed
  ]
}
