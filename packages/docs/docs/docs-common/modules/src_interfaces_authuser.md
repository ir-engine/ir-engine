---
id: "src_interfaces_authuser"
title: "Module: src/interfaces/AuthUser"
sidebar_label: "src/interfaces/AuthUser"
custom_edit_url: null
hide_title: true
---

# Module: src/interfaces/AuthUser

## Table of contents

### Interfaces

- [AuthUser](../interfaces/src_interfaces_authuser.authuser.md)

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

Defined in: [interfaces/AuthUser.ts:11](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/common/src/interfaces/AuthUser.ts#L11)

## Functions

### resolveAuthUser

▸ **resolveAuthUser**(`res`: *any*): [*AuthUser*](../interfaces/src_interfaces_authuser.authuser.md)

#### Parameters:

Name | Type |
:------ | :------ |
`res` | *any* |

**Returns:** [*AuthUser*](../interfaces/src_interfaces_authuser.authuser.md)

Defined in: [interfaces/AuthUser.ts:19](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/common/src/interfaces/AuthUser.ts#L19)
