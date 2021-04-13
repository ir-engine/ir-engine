---
id: "networking_schema_clientinputschema.clientinputmodel"
title: "Class: ClientInputModel"
sidebar_label: "ClientInputModel"
custom_edit_url: null
hide_title: true
---

# Class: ClientInputModel

[networking/schema/clientInputSchema](../modules/networking_schema_clientinputschema.md).ClientInputModel

Class for client input.

## Constructors

### constructor

\+ **new ClientInputModel**(): [*ClientInputModel*](networking_schema_clientinputschema.clientinputmodel.md)

**Returns:** [*ClientInputModel*](networking_schema_clientinputschema.clientinputmodel.md)

## Properties

### model

▪ `Static` **model**: *Model*<Record<string, unknown\>\>

Model holding client input.

Defined in: [packages/engine/src/networking/schema/clientInputSchema.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/schema/clientInputSchema.ts#L56)

## Methods

### fromBuffer

▸ `Static`**fromBuffer**(`buffer`: *Buffer*): [*NetworkClientInputInterface*](../interfaces/networking_interfaces_worldstate.networkclientinputinterface.md)

Read from buffer.

#### Parameters:

Name | Type |
:------ | :------ |
`buffer` | *Buffer* |

**Returns:** [*NetworkClientInputInterface*](../interfaces/networking_interfaces_worldstate.networkclientinputinterface.md)

Defined in: [packages/engine/src/networking/schema/clientInputSchema.ts:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/schema/clientInputSchema.ts#L66)

___

### toBuffer

▸ `Static`**toBuffer**(`inputs`: [*NetworkClientInputInterface*](../interfaces/networking_interfaces_worldstate.networkclientinputinterface.md)): *Buffer*

Convert to buffer.

#### Parameters:

Name | Type |
:------ | :------ |
`inputs` | [*NetworkClientInputInterface*](../interfaces/networking_interfaces_worldstate.networkclientinputinterface.md) |

**Returns:** *Buffer*

Defined in: [packages/engine/src/networking/schema/clientInputSchema.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/schema/clientInputSchema.ts#L58)
