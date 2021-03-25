---
id: "client_core_redux_auth_reducers"
title: "Module: client-core/redux/auth/reducers"
sidebar_label: "client-core/redux/auth/reducers"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/auth/reducers

## Variables

### initialState

• `Const` **initialState**: *object*

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

Defined in: [packages/client-core/redux/auth/reducers.ts:42](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/auth/reducers.ts#L42)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/redux/auth/reducers.ts:54](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/auth/reducers.ts#L54)
