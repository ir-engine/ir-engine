---
id: "ecs_classes_query.queryserializetype"
title: "Interface: QuerySerializeType"
sidebar_label: "QuerySerializeType"
custom_edit_url: null
hide_title: true
---

# Interface: QuerySerializeType

[ecs/classes/Query](../modules/ecs_classes_query.md).QuerySerializeType

Interface of Serialized [Query](../classes/ecs_classes_query.query.md).

## Properties

### components

• **components**: *object*

List of Components included or not included in this query.

#### Type declaration:

Name | Type | Description |
:------ | :------ | :------ |
`included` | *any*[] | List of components.   |
`not` | *any*[] | List of non components.   |

Defined in: [packages/engine/src/ecs/classes/Query.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L27)

___

### key

• **key**: *any*

Key of the query.

Defined in: [packages/engine/src/ecs/classes/Query.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L21)

___

### numEntities

• **numEntities**: *number*

Number of Entities matched in this query.

Defined in: [packages/engine/src/ecs/classes/Query.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L25)

___

### reactive

• **reactive**: *boolean*

Is Query reactive.

Defined in: [packages/engine/src/ecs/classes/Query.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L23)
