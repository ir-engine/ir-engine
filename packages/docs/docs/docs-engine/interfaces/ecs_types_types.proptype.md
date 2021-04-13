---
id: "ecs_types_types.proptype"
title: "Interface: PropType<T, D>"
sidebar_label: "PropType"
custom_edit_url: null
hide_title: true
---

# Interface: PropType<T, D\>

[ecs/types/Types](../modules/ecs_types_types.md).PropType

## Type parameters

Name |
:------ |
`T` |
`D` |

## Hierarchy

* [*PropTypeDefinition*](ecs_types_types.proptypedefinition.md)<T, D\>

  ↳ **PropType**

## Properties

### clone

• **clone**: [*TypeCloneFunction*](../modules/ecs_types_types.md#typeclonefunction)<T\>

Clone Function

Inherited from: [PropTypeDefinition](ecs_types_types.proptypedefinition.md).[clone](ecs_types_types.proptypedefinition.md#clone)

Defined in: [packages/engine/src/ecs/types/Types.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L17)

___

### copy

• **copy**: [*TypeCopyFunction*](../modules/ecs_types_types.md#typecopyfunction)<T\>

Copy Function

Inherited from: [PropTypeDefinition](ecs_types_types.proptypedefinition.md).[copy](ecs_types_types.proptypedefinition.md#copy)

Defined in: [packages/engine/src/ecs/types/Types.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L15)

___

### default

• `Optional` **default**: D

Default value.

Inherited from: [PropTypeDefinition](ecs_types_types.proptypedefinition.md).[default](ecs_types_types.proptypedefinition.md#default)

Defined in: [packages/engine/src/ecs/types/Types.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L13)

___

### isType

• **isType**: *true*

Mark the prop as type.

Defined in: [packages/engine/src/ecs/types/Types.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L22)

___

### name

• **name**: *string*

Name of the prop.

Inherited from: [PropTypeDefinition](ecs_types_types.proptypedefinition.md).[name](ecs_types_types.proptypedefinition.md#name)

Defined in: [packages/engine/src/ecs/types/Types.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L11)
