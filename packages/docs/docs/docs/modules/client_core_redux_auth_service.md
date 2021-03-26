---
id: "client_core_redux_auth_service"
title: "Module: client-core/redux/auth/service"
sidebar_label: "client-core/redux/auth/service"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/auth/service

## Functions

### addConnectionByEmail

▸ **addConnectionByEmail**(`email`: *string*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *string* |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:418](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L418)

___

### addConnectionByOauth

▸ **addConnectionByOauth**(`oauth`: *facebook* \| *google* \| *github* \| *linkedin* \| *twitter*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`oauth` | *facebook* \| *google* \| *github* \| *linkedin* \| *twitter* |
`userId` | *string* |

**Returns:** () => *void*

Defined in: [packages/client-core/redux/auth/service.ts:460](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L460)

___

### addConnectionByPassword

▸ **addConnectionByPassword**(`form`: [*EmailLoginForm*](../interfaces/client_core_redux_auth_actions.emailloginform.md), `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`form` | [*EmailLoginForm*](../interfaces/client_core_redux_auth_actions.emailloginform.md) |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:396](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L396)

___

### addConnectionBySms

▸ **addConnectionBySms**(`phone`: *string*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`phone` | *string* |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:439](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L439)

___

### createMagicLink

▸ **createMagicLink**(`emailPhone`: *string*, `linkType?`: *email* \| *sms*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`emailPhone` | *string* |
`linkType?` | *email* \| *sms* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:338](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L338)

___

### doLoginAuto

▸ **doLoginAuto**(`allowGuest?`: *boolean*, `forceClientAuthReset?`: *boolean*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`allowGuest?` | *boolean* |
`forceClientAuthReset?` | *boolean* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/auth/service.ts:54](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L54)

___

### fetchAvatarList

▸ **fetchAvatarList**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:592](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L592)

___

### forgotPassword

▸ **forgotPassword**(`email`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:299](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L299)

___

### loadUserData

▸ **loadUserData**(`dispatch`: Dispatch, `userId`: *string*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`dispatch` | Dispatch |
`userId` | *string* |

**Returns:** *any*

Defined in: [packages/client-core/redux/auth/service.ts:110](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L110)

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

Defined in: [packages/client-core/redux/auth/service.ts:199](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L199)

___

### loginUserByOAuth

▸ **loginUserByOAuth**(`service`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`service` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:183](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L183)

___

### loginUserByPassword

▸ **loginUserByPassword**(`form`: [*EmailLoginForm*](../interfaces/client_core_redux_auth_actions.emailloginform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`form` | [*EmailLoginForm*](../interfaces/client_core_redux_auth_actions.emailloginform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:142](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L142)

___

### logoutUser

▸ **logoutUser**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:224](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L224)

___

### refreshConnections

▸ **refreshConnections**(`userId`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |

**Returns:** *void*

Defined in: [packages/client-core/redux/auth/service.ts:482](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L482)

___

### registerUserByEmail

▸ **registerUserByEmail**(`form`: [*EmailRegistrationForm*](../interfaces/client_core_redux_auth_actions.emailregistrationform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`form` | [*EmailRegistrationForm*](../interfaces/client_core_redux_auth_actions.emailregistrationform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:237](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L237)

___

### removeAvatar

▸ **removeAvatar**(`keys`: [*string*]): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`keys` | [*string*] |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:581](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L581)

___

### removeConnection

▸ **removeConnection**(`identityProviderId`: *number*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`identityProviderId` | *number* |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:466](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L466)

___

### removeUser

▸ **removeUser**(`userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/auth/service.ts:632](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L632)

___

### resendVerificationEmail

▸ **resendVerificationEmail**(`email`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:282](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L282)

___

### resetPassword

▸ **resetPassword**(`token`: *string*, `password`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`token` | *string* |
`password` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:316](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L316)

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

Defined in: [packages/client-core/redux/auth/service.ts:620](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L620)

___

### updateUserSettings

▸ `Const`**updateUserSettings**(`id`: *any*, `data`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *any* |
`data` | *any* |

**Returns:** (`dispatch`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:484](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L484)

___

### updateUsername

▸ **updateUsername**(`userId`: *string*, `name`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`name` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:608](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L608)

___

### uploadAvatar

▸ **uploadAvatar**(`data`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:490](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L490)

___

### uploadAvatarModel

▸ **uploadAvatarModel**(`model`: *any*, `thumbnail`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`model` | *any* |
`thumbnail` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/auth/service.ts:509](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L509)

___

### verifyEmail

▸ **verifyEmail**(`token`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`token` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/auth/service.ts:261](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/auth/service.ts#L261)
