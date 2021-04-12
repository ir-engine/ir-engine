---
id: "index"
title: "Module: index"
sidebar_label: "index"
custom_edit_url: null
hide_title: true
---

# Module: index

## Table of contents

### Interfaces

- [AuthUser](../interfaces/index.authuser.md)
- [CommentInterface](../interfaces/index.commentinterface.md)
- [Creator](../interfaces/index.creator.md)
- [CreatorShort](../interfaces/index.creatorshort.md)
- [Feed](../interfaces/index.feed.md)
- [FeedDatabaseRow](../interfaces/index.feeddatabaserow.md)
- [FeedShort](../interfaces/index.feedshort.md)
- [IdentityProvider](../interfaces/index.identityprovider.md)
- [Instance](../interfaces/index.instance.md)
- [InstanceServerProvisionResult](../interfaces/index.instanceserverprovisionresult.md)
- [Location](../interfaces/index.location.md)
- [LocationAdmin](../interfaces/index.locationadmin.md)
- [LocationBan](../interfaces/index.locationban.md)
- [LocationSettings](../interfaces/index.locationsettings.md)
- [Relationship](../interfaces/index.relationship.md)
- [ServicesSeedConfig](../interfaces/index.servicesseedconfig.md)
- [StaticResource](../interfaces/index.staticresource.md)
- [User](../interfaces/index.user.md)

## References

### srcEnumsAvatarModel

Renames and exports: [AvatarModelEnum](../enums/src_enums_avatar_model.avatarmodelenum.md)

___

### srcEnumsAxis

Renames and exports: [Axis](../enums/src_enums_axis.axis.md)

___

### srcUtilsCapitalizeFirstLetter

