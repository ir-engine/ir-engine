---
id: "ecs_types_types"
title: "Module: ecs/types/Types"
sidebar_label: "ecs/types/Types"
custom_edit_url: null
hide_title: true
---

# Module: ecs/types/Types

## Table of contents

### Interfaces

- [PropType](../interfaces/ecs_types_types.proptype.md)
- [PropTypeDefinition](../interfaces/ecs_types_types.proptypedefinition.md)

## Type aliases

### ArrayPropType

Ƭ **ArrayPropType**<T\>: [*PropType*](../interfaces/ecs_types_types.proptype.md)<T[], []\>

#### Type parameters:

Name |
:------ |
`T` |

Defined in: [packages/engine/src/ecs/types/Types.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L28)

___

### BooleanPropType

Ƭ **BooleanPropType**: [*PropType*](../interfaces/ecs_types_types.proptype.md)<boolean, boolean\>

Defined in: [packages/engine/src/ecs/types/Types.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L26)

___

### JSONPropType

Ƭ **JSONPropType**: [*PropType*](../interfaces/ecs_types_types.proptype.md)<any, *null*\>

Defined in: [packages/engine/src/ecs/types/Types.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L30)

___

### NumberPropType

Ƭ **NumberPropType**: [*PropType*](../interfaces/ecs_types_types.proptype.md)<number, number\>

Defined in: [packages/engine/src/ecs/types/Types.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L25)

___

### RefPropType

Ƭ **RefPropType**<T\>: [*PropType*](../interfaces/ecs_types_types.proptype.md)<T, undefined\>

#### Type parameters:

Name |
:------ |
`T` |

Defined in: [packages/engine/src/ecs/types/Types.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L29)

___

### StringPropType

Ƭ **StringPropType**: [*PropType*](../interfaces/ecs_types_types.proptype.md)<string, string\>

Defined in: [packages/engine/src/ecs/types/Types.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L27)

___

### TypeCloneFunction

Ƭ **TypeCloneFunction**<T\>: (`value`: T) => T

Clone function definition

#### Type parameters:

Name |
:------ |
`T` |

#### Type declaration:

▸ (`value`: T): T

#### Parameters:

Name | Type |
:------ | :------ |
`value` | T |

**Returns:** T

Defined in: [packages/engine/src/ecs/types/Types.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L6)

___

### TypeCopyFunction

Ƭ **TypeCopyFunction**<T\>: (`src`: T, `dest`: T) => T

Copy function definition

#### Type parameters:

Name |
:------ |
`T` |

#### Type declaration:

▸ (`src`: T, `dest`: T): T

#### Parameters:

Name | Type |
:------ | :------ |
`src` | T |
`dest` | T |

**Returns:** T

Defined in: [packages/engine/src/ecs/types/Types.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L4)

## Variables

### Types

• `Const` **Types**: *object*

Standard types.
**NOTE:** Use ref for attaching objects to this entity unless you want to make the object clonable.

#### Type declaration:

Name | Type |
:------ | :------ |
`Array` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any[]\> |
`Boolean` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, boolean\> |
`JSON` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<any, any\> |
`Number` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, number\> |
`QuaternionType` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, number[]\> |
`Ref` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |
`String` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, string\> |
`Vector2Type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, number[]\> |
`Vector3Type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, number[]\> |

Defined in: [packages/engine/src/ecs/types/Types.ts:87](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L87)

___

### fromEntries

• `Const` **fromEntries**: *any*

Defined in: [packages/engine/src/ecs/types/Types.ts:152](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L152)

## Functions

### cloneArray

▸ `Const`**cloneArray**<T\>(`value`: T[]): T[]

#### Type parameters:

Name |
:------ |
`T` |

#### Parameters:

Name | Type |
:------ | :------ |
`value` | T[] |

**Returns:** T[]

Defined in: [packages/engine/src/ecs/types/Types.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L40)

___

### cloneClonable

▸ `Const`**cloneClonable**<T\>(`value`: T): T

#### Type parameters:

Name |
:------ |
`T` |

#### Parameters:

Name | Type |
:------ | :------ |
`value` | T |

**Returns:** T

Defined in: [packages/engine/src/ecs/types/Types.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L58)

___

### cloneJSON

▸ `Const`**cloneJSON**(`value`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/ecs/types/Types.ts:44](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L44)

___

### cloneValue

▸ `Const`**cloneValue**<T\>(`value`: T): T

#### Type parameters:

Name |
:------ |
`T` |

#### Parameters:

Name | Type |
:------ | :------ |
`value` | T |

**Returns:** T

Defined in: [packages/engine/src/ecs/types/Types.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L34)

___

### copyArray

▸ `Const`**copyArray**<T\>(`src?`: T[], `dest?`: T[]): T[]

#### Type parameters:

Name |
:------ |
`T` |

#### Parameters:

Name | Type |
:------ | :------ |
`src?` | T[] |
`dest?` | T[] |

**Returns:** T[]

Defined in: [packages/engine/src/ecs/types/Types.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L36)

___

### copyCopyable

▸ `Const`**copyCopyable**<T\>(`src`: T, `dest`: T): T

#### Type parameters:

Name |
:------ |
`T` |

#### Parameters:

Name | Type |
:------ | :------ |
`src` | T |
`dest` | T |

**Returns:** T

Defined in: [packages/engine/src/ecs/types/Types.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L46)

___

### copyJSON

▸ `Const`**copyJSON**(`src`: *any*, `dest`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |
`dest` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/ecs/types/Types.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L42)

___

### copyValue

▸ `Const`**copyValue**<T\>(`src`: T, `dest`: T): T

#### Type parameters:

Name |
:------ |
`T` |

#### Parameters:

Name | Type |
:------ | :------ |
`src` | T |
`dest` | T |

**Returns:** T

Defined in: [packages/engine/src/ecs/types/Types.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L32)

___

### createType

▸ **createType**<T, D\>(`typeDefinition`: [*PropTypeDefinition*](../interfaces/ecs_types_types.proptypedefinition.md)<T, D\>): [*PropType*](../interfaces/ecs_types_types.proptype.md)<T, D\>

Create a Type

#### Type parameters:

Name |
:------ |
`T` |
`D` |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`typeDefinition` | [*PropTypeDefinition*](../interfaces/ecs_types_types.proptypedefinition.md)<T, D\> | Definition of the type which will be used to create the type   |

**Returns:** [*PropType*](../interfaces/ecs_types_types.proptype.md)<T, D\>

Props Type created with given type definition.

Defined in: [packages/engine/src/ecs/types/Types.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L65)

___

### types

▸ **types**(`defaults?`: *object*): [*ComponentSchema*](../interfaces/ecs_interfaces_componentinterfaces.componentschema.md)

#### Parameters:

Name | Type |
:------ | :------ |
`defaults` | *object* |

**Returns:** [*ComponentSchema*](../interfaces/ecs_interfaces_componentinterfaces.componentschema.md)

Defined in: [packages/engine/src/ecs/types/Types.ts:161](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/types/Types.ts#L161)
