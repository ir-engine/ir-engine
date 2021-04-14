---
id: "src_user_reducers_auth_service"
title: "Module: src/user/reducers/auth/service"
sidebar_label: "src/user/reducers/auth/service"
custom_edit_url: null
hide_title: true
---

# Module: src/user/reducers/auth/service

## Functions

### addConnectionByEmail

▸ **addConnectionByEmail**(`email`: *string*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *string* |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:425](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L425)

___

### addConnectionByOauth

▸ **addConnectionByOauth**(`oauth`: *facebook* \| *google* \| *github* \| *linkedin* \| *twitter*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`oauth` | *facebook* \| *google* \| *github* \| *linkedin* \| *twitter* |
`userId` | *string* |

**Returns:** () => *void*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:472](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L472)

___

### addConnectionByPassword

▸ **addConnectionByPassword**(`form`: [*EmailLoginForm*](../interfaces/src_user_reducers_auth_actions.emailloginform.md), `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`form` | [*EmailLoginForm*](../interfaces/src_user_reducers_auth_actions.emailloginform.md) |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:403](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L403)

___

### addConnectionBySms

▸ **addConnectionBySms**(`phone`: *string*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`phone` | *string* |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:446](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L446)

___

### createMagicLink

▸ **createMagicLink**(`emailPhone`: *string*, `linkType?`: *email* \| *sms*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`emailPhone` | *string* |
`linkType?` | *email* \| *sms* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:345](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L345)

___

### doLoginAuto

▸ **doLoginAuto**(`allowGuest?`: *boolean*, `forceClientAuthReset?`: *boolean*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`allowGuest?` | *boolean* |
`forceClientAuthReset?` | *boolean* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:49](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L49)

___

### fetchAvatarList

▸ **fetchAvatarList**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<void\>

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:604](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L604)

___

### forgotPassword

▸ **forgotPassword**(`email`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:306](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L306)

___

### loadUserData

▸ **loadUserData**(`dispatch`: Dispatch, `userId`: *string*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`dispatch` | Dispatch |
`userId` | *string* |

**Returns:** *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:116](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L116)

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

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:205](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L205)

___

### loginUserByOAuth

▸ **loginUserByOAuth**(`service`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`service` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:189](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L189)

___

### loginUserByPassword

▸ **loginUserByPassword**(`form`: [*EmailLoginForm*](../interfaces/src_user_reducers_auth_actions.emailloginform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`form` | [*EmailLoginForm*](../interfaces/src_user_reducers_auth_actions.emailloginform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:148](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L148)

___

### logoutUser

▸ **logoutUser**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:231](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L231)

___

### refreshConnections

▸ **refreshConnections**(`userId`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |

**Returns:** *void*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:494](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L494)

___

### registerUserByEmail

▸ **registerUserByEmail**(`form`: [*EmailRegistrationForm*](../interfaces/src_user_reducers_auth_actions.emailregistrationform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`form` | [*EmailRegistrationForm*](../interfaces/src_user_reducers_auth_actions.emailregistrationform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:244](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L244)

___

### removeAvatar

▸ **removeAvatar**(`keys`: [*string*]): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`keys` | [*string*] |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:593](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L593)

___

### removeConnection

▸ **removeConnection**(`identityProviderId`: *number*, `userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`identityProviderId` | *number* |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:478](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L478)

___

### removeUser

▸ **removeUser**(`userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:648](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L648)

___

### resendVerificationEmail

▸ **resendVerificationEmail**(`email`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:289](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L289)

___

### resetPassword

▸ **resetPassword**(`token`: *string*, `password`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`token` | *string* |
`password` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:323](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L323)

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

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:636](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L636)

___

### updateUserSettings

▸ `Const`**updateUserSettings**(`id`: *any*, `data`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *any* |
`data` | *any* |

**Returns:** (`dispatch`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:496](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L496)

___

### updateUsername

▸ **updateUsername**(`userId`: *string*, `name`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`name` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:624](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L624)

___

### uploadAvatar

▸ **uploadAvatar**(`data`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:502](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L502)

___

### uploadAvatarModel

▸ **uploadAvatarModel**(`model`: *any*, `thumbnail`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`model` | *any* |
`thumbnail` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:521](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L521)

___

### verifyEmail

▸ **verifyEmail**(`token`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`token` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/auth/service.ts:268](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/user/reducers/auth/service.ts#L268)