Renames and exports: [default](src_utils_capitalizefirstletter.md#default)

___

### srcUtilsIsExternalUrl

Renames and exports: [default](src_utils_isexternalurl.md#default)

___

### srcUtilsSecondsToString

Renames and exports: [default](src_utils_secondstostring.md#default)

___

### srcUtilsTriggerNavigation

Renames and exports: [default](src_utils_triggernavigation.md#default)

## Type aliases

### Channel

Ƭ **Channel**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`Messages` | [*Message*](src_interfaces_message.md#message)[] |
`channelType` | *string* |
`groupId` | *string* \| *null* |
`id` | *string* |
`instanceId` | *string* \| *null* |
`partyId` | *string* \| *null* |
`userId1` | *string* \| *null* |
`userId2` | *string* \| *null* |

Defined in: [src/interfaces/Channel.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/Channel.ts#L3)

___

### ChannelResult

Ƭ **ChannelResult**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`data` | [*Channel*](src_interfaces_channel.md#channel)[] |
`limit` | *number* |
`skip` | *number* |
`total` | *number* |

Defined in: [src/interfaces/ChannelResult.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/ChannelResult.ts#L3)

___

### FriendResult

Ƭ **FriendResult**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`data` | [*User*](../interfaces/src_interfaces_user.user.md)[] |
`limit` | *number* |
`skip` | *number* |
`total` | *number* |

Defined in: [src/interfaces/FriendResult.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/FriendResult.ts#L3)

___

### Group

Ƭ **Group**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`description` | *string* |
`groupUsers` | [*GroupUser*](src_interfaces_groupuser.md#groupuser)[] |
`id` | *string* |
`name` | *string* |

Defined in: [src/interfaces/Group.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/Group.ts#L3)

___

### GroupResult

Ƭ **GroupResult**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`data` | [*Group*](src_interfaces_group.md#group)[] |
`limit` | *number* |
`skip` | *number* |
`total` | *number* |

Defined in: [src/interfaces/GroupResult.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/GroupResult.ts#L3)

___

### GroupUser

Ƭ **GroupUser**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`groupUserRank` | *string* |
`id` | *string* |
`user` | [*User*](../interfaces/src_interfaces_user.user.md) |

Defined in: [src/interfaces/GroupUser.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/GroupUser.ts#L3)

___

### GroupUserResult

Ƭ **GroupUserResult**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`data` | [*GroupUser*](src_interfaces_groupuser.md#groupuser)[] |
`limit` | *number* |
`skip` | *number* |
`total` | *number* |

Defined in: [src/interfaces/GroupUserResult.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/GroupUserResult.ts#L3)

___

### Invite

Ƭ **Invite**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`createdAt` | *any* |
`id` | *string* |
`invitee` | [*User*](../interfaces/src_interfaces_user.user.md) |
`token` | *string* |
`user` | [*User*](../interfaces/src_interfaces_user.user.md) |

Defined in: [src/interfaces/Invite.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/Invite.ts#L3)

___

### InviteResult

Ƭ **InviteResult**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`data` | [*Invite*](src_interfaces_invite.md#invite)[] |
`limit` | *number* |
`skip` | *number* |
`total` | *number* |

Defined in: [src/interfaces/InviteResult.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/InviteResult.ts#L3)

___

### Message

Ƭ **Message**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`channelId` | *string* |
`createdAt` | *string* |
`id` | *string* |
`messageStatus` | [*MessageStatus*](src_interfaces_messagestatus.md#messagestatus) |
`sender` | [*User*](../interfaces/src_interfaces_user.user.md) |
`senderId` | *string* |
`text` | *string* |
`updatedAt` | *string* |

Defined in: [src/interfaces/Message.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/Message.ts#L4)

___

### MessageResult

Ƭ **MessageResult**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`channelId` | *string* |
`data` | [*Message*](src_interfaces_message.md#message)[] |
`limit` | *number* |
`skip` | *number* |
`total` | *number* |

Defined in: [src/interfaces/MessageResult.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/MessageResult.ts#L3)

___

### MessageStatus

Ƭ **MessageStatus**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`createdAt` | *string* |
`id` | *string* |
`status` | *string* |
`updatedAt` | *string* |
`userId` | *string* |

Defined in: [src/interfaces/MessageStatus.ts:1](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/MessageStatus.ts#L1)

___

### Party

Ƭ **Party**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`id` | *string* |
`partyUsers` | [*PartyUser*](src_interfaces_partyuser.md#partyuser)[] |

Defined in: [src/interfaces/Party.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/Party.ts#L3)

___

### PartyResult

Ƭ **PartyResult**: [*Party*](src_interfaces_party.md#party)

Defined in: [src/interfaces/PartyResult.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/PartyResult.ts#L3)

___

### PartyUser

Ƭ **PartyUser**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`id` | *string* |
`isOwner` | *boolean* |
`user` | [*User*](../interfaces/src_interfaces_user.user.md) |

Defined in: [src/interfaces/PartyUser.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/PartyUser.ts#L3)

___

### PartyUserResult

Ƭ **PartyUserResult**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`data` | [*PartyUser*](src_interfaces_partyuser.md#partyuser)[] |
`limit` | *number* |
`skip` | *number* |
`total` | *number* |

Defined in: [src/interfaces/PartyUserResult.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/PartyUserResult.ts#L3)

___

### RelationshipType

Ƭ **RelationshipType**: *friend* \| *requested* \| *blocked* \| *blocking*

Defined in: [src/interfaces/User.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/User.ts#L5)

## Variables

### AuthUserSeed

• `Const` **AuthUserSeed**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`accessToken` | *string* |
`authentication` | *object* |
`authentication.strategy` | *string* |
`identityProvider` | [*IdentityProvider*](../interfaces/src_interfaces_identityprovider.identityprovider.md) |

Defined in: [src/interfaces/AuthUser.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/AuthUser.ts#L11)

___

### IdentityProviderSeed

• `Const` **IdentityProviderSeed**: [*IdentityProvider*](../interfaces/src_interfaces_identityprovider.identityprovider.md)

Defined in: [src/interfaces/IdentityProvider.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/IdentityProvider.ts#L9)

___

### InstanceSeed

• `Const` **InstanceSeed**: [*Instance*](../interfaces/src_interfaces_instance.instance.md)

Defined in: [src/interfaces/Instance.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/Instance.ts#L8)

___

### InviteSeed

• `Const` **InviteSeed**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`id` | *string* |

Defined in: [src/interfaces/Invite.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/Invite.ts#L11)

___

### RelationshipSeed

• `Const` **RelationshipSeed**: [*Relationship*](../interfaces/src_interfaces_relationship.relationship.md)

Defined in: [src/interfaces/Relationship.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/Relationship.ts#L11)

___

### StaticResourceSeed

• `Const` **StaticResourceSeed**: [*StaticResource*](../interfaces/src_interfaces_staticresource.staticresource.md)

Defined in: [src/interfaces/StaticResource.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/StaticResource.ts#L13)

___

### UserSeed

• `Const` **UserSeed**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`id` | *string* |
`identityProviders` | *any*[] |
`name` | *string* |

Defined in: [src/interfaces/User.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/User.ts#L22)

___

### contents

• `Const` **contents**: ({ `data`: { `entities`: { `08BC4CEB-849C-4AD6-88FB-1ED9469CEB2C`: { `components`: ({ `name`: *string* = "transform"; `props`: { `castShadow`: *undefined* = true; `color`: *undefined* = "#aaaaaa"; `innerConeAngle`: *undefined* = 2.615901373506474e-16; `intensity`: *undefined* = 1; `outerConeAngle`: *undefined* = 0.7853981633974483; `position`: { `x`: *number* = 0; `y`: *number* = 0.5; `z`: *number* = -7.5 } ; `range`: *undefined* = 0; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `shadowBias`: *undefined* = 0; `shadowMapResolution`: *undefined* ; `shadowRadius`: *undefined* = 1; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `castShadow`: *undefined* = true; `color`: *undefined* = "#aaaaaa"; `innerConeAngle`: *undefined* = 2.615901373506474e-16; `intensity`: *undefined* = 1; `outerConeAngle`: *undefined* = 0.7853981633974483; `position`: *undefined* ; `range`: *undefined* = 0; `rotation`: *undefined* ; `scale`: *undefined* ; `shadowBias`: *undefined* = 0; `shadowMapResolution`: *undefined* ; `shadowRadius`: *undefined* = 1; `visible`: *boolean* = true }  } \| { `name`: *string* = "spot-light"; `props`: { `castShadow`: *boolean* = true; `color`: *string* = "#ffffff"; `innerConeAngle`: *number* = 2.615901373506474e-16; `intensity`: *number* = 3; `outerConeAngle`: *number* = 0.7853981633974483; `position`: *undefined* ; `range`: *number* = 0; `rotation`: *undefined* ; `scale`: *undefined* ; `shadowBias`: *number* = 0; `shadowMapResolution`: *number*[] ; `shadowRadius`: *number* = 1; `visible`: *undefined* = true }  })[] ; `index`: *number* = 10; `name`: *string* = "spot light"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `1463EAC0-883F-493A-9A33-6757CC8FF48B`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = -0.7051442225464017; `y`: *number* = 4.9414217858007135; `z`: *number* = 11.717705991155913 } ; `rotation`: { `x`: *number* = -0.39907692258027844; `y`: *number* = -0.0553921880824727; `z`: *number* = -0.023343009373261007 } ; `scale`: { `x`: *number* = 0.9999999999999999; `y`: *number* = 0.9999999999999999; `z`: *number* = 1 } ; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true }  } \| { `name`: *string* = "scene-preview-camera"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true }  })[] ; `index`: *number* = 0; `name`: *string* = "scene preview camera"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `1B698483-C15A-4CEC-9247-03873520DF70`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true }  } \| { `name`: *string* = "spawn-point"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true }  })[] ; `index`: *number* = 2; `name`: *string* = "spawn point"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `1B698484-C15A-4CEC-9247-03873520DF70`: { `components`: ({ `name`: *string* = "transform"; `props`: { `groundColor`: *undefined* = "#ffffff"; `intensity`: *undefined* = 1; `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `skyColor`: *undefined* = "#ffffff"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `groundColor`: *undefined* = "#ffffff"; `intensity`: *undefined* = 1; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skyColor`: *undefined* = "#ffffff"; `visible`: *boolean* = true }  } \| { `name`: *string* = "hemisphere-light"; `props`: { `groundColor`: *string* = "#ffffff"; `intensity`: *number* = 1; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skyColor`: *string* = "#ffffff"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 3; `name`: *string* = "hemisphere light"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `1FCEF7E5-5E15-4D0A-ACF8-489920C11703`: { `components`: ({ `name`: *string* = "transform"; `props`: { `castShadow`: *undefined* = true; `color`: *undefined* = "#aaaaaa"; `intensity`: *undefined* = 1; `position`: { `x`: *number* = 0; `y`: *number* = 0.5; `z`: *number* = -1 } ; `range`: *undefined* = 0; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `shadowBias`: *undefined* = 0; `shadowMapResolution`: *undefined* ; `shadowRadius`: *undefined* = 1; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `castShadow`: *undefined* = true; `color`: *undefined* = "#aaaaaa"; `intensity`: *undefined* = 1; `position`: *undefined* ; `range`: *undefined* = 0; `rotation`: *undefined* ; `scale`: *undefined* ; `shadowBias`: *undefined* = 0; `shadowMapResolution`: *undefined* ; `shadowRadius`: *undefined* = 1; `visible`: *boolean* = true }  } \| { `name`: *string* = "point-light"; `props`: { `castShadow`: *boolean* = true; `color`: *string* = "#ffffff"; `intensity`: *number* = 1; `position`: *undefined* ; `range`: *number* = 0; `rotation`: *undefined* ; `scale`: *undefined* ; `shadowBias`: *number* = 0; `shadowMapResolution`: *number*[] ; `shadowRadius`: *number* = 1; `visible`: *undefined* = true }  })[] ; `index`: *number* = 11; `name`: *string* = "point light"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `2111EA78-F53F-47B7-B951-4213FCC12A5A`: { `components`: ({ `name`: *string* = "transform"; `props`: { `mass`: *undefined* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -5.5; `z`: *number* = -5 } ; `quaternion`: *undefined* ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `mass`: *undefined* = 0; `position`: *undefined* ; `quaternion`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true }  } \| { `name`: *string* = "box-collider"; `props`: { `mass`: *number* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -5.5; `z`: *number* = -5 } ; `quaternion`: { `w`: *number* = 1; `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rotation`: *undefined* ; `scale`: { `x`: *number* = 0.5; `y`: *number* = 0.5; `z`: *number* = 0.5 } ; `type`: *string* = "box"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 9; `name`: *string* = "box collider"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC`: { `components`: ({ `name`: *string* = "fog"; `props`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#ffffff"; `density`: *number* = 0.0025; `far`: *number* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *number* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *string* = "disabled" }  } \| { `name`: *string* = "audio-settings"; `props`: { `avatarDistanceModel`: *string* = "inverse"; `avatarMaxDistance`: *number* = 10000; `avatarRefDistance`: *number* = 1; `avatarRolloffFactor`: *number* = 2; `color`: *undefined* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *number* = 360; `mediaConeOuterAngle`: *number* = 0; `mediaConeOuterGain`: *number* = 0; `mediaDistanceModel`: *string* = "inverse"; `mediaMaxDistance`: *number* = 10000; `mediaRefDistance`: *number* = 1; `mediaRolloffFactor`: *number* = 1; `mediaVolume`: *number* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *boolean* = false; `type`: *undefined* = "disabled" }  })[] ; `name`: *string* = "Tests: fall" } ; `4B46FA42-28C2-40CF-AAD2-89B844E24655`: { `components`: ({ `name`: *string* = "transform"; `props`: { `mass`: *undefined* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -1; `z`: *number* = -2 } ; `quaternion`: *undefined* ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `mass`: *undefined* = 0; `position`: *undefined* ; `quaternion`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true }  } \| { `name`: *string* = "box-collider"; `props`: { `mass`: *number* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -1; `z`: *number* = -2 } ; `quaternion`: { `w`: *number* = 1; `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rotation`: *undefined* ; `scale`: { `x`: *number* = 0.5; `y`: *number* = 0.5; `z`: *number* = 0.5 } ; `type`: *string* = "box"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 6; `name`: *string* = "box collider"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `4D8F8B41-0F06-4289-A57B-0EE0F28D0190`: { `components`: ({ `name`: *string* = "transform"; `props`: { `mass`: *undefined* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -0.7; `z`: *number* = -1 } ; `quaternion`: *undefined* ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `mass`: *undefined* = 0; `position`: *undefined* ; `quaternion`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true }  } \| { `name`: *string* = "box-collider"; `props`: { `mass`: *number* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -0.7; `z`: *number* = -1 } ; `quaternion`: { `w`: *number* = 1; `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rotation`: *undefined* ; `scale`: { `x`: *number* = 0.5; `y`: *number* = 0.5; `z`: *number* = 0.5 } ; `type`: *string* = "box"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 5; `name`: *string* = "box collider"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `5280DB1A-588C-4949-933C-FA3A17D70EFF`: { `components`: ({ `name`: *string* = "transform"; `props`: { `mass`: *undefined* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -2.5; `z`: *number* = -4 } ; `quaternion`: *undefined* ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `mass`: *undefined* = 0; `position`: *undefined* ; `quaternion`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true }  } \| { `name`: *string* = "box-collider"; `props`: { `mass`: *number* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -2.5; `z`: *number* = -4 } ; `quaternion`: { `w`: *number* = 1; `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rotation`: *undefined* ; `scale`: { `x`: *number* = 0.5; `y`: *number* = 0.5; `z`: *number* = 0.5 } ; `type`: *string* = "box"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 8; `name`: *string* = "box collider"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `75513CFE-E27A-4F6B-B5CD-9C0FCD604802`: { `components`: ({ `name`: *string* = "transform"; `props`: { `mass`: *undefined* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -1.5; `z`: *number* = -3 } ; `quaternion`: *undefined* ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `mass`: *undefined* = 0; `position`: *undefined* ; `quaternion`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true }  } \| { `name`: *string* = "box-collider"; `props`: { `mass`: *number* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -1.5; `z`: *number* = -3 } ; `quaternion`: { `w`: *number* = 1; `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rotation`: *undefined* ; `scale`: { `x`: *number* = 0.5; `y`: *number* = 0.5; `z`: *number* = 0.5 } ; `type`: *string* = "box"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 7; `name`: *string* = "box collider"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `91EC8D95-C24B-4F9A-9F4C-72200DA3BB3C`: { `components`: ({ `name`: *string* = "transform"; `props`: { `mass`: *undefined* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -0.5; `z`: *number* = 0 } ; `quaternion`: *undefined* ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `mass`: *undefined* = 0; `position`: *undefined* ; `quaternion`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true }  } \| { `name`: *string* = "box-collider"; `props`: { `mass`: *number* = 0; `position`: { `x`: *number* = 0; `y`: *number* = -0.5; `z`: *number* = 0 } ; `quaternion`: { `w`: *number* = 1; `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rotation`: *undefined* ; `scale`: { `x`: *number* = 0.5; `y`: *number* = 0.5; `z`: *number* = 0.5 } ; `type`: *string* = "box"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 4; `name`: *string* = "box collider"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `BEB3665B-5398-46C6-871F-8059DE672270`: { `components`: ({ `name`: *string* = "transform"; `props`: { `attribution`: *undefined* = null; `cast`: *undefined* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 1 } ; `receive`: *undefined* = true; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `attribution`: *undefined* = null; `cast`: *undefined* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *boolean* = true }  } \| { `name`: *string* = "gltf-model"; `props`: { `attribution`: *any* = null; `cast`: *undefined* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *string* = "/models/devices/razer\_laptop.glb"; `visible`: *undefined* = true }  } \| { `name`: *string* = "shadow"; `props`: { `attribution`: *undefined* = null; `cast`: *boolean* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: *undefined* ; `receive`: *boolean* = false; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *undefined* = true }  } \| { `name`: *string* = "interact"; `props`: { `attribution`: *undefined* = null; `cast`: *undefined* = false; `payloadModelUrl`: *string* = "/models/devices/razer\_laptop.glb"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *undefined* = true }  } \| { `name`: *string* = "collidable"; `props`: { `attribution`: *undefined* = null; `cast`: *undefined* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 13; `name`: *string* = "model"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `DE4CA6FA-1923-4A5E-810C-E8859764BD97`: { `components`: ({ `name`: *string* = "transform"; `props`: { `castShadow`: *undefined* = true; `color`: *undefined* = "#aaaaaa"; `intensity`: *undefined* = 1; `position`: { `x`: *number* = 0; `y`: *number* = 0.5; `z`: *number* = -4 } ; `range`: *undefined* = 0; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `shadowBias`: *undefined* = 0; `shadowMapResolution`: *undefined* ; `shadowRadius`: *undefined* = 1; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `castShadow`: *undefined* = true; `color`: *undefined* = "#aaaaaa"; `intensity`: *undefined* = 1; `position`: *undefined* ; `range`: *undefined* = 0; `rotation`: *undefined* ; `scale`: *undefined* ; `shadowBias`: *undefined* = 0; `shadowMapResolution`: *undefined* ; `shadowRadius`: *undefined* = 1; `visible`: *boolean* = true }  } \| { `name`: *string* = "point-light"; `props`: { `castShadow`: *boolean* = true; `color`: *string* = "#50e3c2"; `intensity`: *number* = 1; `position`: *undefined* ; `range`: *number* = 0; `rotation`: *undefined* ; `scale`: *undefined* ; `shadowBias`: *number* = 0; `shadowMapResolution`: *number*[] ; `shadowRadius`: *number* = 1; `visible`: *undefined* = true }  })[] ; `index`: *number* = 12; `name`: *string* = "point light"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `ED0888E7-4032-4DD9-9B43-59B02ECCCB7E`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `skytype`: *undefined* = "cubemap"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skytype`: *undefined* = "cubemap"; `visible`: *boolean* = true }  } \| { `name`: *string* = "skybox"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skytype`: *string* = "cubemap"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 1; `name`: *string* = "skybox"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" }  } ; `metadata`: { `name`: *string* = "Tests: fall" } ; `root`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC"; `version`: *number* = 4 } ; `id`: *string* = '~tests-fall'; `image`: *string* = '/scene-templates/tests-fall.jpg'; `name`: *string*  } \| { `data`: { `entities`: { `2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC`: { `components`: ({ `name`: *string* = "fog"; `props`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#ffffff"; `density`: *number* = 0.0025; `far`: *number* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *number* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *string* = "disabled" }  } \| { `name`: *string* = "audio-settings"; `props`: { `avatarDistanceModel`: *string* = "inverse"; `avatarMaxDistance`: *number* = 10000; `avatarRefDistance`: *number* = 1; `avatarRolloffFactor`: *number* = 2; `color`: *undefined* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *number* = 360; `mediaConeOuterAngle`: *number* = 0; `mediaConeOuterGain`: *number* = 0; `mediaDistanceModel`: *string* = "inverse"; `mediaMaxDistance`: *number* = 10000; `mediaRefDistance`: *number* = 1; `mediaRolloffFactor`: *number* = 1; `mediaVolume`: *number* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *boolean* = false; `type`: *undefined* = "disabled" }  })[] ; `name`: *string* = "Sky Island" } ; `2D490729-384D-49AF-A755-9D6F70D56325`: { `components`: ({ `name`: *string* = "transform"; `props`: { `agentHeight`: *undefined* = 1.7; `agentMaxClimb`: *undefined* = 0.5; `agentMaxSlope`: *undefined* = 60; `agentRadius`: *undefined* = 0.19999999999999996; `autoCellSize`: *undefined* = false; `cellHeight`: *undefined* = 0.1; `cellSize`: *undefined* = 0.1200000000000001; `forceTrimesh`: *undefined* = false; `maxTriangles`: *undefined* = 1000; `position`: { `x`: *number* = 0; `y`: *number* = 0.005; `z`: *number* = 0 } ; `regionMinSize`: *undefined* = 4; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `agentHeight`: *undefined* = 1.7; `agentMaxClimb`: *undefined* = 0.5; `agentMaxSlope`: *undefined* = 60; `agentRadius`: *undefined* = 0.19999999999999996; `autoCellSize`: *undefined* = false; `cellHeight`: *undefined* = 0.1; `cellSize`: *undefined* = 0.1200000000000001; `forceTrimesh`: *undefined* = false; `maxTriangles`: *undefined* = 1000; `position`: *undefined* ; `regionMinSize`: *undefined* = 4; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true }  } \| { `name`: *string* = "floor-plan"; `props`: { `agentHeight`: *number* = 1.7; `agentMaxClimb`: *number* = 0.5; `agentMaxSlope`: *number* = 60; `agentRadius`: *number* = 0.19999999999999996; `autoCellSize`: *boolean* = false; `cellHeight`: *number* = 0.1; `cellSize`: *number* = 0.1200000000000001; `forceTrimesh`: *boolean* = false; `maxTriangles`: *number* = 1000; `position`: *undefined* ; `regionMinSize`: *number* = 4; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true }  })[] ; `index`: *number* = 3; `name`: *string* = "Floor Plan"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `633CD01A-BC2A-4584-99E2-2A3CFE2C8AD9`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 2; `y`: *number* = 1; `z`: *number* = 2 } ; `rotation`: { `x`: *number* = 3.141592653589793; `y`: *number* = -0.7853981633974483; `z`: *number* = 3.141592653589793 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true }  } \| { `name`: *string* = "spawn-point"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true }  })[] ; `index`: *number* = 2; `name`: *string* = "Spawn Point"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `650D5EAD-CBD8-4FF7-848E-5E38FAA92032`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 3.733561750376751; `y`: *number* = 3.7205431030942573; `z`: *number* = 15.996306794993012 } ; `rotation`: { `x`: *number* = -0.32028700541006; `y`: *number* = 0.31285746006738946; `z`: *number* = 0.10174012676762262 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true }  } \| { `name`: *string* = "scene-preview-camera"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true }  })[] ; `index`: *number* = 10; `name`: *string* = "Scene Preview Camera"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `80219F1E-D624-4A76-A82E-DB5CEC44495C`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = -3; `y`: *number* = 0; `z`: *number* = -6.5 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true }  } \| { `name`: *string* = "spawn-point"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true }  })[] ; `index`: *number* = 8; `name`: *string* = "Spawn Point"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `933BE58D-553E-4129-80D9-3E242212911C`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = -5.5; `y`: *number* = 0.5; `z`: *number* = 9.5 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true }  } \| { `name`: *string* = "spawn-point"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true }  })[] ; `index`: *number* = 7; `name`: *string* = "Spawn Point"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `93ADB8DD-BF93-4E79-A56A-76D76B208598`: { `components`: ({ `name`: *string* = "transform"; `props`: { `attribution`: *undefined* = null; `cast`: *undefined* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: { `x`: *number* = 0; `y`: *number* = -2; `z`: *number* = -10 } ; `receive`: *undefined* = true; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 50; `y`: *number* = 50; `z`: *number* = 50 } ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `attribution`: *undefined* = null; `cast`: *undefined* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *boolean* = true }  } \| { `name`: *string* = "gltf-model"; `props`: { `attribution`: *any* = null; `cast`: *undefined* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *string* = "/models/worlds/island\_zero\_dark\_green.glb"; `visible`: *undefined* = true }  } \| { `name`: *string* = "shadow"; `props`: { `attribution`: *undefined* = null; `cast`: *boolean* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: *undefined* ; `receive`: *boolean* = false; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *undefined* = true }  } \| { `name`: *string* = "interact"; `props`: { `attribution`: *undefined* = null; `cast`: *undefined* = false; `payloadModelUrl`: *string* = "/models/worlds/island\_zero\_dark\_green.glb"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *undefined* = true }  } \| { `name`: *string* = "collidable"; `props`: { `attribution`: *undefined* = null; `cast`: *undefined* = false; `payloadModelUrl`: *undefined* = "/models/devices/razer\_laptop.glb"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `src`: *undefined* = "/models/devices/razer\_laptop.glb"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 4; `name`: *string* = "Model"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `AB8EEA40-878D-4F40-8207-FAA127DC4EF5`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = -7.5; `y`: *number* = 0.5; `z`: *number* = -2 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true }  } \| { `name`: *string* = "spawn-point"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true }  })[] ; `index`: *number* = 5; `name`: *string* = "Spawn Point"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `B594C562-6475-4BB4-A7F7-1E225503733C`: { `components`: ({ `name`: *string* = "transform"; `props`: { `groundColor`: *undefined* = "#ffffff"; `intensity`: *undefined* = 1; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `skyColor`: *undefined* = "#ffffff"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `groundColor`: *undefined* = "#ffffff"; `intensity`: *undefined* = 1; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skyColor`: *undefined* = "#ffffff"; `visible`: *boolean* = true }  } \| { `name`: *string* = "hemisphere-light"; `props`: { `groundColor`: *string* = "#b8e986"; `intensity`: *number* = 1; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skyColor`: *string* = "#80bfff"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 9; `name`: *string* = "Hemisphere Light"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `D8061EA5-F0C4-4452-ADFE-B179E2F20CB1`: { `components`: ({ `name`: *string* = "transform"; `props`: { `castShadow`: *undefined* = true; `color`: *undefined* = "#aaaaaa"; `intensity`: *undefined* = 1; `position`: { `x`: *number* = -1; `y`: *number* = 3; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0.7961957827343339; `y`: *number* = 0.4384732862275714; `z`: *number* = -0.3532960928312079 } ; `scale`: { `x`: *number* = 0.9999999999999996; `y`: *number* = 0.9999999999999997; `z`: *number* = 0.9999999999999997 } ; `shadowBias`: *undefined* = 0; `shadowMapResolution`: *undefined* ; `shadowRadius`: *undefined* = 1; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `castShadow`: *undefined* = true; `color`: *undefined* = "#aaaaaa"; `intensity`: *undefined* = 1; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `shadowBias`: *undefined* = 0; `shadowMapResolution`: *undefined* ; `shadowRadius`: *undefined* = 1; `visible`: *boolean* = true }  } \| { `name`: *string* = "directional-light"; `props`: { `castShadow`: *boolean* = true; `color`: *string* = "#ffffff"; `intensity`: *number* = 3; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `shadowBias`: *number* = -0.000030000000000000004; `shadowMapResolution`: *number*[] ; `shadowRadius`: *number* = 1; `visible`: *undefined* = true }  })[] ; `index`: *number* = 1; `name`: *string* = "Directional Light"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `E545101D-5D46-4944-9169-B1F0F69CC0CF`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 5; `y`: *number* = 0.5; `z`: *number* = -2 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true }  } \| { `name`: *string* = "spawn-point"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true }  })[] ; `index`: *number* = 6; `name`: *string* = "Spawn Point"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" } ; `E8D3129B-68BF-473F-92B9-6DAEC83514BB`: { `components`: ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `skytype`: *undefined* = "cubemap"; `texture`: *undefined* = "/hdr/cubemap/skyboxsun25deg/"; `visible`: *undefined* = true }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skytype`: *undefined* = "cubemap"; `texture`: *undefined* = "/hdr/cubemap/skyboxsun25deg/"; `visible`: *boolean* = true }  } \| { `name`: *string* = "skybox"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skytype`: *string* = "cubemap"; `texture`: *string* = "/hdr/cubemap/skyboxsun25deg/"; `visible`: *undefined* = true }  })[] ; `index`: *number* = 0; `name`: *string* = "Skybox"; `parent`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC" }  } ; `metadata`: { `name`: *string* = "Sky Island" } ; `root`: *string* = "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC"; `version`: *number* = 4 } ; `id`: *string* = '~sky-island'; `image`: *string* = '/scene-templates/sky-island.jpg'; `name`: *string*  })[]

Defined in: [src/scenes-templates/index.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/scenes-templates/index.ts#L4)

___

### indexes

• `Const` **indexes**: { `allow_remixing`: *boolean* = true; `attributions`: { `content`: { `author`: *string* = ""; `name`: *string*  }[] ; `creator`: *string* = "xr3ngine" } ; `description`: *any* = null; `id`: *string* ; `images`: { `preview`: { `url`: *string*  }  } ; `name`: *string* ; `project_id`: *any* = null; `type`: *string* = "scene\_listing" }[]

Defined in: [src/scenes-templates/index.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/scenes-templates/index.ts#L19)

___

### testScenePreset

• `Const` **testScenePreset**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`createdAt` | *string* |
`description` | *any* |
`entities` | *object* |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B` | *object* |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.collectionId` | *string* |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: { `x`: *number* = 0; `y`: *number* = 5; `z`: *number* = 10 } ; `rotation`: { `x`: *number* = -0.4636; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true } ; `entityId`: *string* = "08c8a843-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03ab-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 0; `y`: *number* = 5; `z`: *number* = 10 } ; `rotation`: { `x`: *number* = -0.4636; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true } ; `entityId`: *string* = "08c8a843-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03ac-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true } ; `type`: *string* = "visible"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true } ; `entityId`: *string* = "08c8a843-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03ad-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "scene-preview-camera"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true } ; `type`: *string* = "scene-preview-camera"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.createdAt` | *string* |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.entityId` | *string* |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.id` | *string* |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.index` | *number* |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.name` | *string* |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.parent` | *string* |
`entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.updatedAt` | *string* |
`entities.1B698482-C15A-4CEC-9247-03873520DF70` | *object* |
`entities.1B698482-C15A-4CEC-9247-03873520DF70.collectionId` | *string* |
`entities.1B698482-C15A-4CEC-9247-03873520DF70.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *string* = "ground"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03b0-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "box-collider"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *string* = "ground"; `visible`: *undefined* = true } ; `type`: *string* = "box-collider"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `receive`: *undefined* = true; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03b7-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `receive`: *undefined* = true; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03b8-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "visible"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true } ; `type`: *string* = "visible"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *string* = "#5de336"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03b9-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "ground-plane"; `props`: { `color`: *string* = "#5de336"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `type`: *string* = "ground-plane"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *boolean* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03c1-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "shadow"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *boolean* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `type`: *string* = "shadow"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03c2-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "walkable"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `type`: *string* = "walkable"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`entities.1B698482-C15A-4CEC-9247-03873520DF70.createdAt` | *string* |
`entities.1B698482-C15A-4CEC-9247-03873520DF70.entityId` | *string* |
`entities.1B698482-C15A-4CEC-9247-03873520DF70.id` | *string* |
`entities.1B698482-C15A-4CEC-9247-03873520DF70.index` | *number* |
`entities.1B698482-C15A-4CEC-9247-03873520DF70.name` | *string* |
`entities.1B698482-C15A-4CEC-9247-03873520DF70.parent` | *string* |
`entities.1B698482-C15A-4CEC-9247-03873520DF70.updatedAt` | *string* |
`entities.1B698483-C15A-4CEC-9247-03873520DF70` | *object* |
`entities.1B698483-C15A-4CEC-9247-03873520DF70.collectionId` | *string* |
`entities.1B698483-C15A-4CEC-9247-03873520DF70.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 }  } ; `entityId`: *string* = "1B698483-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03c3-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 }  } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined*  } ; `entityId`: *string* = "1B698483-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03c4-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "spawn-point"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined*  } ; `type`: *string* = "spawn-point"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`entities.1B698483-C15A-4CEC-9247-03873520DF70.createdAt` | *string* |
`entities.1B698483-C15A-4CEC-9247-03873520DF70.entityId` | *string* |
`entities.1B698483-C15A-4CEC-9247-03873520DF70.id` | *string* |
`entities.1B698483-C15A-4CEC-9247-03873520DF70.index` | *number* |
`entities.1B698483-C15A-4CEC-9247-03873520DF70.name` | *string* |
`entities.1B698483-C15A-4CEC-9247-03873520DF70.parent` | *string* |
`entities.1B698483-C15A-4CEC-9247-03873520DF70.updatedAt` | *string* |
`entities.1B698484-C15A-4CEC-9247-03873520DF70` | *object* |
`entities.1B698484-C15A-4CEC-9247-03873520DF70.collectionId` | *string* |
`entities.1B698484-C15A-4CEC-9247-03873520DF70.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `groundColor`: *undefined* = "#ffffff"; `intensity`: *undefined* = 1; `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `skyColor`: *undefined* = "#ffffff" } ; `entityId`: *string* = "1B698484-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "09cc03c3-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `groundColor`: *undefined* = "#ffffff"; `intensity`: *undefined* = 1; `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `skyColor`: *undefined* = "#ffffff" } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `groundColor`: *string* = "#ffffff"; `intensity`: *number* = 1; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skyColor`: *string* = "#ffffff" } ; `entityId`: *string* = "1B698484-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "09cc03c4-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "hemisphere-light"; `props`: { `groundColor`: *string* = "#ffffff"; `intensity`: *number* = 1; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skyColor`: *string* = "#ffffff" } ; `type`: *string* = "hemisphere-light"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`entities.1B698484-C15A-4CEC-9247-03873520DF70.createdAt` | *string* |
`entities.1B698484-C15A-4CEC-9247-03873520DF70.entityId` | *string* |
`entities.1B698484-C15A-4CEC-9247-03873520DF70.id` | *string* |
`entities.1B698484-C15A-4CEC-9247-03873520DF70.index` | *number* |
`entities.1B698484-C15A-4CEC-9247-03873520DF70.name` | *string* |
`entities.1B698484-C15A-4CEC-9247-03873520DF70.parent` | *string* |
`entities.1B698484-C15A-4CEC-9247-03873520DF70.updatedAt` | *string* |
`entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC` | *object* |
`entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.collectionId` | *string* |
`entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#ffffff"; `density`: *number* = 0.0025; `far`: *number* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *number* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *string* = "disabled" } ; `entityId`: *string* = "08c8a840-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03a0-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "fog"; `props`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#ffffff"; `density`: *number* = 0.0025; `far`: *number* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *number* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *string* = "disabled" } ; `type`: *string* = "fog"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *undefined* = "disabled" } ; `entityId`: *string* = "08c8a840-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03a1-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "background"; `props`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *undefined* = "disabled" } ; `type`: *string* = "background"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `avatarDistanceModel`: *string* = "inverse"; `avatarMaxDistance`: *number* = 10000; `avatarRefDistance`: *number* = 1; `avatarRolloffFactor`: *number* = 2; `color`: *undefined* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *number* = 360; `mediaConeOuterAngle`: *number* = 0; `mediaConeOuterGain`: *number* = 0; `mediaDistanceModel`: *string* = "inverse"; `mediaMaxDistance`: *number* = 10000; `mediaRefDistance`: *number* = 1; `mediaRolloffFactor`: *number* = 1; `mediaVolume`: *number* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *boolean* = false; `type`: *undefined* = "disabled" } ; `entityId`: *string* = "08c8a840-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03a2-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "audio-settings"; `props`: { `avatarDistanceModel`: *string* = "inverse"; `avatarMaxDistance`: *number* = 10000; `avatarRefDistance`: *number* = 1; `avatarRolloffFactor`: *number* = 2; `color`: *undefined* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *number* = 360; `mediaConeOuterAngle`: *number* = 0; `mediaConeOuterGain`: *number* = 0; `mediaDistanceModel`: *string* = "inverse"; `mediaMaxDistance`: *number* = 10000; `mediaRefDistance`: *number* = 1; `mediaRolloffFactor`: *number* = 1; `mediaVolume`: *number* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *boolean* = false; `type`: *undefined* = "disabled" } ; `type`: *string* = "audio-settings"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.createdAt` | *string* |
`entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.entityId` | *string* |
`entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.id` | *string* |
`entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.name` | *string* |
`entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.updatedAt` | *string* |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E` | *object* |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.collectionId` | *string* |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `azimuth`: *undefined* = 0.2333333333333333; `distance`: *undefined* = 8000; `inclination`: *undefined* = 0.10471975511965978; `luminance`: *undefined* = 1.055; `mieCoefficient`: *undefined* = 0.043; `mieDirectionalG`: *undefined* = 0.8; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rayleigh`: *undefined* = 0.82; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `turbidity`: *undefined* = 6.09; `visible`: *undefined* = true } ; `entityId`: *string* = "08c8a846-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03b4-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `azimuth`: *undefined* = 0.2333333333333333; `distance`: *undefined* = 8000; `inclination`: *undefined* = 0.10471975511965978; `luminance`: *undefined* = 1.055; `mieCoefficient`: *undefined* = 0.043; `mieDirectionalG`: *undefined* = 0.8; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rayleigh`: *undefined* = 0.82; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `turbidity`: *undefined* = 6.09; `visible`: *undefined* = true } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `azimuth`: *undefined* = 0.2333333333333333; `distance`: *undefined* = 8000; `inclination`: *undefined* = 0.10471975511965978; `luminance`: *undefined* = 1.055; `mieCoefficient`: *undefined* = 0.043; `mieDirectionalG`: *undefined* = 0.8; `position`: *undefined* ; `rayleigh`: *undefined* = 0.82; `rotation`: *undefined* ; `scale`: *undefined* ; `turbidity`: *undefined* = 6.09; `visible`: *boolean* = true } ; `entityId`: *string* = "08c8a846-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03b5-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "visible"; `props`: { `azimuth`: *undefined* = 0.2333333333333333; `distance`: *undefined* = 8000; `inclination`: *undefined* = 0.10471975511965978; `luminance`: *undefined* = 1.055; `mieCoefficient`: *undefined* = 0.043; `mieDirectionalG`: *undefined* = 0.8; `position`: *undefined* ; `rayleigh`: *undefined* = 0.82; `rotation`: *undefined* ; `scale`: *undefined* ; `turbidity`: *undefined* = 6.09; `visible`: *boolean* = true } ; `type`: *string* = "visible"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `azimuth`: *number* = 0.2333333333333333; `distance`: *number* = 8000; `inclination`: *number* = 0.10471975511965978; `luminance`: *number* = 1.055; `mieCoefficient`: *number* = 0.043; `mieDirectionalG`: *number* = 0.8; `position`: *undefined* ; `rayleigh`: *number* = 0.82; `rotation`: *undefined* ; `scale`: *undefined* ; `turbidity`: *number* = 6.09; `visible`: *undefined* = true } ; `entityId`: *string* = "08c8a846-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03b6-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "skybox"; `props`: { `azimuth`: *number* = 0.2333333333333333; `distance`: *number* = 8000; `inclination`: *number* = 0.10471975511965978; `luminance`: *number* = 1.055; `mieCoefficient`: *number* = 0.043; `mieDirectionalG`: *number* = 0.8; `position`: *undefined* ; `rayleigh`: *number* = 0.82; `rotation`: *undefined* ; `scale`: *undefined* ; `turbidity`: *number* = 6.09; `visible`: *undefined* = true } ; `type`: *string* = "skybox"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.createdAt` | *string* |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.entityId` | *string* |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.id` | *string* |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.index` | *number* |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.name` | *string* |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.parent` | *string* |
`entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.updatedAt` | *string* |
`id` | *string* |
`isPublic` | *boolean* |
`locationId` | *any* |
`metadata` | *string* |
`name` | *string* |
`root` | *string* |
`sid` | *string* |
`thumbnailOwnedFileId` | *string* |
`type` | *string* |
`updatedAt` | *string* |
`url` | *string* |
`userId` | *any* |
`version` | *number* |

Defined in: [src/assets/testScenePreset.ts:1](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/assets/testScenePreset.ts#L1)

___

### testScenes

• `Const` **testScenes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`test` | *object* |
`test.createdAt` | *string* |
`test.description` | *any* |
`test.entities` | *object* |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B` | *object* |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.collectionId` | *string* |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: { `x`: *number* = 0; `y`: *number* = 5; `z`: *number* = 10 } ; `rotation`: { `x`: *number* = -0.4636; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true } ; `entityId`: *string* = "08c8a843-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03ab-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 0; `y`: *number* = 5; `z`: *number* = 10 } ; `rotation`: { `x`: *number* = -0.4636; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `visible`: *undefined* = true } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true } ; `entityId`: *string* = "08c8a843-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03ac-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *boolean* = true } ; `type`: *string* = "visible"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true } ; `entityId`: *string* = "08c8a843-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03ad-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "scene-preview-camera"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *undefined* = true } ; `type`: *string* = "scene-preview-camera"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.createdAt` | *string* |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.entityId` | *string* |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.id` | *string* |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.index` | *number* |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.name` | *string* |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.parent` | *string* |
`test.entities.1463EAC0-883F-493A-9A33-6757CC8FF48B.updatedAt` | *string* |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70` | *object* |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70.collectionId` | *string* |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *string* = "ground"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03b0-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "box-collider"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *string* = "ground"; `visible`: *undefined* = true } ; `type`: *string* = "box-collider"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `receive`: *undefined* = true; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03b7-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `receive`: *undefined* = true; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03b8-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "visible"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *boolean* = true } ; `type`: *string* = "visible"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *string* = "#5de336"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03b9-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "ground-plane"; `props`: { `color`: *string* = "#5de336"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `type`: *string* = "ground-plane"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *boolean* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03c1-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "shadow"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *boolean* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `type`: *string* = "shadow"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `entityId`: *string* = "1B698482-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03c2-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "walkable"; `props`: { `color`: *undefined* = "#aaaaaa"; `position`: *undefined* ; `receive`: *undefined* = true; `rotation`: *undefined* ; `scale`: *undefined* ; `type`: *undefined* = "disabled"; `visible`: *undefined* = true } ; `type`: *string* = "walkable"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70.createdAt` | *string* |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70.entityId` | *string* |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70.id` | *string* |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70.index` | *number* |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70.name` | *string* |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70.parent` | *string* |
`test.entities.1B698482-C15A-4CEC-9247-03873520DF70.updatedAt` | *string* |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70` | *object* |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70.collectionId` | *string* |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 }  } ; `entityId`: *string* = "1B698483-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03c3-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 }  } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined*  } ; `entityId`: *string* = "1B698483-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "08cc03c4-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "spawn-point"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined*  } ; `type`: *string* = "spawn-point"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70.createdAt` | *string* |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70.entityId` | *string* |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70.id` | *string* |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70.index` | *number* |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70.name` | *string* |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70.parent` | *string* |
`test.entities.1B698483-C15A-4CEC-9247-03873520DF70.updatedAt` | *string* |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70` | *object* |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70.collectionId` | *string* |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `groundColor`: *undefined* = "#ffffff"; `intensity`: *undefined* = 1; `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `skyColor`: *undefined* = "#ffffff" } ; `entityId`: *string* = "1B698484-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "09cc03c3-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `groundColor`: *undefined* = "#ffffff"; `intensity`: *undefined* = 1; `position`: { `x`: *number* = 0; `y`: *number* = 10; `z`: *number* = 0 } ; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `skyColor`: *undefined* = "#ffffff" } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `groundColor`: *string* = "#ffffff"; `intensity`: *number* = 1; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skyColor`: *string* = "#ffffff" } ; `entityId`: *string* = "1B698484-C15A-4CEC-9247-03873520DF70"; `id`: *string* = "09cc03c4-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "hemisphere-light"; `props`: { `groundColor`: *string* = "#ffffff"; `intensity`: *number* = 1; `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `skyColor`: *string* = "#ffffff" } ; `type`: *string* = "hemisphere-light"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70.createdAt` | *string* |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70.entityId` | *string* |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70.id` | *string* |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70.index` | *number* |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70.name` | *string* |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70.parent` | *string* |
`test.entities.1B698484-C15A-4CEC-9247-03873520DF70.updatedAt` | *string* |
`test.entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC` | *object* |
`test.entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.collectionId` | *string* |
`test.entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#ffffff"; `density`: *number* = 0.0025; `far`: *number* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *number* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *string* = "disabled" } ; `entityId`: *string* = "08c8a840-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03a0-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "fog"; `props`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#ffffff"; `density`: *number* = 0.0025; `far`: *number* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *number* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *string* = "disabled" } ; `type`: *string* = "fog"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *undefined* = "disabled" } ; `entityId`: *string* = "08c8a840-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03a1-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "background"; `props`: { `avatarDistanceModel`: *undefined* = "inverse"; `avatarMaxDistance`: *undefined* = 10000; `avatarRefDistance`: *undefined* = 1; `avatarRolloffFactor`: *undefined* = 2; `color`: *string* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *undefined* = 360; `mediaConeOuterAngle`: *undefined* = 0; `mediaConeOuterGain`: *undefined* = 0; `mediaDistanceModel`: *undefined* = "inverse"; `mediaMaxDistance`: *undefined* = 10000; `mediaRefDistance`: *undefined* = 1; `mediaRolloffFactor`: *undefined* = 1; `mediaVolume`: *undefined* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *undefined* = false; `type`: *undefined* = "disabled" } ; `type`: *string* = "background"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `avatarDistanceModel`: *string* = "inverse"; `avatarMaxDistance`: *number* = 10000; `avatarRefDistance`: *number* = 1; `avatarRolloffFactor`: *number* = 2; `color`: *undefined* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *number* = 360; `mediaConeOuterAngle`: *number* = 0; `mediaConeOuterGain`: *number* = 0; `mediaDistanceModel`: *string* = "inverse"; `mediaMaxDistance`: *number* = 10000; `mediaRefDistance`: *number* = 1; `mediaRolloffFactor`: *number* = 1; `mediaVolume`: *number* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *boolean* = false; `type`: *undefined* = "disabled" } ; `entityId`: *string* = "08c8a840-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03a2-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "audio-settings"; `props`: { `avatarDistanceModel`: *string* = "inverse"; `avatarMaxDistance`: *number* = 10000; `avatarRefDistance`: *number* = 1; `avatarRolloffFactor`: *number* = 2; `color`: *undefined* = "#aaaaaa"; `density`: *undefined* = 0.0025; `far`: *undefined* = 1000; `mediaConeInnerAngle`: *number* = 360; `mediaConeOuterAngle`: *number* = 0; `mediaConeOuterGain`: *number* = 0; `mediaDistanceModel`: *string* = "inverse"; `mediaMaxDistance`: *number* = 10000; `mediaRefDistance`: *number* = 1; `mediaRolloffFactor`: *number* = 1; `mediaVolume`: *number* = 0.5; `near`: *undefined* = 0.0025; `overrideAudioSettings`: *boolean* = false; `type`: *undefined* = "disabled" } ; `type`: *string* = "audio-settings"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`test.entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.createdAt` | *string* |
`test.entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.entityId` | *string* |
`test.entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.id` | *string* |
`test.entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.name` | *string* |
`test.entities.2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC.updatedAt` | *string* |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E` | *object* |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.collectionId` | *string* |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.components` | ({ `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `azimuth`: *undefined* = 0.2333333333333333; `distance`: *undefined* = 8000; `inclination`: *undefined* = 0.10471975511965978; `luminance`: *undefined* = 1.055; `mieCoefficient`: *undefined* = 0.043; `mieDirectionalG`: *undefined* = 0.8; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rayleigh`: *undefined* = 0.82; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `turbidity`: *undefined* = 6.09; `visible`: *undefined* = true } ; `entityId`: *string* = "08c8a846-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03b4-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "transform"; `props`: { `azimuth`: *undefined* = 0.2333333333333333; `distance`: *undefined* = 8000; `inclination`: *undefined* = 0.10471975511965978; `luminance`: *undefined* = 1.055; `mieCoefficient`: *undefined* = 0.043; `mieDirectionalG`: *undefined* = 0.8; `position`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `rayleigh`: *undefined* = 0.82; `rotation`: { `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 } ; `scale`: { `x`: *number* = 1; `y`: *number* = 1; `z`: *number* = 1 } ; `turbidity`: *undefined* = 6.09; `visible`: *undefined* = true } ; `type`: *string* = "transform"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `azimuth`: *undefined* = 0.2333333333333333; `distance`: *undefined* = 8000; `inclination`: *undefined* = 0.10471975511965978; `luminance`: *undefined* = 1.055; `mieCoefficient`: *undefined* = 0.043; `mieDirectionalG`: *undefined* = 0.8; `position`: *undefined* ; `rayleigh`: *undefined* = 0.82; `rotation`: *undefined* ; `scale`: *undefined* ; `turbidity`: *undefined* = 6.09; `visible`: *boolean* = true } ; `entityId`: *string* = "08c8a846-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03b5-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "visible"; `props`: { `azimuth`: *undefined* = 0.2333333333333333; `distance`: *undefined* = 8000; `inclination`: *undefined* = 0.10471975511965978; `luminance`: *undefined* = 1.055; `mieCoefficient`: *undefined* = 0.043; `mieDirectionalG`: *undefined* = 0.8; `position`: *undefined* ; `rayleigh`: *undefined* = 0.82; `rotation`: *undefined* ; `scale`: *undefined* ; `turbidity`: *undefined* = 6.09; `visible`: *boolean* = true } ; `type`: *string* = "visible"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" } \| { `createdAt`: *string* = "2020-11-12T02:14:45.000Z"; `data`: { `azimuth`: *number* = 0.2333333333333333; `distance`: *number* = 8000; `inclination`: *number* = 0.10471975511965978; `luminance`: *number* = 1.055; `mieCoefficient`: *number* = 0.043; `mieDirectionalG`: *number* = 0.8; `position`: *undefined* ; `rayleigh`: *number* = 0.82; `rotation`: *undefined* ; `scale`: *undefined* ; `turbidity`: *number* = 6.09; `visible`: *undefined* = true } ; `entityId`: *string* = "08c8a846-24e9-11eb-bc2e-e7e742fb069f"; `id`: *string* = "08cc03b6-24e9-11eb-bc2e-e7e742fb069f"; `name`: *string* = "skybox"; `props`: { `azimuth`: *number* = 0.2333333333333333; `distance`: *number* = 8000; `inclination`: *number* = 0.10471975511965978; `luminance`: *number* = 1.055; `mieCoefficient`: *number* = 0.043; `mieDirectionalG`: *number* = 0.8; `position`: *undefined* ; `rayleigh`: *number* = 0.82; `rotation`: *undefined* ; `scale`: *undefined* ; `turbidity`: *number* = 6.09; `visible`: *undefined* = true } ; `type`: *string* = "skybox"; `updatedAt`: *string* = "2021-04-02T00:35:15.000Z" })[] |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.createdAt` | *string* |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.entityId` | *string* |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.id` | *string* |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.index` | *number* |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.name` | *string* |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.parent` | *string* |
`test.entities.ED0888E7-4032-4DD9-9B43-59B02ECCCB7E.updatedAt` | *string* |
`test.id` | *string* |
`test.isPublic` | *boolean* |
`test.locationId` | *any* |
`test.metadata` | *string* |
`test.name` | *string* |
`test.root` | *string* |
`test.sid` | *string* |
`test.thumbnailOwnedFileId` | *string* |
`test.type` | *string* |
`test.updatedAt` | *string* |
`test.url` | *string* |
`test.userId` | *any* |
`test.version` | *number* |

Defined in: [src/assets/testScenes.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/assets/testScenes.ts#L7)

___

### testUserId

• `Const` **testUserId**: *any*

Defined in: [src/assets/testScenes.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/assets/testScenes.ts#L5)

___

### testWorldState

• `Const` **testWorldState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`clientsConnected` | { `avatarDetail`: { `avatarId`: *string* = "Allison"; `avatarURL`: *string* = "https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Allison.glb"; `thumbnailURL`: *string* = "https://s3.amazonaws.com/xr3ngine-static-resources/avatars/Allison.png" } ; `name`: *any* ; `userId`: *any*  }[] |
`clientsDisconnected` | *any*[] |
`createObjects` | { `networkId`: *number* = 1; `ownerId`: *any* ; `prefabType`: *number* = 0; `qW`: *number* = 1; `qX`: *number* = 0; `qY`: *number* = 0; `qZ`: *number* = 0; `uniqueId`: *string* = "character"; `x`: *number* = 0; `y`: *number* = 0; `z`: *number* = 0 }[] |
`destroyObjects` | *any*[] |
`editObjects` | *any*[] |
`ikTransforms` | *any*[] |
`inputs` | *any*[] |
`tick` | *number* |
`time` | *number* |
`transforms` | *any*[] |

Defined in: [src/assets/testScenes.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/assets/testScenes.ts#L11)

## Functions

### resolveAuthUser

▸ **resolveAuthUser**(`res`: *any*): [*AuthUser*](../interfaces/src_interfaces_authuser.authuser.md)

#### Parameters:

Name | Type |
:------ | :------ |
`res` | *any* |

**Returns:** [*AuthUser*](../interfaces/src_interfaces_authuser.authuser.md)

Defined in: [src/interfaces/AuthUser.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/AuthUser.ts#L19)

___

### resolveUser

▸ **resolveUser**(`user`: *any*): [*User*](../interfaces/src_interfaces_user.user.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | *any* |

**Returns:** [*User*](../interfaces/src_interfaces_user.user.md)

Defined in: [src/interfaces/User.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/User.ts#L28)
