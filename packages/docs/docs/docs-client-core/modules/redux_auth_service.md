---
id: "redux_auth_service"
title: "Module: redux/auth/service"
sidebar_label: "redux/auth/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/auth/service

## Functions

### addConnectionByEmail

▸ **addConnectionByEmail**(`email`: *string*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *string* |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:430](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L430)

___

### addConnectionByOauth

▸ **addConnectionByOauth**(`oauth`: *facebook* \| *google* \| *github* \| *linkedin* \| *twitter*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`oauth` | *facebook* \| *google* \| *github* \| *linkedin* \| *twitter* |
`userId` | *string* |

**Returns:** () => *void*

Defined in: [packages/client-core/redux/auth/service.ts:477](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L477)

___

### addConnectionByPassword

▸ **addConnectionByPassword**(`form`: [*EmailLoginForm*](../interfaces/redux_auth_actions.emailloginform.md), `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`form` | [*EmailLoginForm*](../interfaces/redux_auth_actions.emailloginform.md) |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:408](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L408)

___

### addConnectionBySms

▸ **addConnectionBySms**(`phone`: *string*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`phone` | *string* |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:451](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L451)

___

### createMagicLink

▸ **createMagicLink**(`emailPhone`: *string*, `linkType?`: *email* \| *sms*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`emailPhone` | *string* |
`linkType?` | *email* \| *sms* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:350](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L350)

___

### doLoginAuto

▸ **doLoginAuto**(`allowGuest?`: *boolean*, `forceClientAuthReset?`: *boolean*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`allowGuest?` | *boolean* |
`forceClientAuthReset?` | *boolean* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/auth/service.ts:54](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L54)

___

### fetchAvatarList

▸ **fetchAvatarList**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:609](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L609)

___

### forgotPassword

▸ **forgotPassword**(`email`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:311](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L311)

___

### loadUserData

▸ **loadUserData**(`dispatch`: Dispatch, `userId`: *string*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`dispatch` | Dispatch |
`userId` | *string* |

**Returns:** *any*

Defined in: [packages/client-core/redux/auth/service.ts:121](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L121)

___

### loginUserByJwt

▸ **loginUserByJwt**(`accessToken`: *string*, `redirectSuccess`: *string*, `redirectError`: *string*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`accessToken` | *string* |
`redirectSuccess` | *string* |
`redirectError` | *string* |

**Returns:** *any*

Defined in: [packages/client-core/redux/auth/service.ts:210](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L210)

___

### loginUserByOAuth

▸ **loginUserByOAuth**(`service`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`service` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:194](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L194)

___

### loginUserByPassword

▸ **loginUserByPassword**(`form`: [*EmailLoginForm*](../interfaces/redux_auth_actions.emailloginform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`form` | [*EmailLoginForm*](../interfaces/redux_auth_actions.emailloginform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:153](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L153)

___

### logoutUser

▸ **logoutUser**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:236](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L236)

___

### refreshConnections

▸ **refreshConnections**(`userId`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |

**Returns:** *void*

Defined in: [packages/client-core/redux/auth/service.ts:499](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L499)

___

### registerUserByEmail

▸ **registerUserByEmail**(`form`: [*EmailRegistrationForm*](../interfaces/redux_auth_actions.emailregistrationform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`form` | [*EmailRegistrationForm*](../interfaces/redux_auth_actions.emailregistrationform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:249](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L249)

___

### removeAvatar

▸ **removeAvatar**(`keys`: [*string*]): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`keys` | [*string*] |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:598](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L598)

___

### removeConnection

▸ **removeConnection**(`identityProviderId`: *number*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`identityProviderId` | *number* |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:483](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L483)

___

### removeUser

▸ **removeUser**(`userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/auth/service.ts:653](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L653)

___

### resendVerificationEmail

▸ **resendVerificationEmail**(`email`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:294](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L294)

___

### resetPassword

▸ **resetPassword**(`token`: *string*, `password`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`token` | *string* |
`password` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:328](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L328)

___

### updateUserAvatarId

▸ **updateUserAvatarId**(`userId`: *string*, `avatarId`: *string*, `avatarURL`: *string*, `thumbnailURL`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`avatarId` | *string* |
`avatarURL` | *string* |
`thumbnailURL` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:641](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L641)

___

### updateUserSettings

▸ `Const`**updateUserSettings**(`id`: *any*, `data`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *any* |
`data` | *any* |

**Returns:** (`dispatch`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:501](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L501)

___

### updateUsername

▸ **updateUsername**(`userId`: *string*, `name`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`name` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:629](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L629)

___

### uploadAvatar

▸ **uploadAvatar**(`data`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:507](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L507)

___

### uploadAvatarModel

▸ **uploadAvatarModel**(`model`: *any*, `thumbnail`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`model` | *any* |
`thumbnail` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:526](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L526)

___

### verifyEmail

▸ **verifyEmail**(`token`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`token` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:273](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/service.ts#L273)
