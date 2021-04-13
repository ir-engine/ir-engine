---
id: "src_interfaces_user"
title: "Module: src/interfaces/User"
sidebar_label: "src/interfaces/User"
custom_edit_url: null
hide_title: true
---

# Module: src/interfaces/User

## Table of contents

### Interfaces

- [User](../interfaces/src_interfaces_user.user.md)

## Type aliases

### RelationshipType

Ƭ **RelationshipType**: *friend* \| *requested* \| *blocked* \| *blocking*

Defined in: [src/interfaces/User.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/User.ts#L5)

## Variables

### UserSeed

• `Const` **UserSeed**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`id` | *string* |
`identityProviders` | *any*[] |
`name` | *string* |

Defined in: [src/interfaces/User.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/User.ts#L22)

## Functions

### resolveUser

▸ **resolveUser**(`user`: *any*): [*User*](../interfaces/src_interfaces_user.user.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | *any* |

**Returns:** [*User*](../interfaces/src_interfaces_user.user.md)

Defined in: [src/interfaces/User.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/common/src/interfaces/User.ts#L28)
