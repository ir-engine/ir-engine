---
id: "graphql_graphql_class.graphql"
title: "Class: Graphql"
sidebar_label: "Graphql"
custom_edit_url: null
hide_title: true
---

# Class: Graphql

[graphql/graphql.class](../modules/graphql_graphql_class.md).Graphql

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new Graphql**(`options?`: ServiceOptions, `app`: Application): [*Graphql*](graphql_graphql_class.graphql.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | ServiceOptions |
`app` | Application |

**Returns:** [*Graphql*](graphql_graphql_class.graphql.md)

Defined in: [packages/server-core/src/graphql/graphql.class.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/graphql/graphql.class.ts#L10)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/graphql/graphql.class.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/graphql/graphql.class.ts#L9)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/graphql/graphql.class.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/graphql/graphql.class.ts#L10)

## Methods

### create

▸ **create**(`data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server-core/src/graphql/graphql.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/graphql/graphql.class.ts#L27)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: void

Defined in: [packages/server-core/src/graphql/graphql.class.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/graphql/graphql.class.ts#L17)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server-core/src/graphql/graphql.class.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/graphql/graphql.class.ts#L21)

___

### patch

▸ **patch**(`id`: Id, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server-core/src/graphql/graphql.class.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/graphql/graphql.class.ts#L39)

___

### remove

▸ **remove**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server-core/src/graphql/graphql.class.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/graphql/graphql.class.ts#L43)

___

### update

▸ **update**(`id`: Id, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server-core/src/graphql/graphql.class.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/graphql/graphql.class.ts#L35)
