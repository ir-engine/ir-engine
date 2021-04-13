---
id: "src_user_reducers_auth_reducers"
title: "Module: src/user/reducers/auth/reducers"
sidebar_label: "src/user/reducers/auth/reducers"
custom_edit_url: null
hide_title: true
---

# Module: src/user/reducers/auth/reducers

## Variables

### initialAuthState

• `Const` **initialAuthState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`authUser` | *object* |
`authUser.accessToken` | *string* |
`authUser.authentication` | *object* |
`authUser.authentication.strategy` | *string* |
`authUser.identityProvider` | IdentityProvider |
`avatarList` | *any*[] |
`error` | *string* |
`identityProvider` | IdentityProvider |
`isLoggedIn` | *boolean* |
`isProcessing` | *boolean* |
`user` | *object* |
`user.id` | *string* |
`user.identityProviders` | *any*[] |
`user.name` | *string* |

Defined in: [packages/client-core/src/user/reducers/auth/reducers.ts:42](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/reducers/auth/reducers.ts#L42)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/src/user/reducers/auth/reducers.ts:54](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/reducers/auth/reducers.ts#L54)
