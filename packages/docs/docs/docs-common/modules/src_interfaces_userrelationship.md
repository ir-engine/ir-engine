---
id: "src_interfaces_userrelationship"
title: "Module: src/interfaces/UserRelationship"
sidebar_label: "src/interfaces/UserRelationship"
custom_edit_url: null
hide_title: true
---

# Module: src/interfaces/UserRelationship

## Type aliases

### RelationshipType

Ƭ **RelationshipType**: ``"friend"`` \| ``"requested"`` \| ``"blocked"`` \| ``"blocking"``

Defined in: [interfaces/UserRelationship.ts:1](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/common/src/interfaces/UserRelationship.ts#L1)

___

### UserRelationship

Ƭ **UserRelationship**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `createdAt` | *string* |
| `id` | *string* |
| `relatedUserId` | *string* |
| `updatedAt` | *string* |
| `userId` | *string* |
| `userRelationshipType` | [*RelationshipType*](src_interfaces_userrelationship.md#relationshiptype) |

Defined in: [interfaces/UserRelationship.ts:2](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/common/src/interfaces/UserRelationship.ts#L2)
