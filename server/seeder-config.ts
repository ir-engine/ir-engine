import CollectionType from './services/collection-type/collection-type.seed'
import ComponentTypeSeed from './services/component-type/component-type.seed'
import EntityTypeSeed from './services/entity-type/entity-type.seed'
import GroupUserRankSeed from './services/group-user-rank/group-user-rank.seed'
import InviteTypeSeed from './services/invite-type/invite-type.seed'
import SeatStatusSeed from './services/seat-status/seat-status.seed'
import StaticResourceTypeSeed from './services/static-resource-type/static-resource-type.seed'
import SubscriptionLevelSeed from './services/subscription-level/subscription-level.seed'
import SubscriptionTypeSeed from './services/subscription-type/subscription-type.seed'
import UserRelationshipTypeSeed from './services/user-relationship-type/user-relationship-type.seed'
import UserRoleSeed from './services/user-role/user-role.seed'

module.exports = {
  services: [
    CollectionType,
    ComponentTypeSeed,
    EntityTypeSeed,
    GroupUserRankSeed,
    InviteTypeSeed,
    SeatStatusSeed,
    StaticResourceTypeSeed,
    SubscriptionLevelSeed,
    SubscriptionTypeSeed,
    UserRelationshipTypeSeed,
    UserRoleSeed
  ]
}
