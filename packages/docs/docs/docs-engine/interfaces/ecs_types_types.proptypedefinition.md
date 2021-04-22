---
id: "ecs_types_types.proptypedefinition"
title: "Interface: PropTypeDefinition<T, D>"
sidebar_label: "PropTypeDefinition"
custom_edit_url: null
hide_title: true
---

# Interface: PropTypeDefinition<T, D\>

[ecs/types/Types](../modules/ecs_types_types.md).PropTypeDefinition

Base Interface for prop type

## Type parameters

Name |
:------ |
`T` |
`D` |

## Hierarchy

* **PropTypeDefinition**

  ↳ [*PropType*](ecs_types_types.proptype.md)

## Properties

### clone

• **clone**: [*TypeCloneFunction*](../modules/ecs_types_types.md#typeclonefunction)<T\>

Clone Function

Defined in: [packages/engine/src/ecs/types/Types.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L17)

___

### copy

• **copy**: [*TypeCopyFunction*](../modules/ecs_types_types.md#typecopyfunction)<T\>

Copy Function

Defined in: [packages/engine/src/ecs/types/Types.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L15)

___

### default

• `Optional` **default**: D

Default value.

Defined in: [packages/engine/src/ecs/types/Types.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L13)

___

### name

• **name**: *string*

Name of the prop.

Defined in: [packages/engine/src/ecs/types/Types.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L11)
