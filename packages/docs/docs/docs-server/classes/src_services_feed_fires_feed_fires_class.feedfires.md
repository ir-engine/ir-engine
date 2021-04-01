---
id: "src_services_feed_fires_feed_fires_class.feedfires"
title: "Class: FeedFires"
sidebar_label: "FeedFires"
custom_edit_url: null
hide_title: true
---

# Class: FeedFires

[src/services/feed-fires/feed-fires.class](../modules/src_services_feed_fires_feed_fires_class.md).FeedFires

A class for ARC Feed service

## Hierarchy

* *Service*

  ↳ **FeedFires**

## Constructors

### constructor

\+ **new FeedFires**(`options`: *Partial*<SequelizeServiceOptions\>, `app`: [*Application*](../modules/src_declarations.md#application)): [*FeedFires*](src_services_feed_fires_feed_fires_class.feedfires.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *Partial*<SequelizeServiceOptions\> |
`app` | [*Application*](../modules/src_declarations.md#application) |

**Returns:** [*FeedFires*](src_services_feed_fires_feed_fires_class.feedfires.md)

Overrides: void

Defined in: [packages/server/src/services/feed-fires/feed-fires.class.ts:14](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/feed-fires/feed-fires.class.ts#L14)

## Properties

### Model

• **Model**: *any*

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:11

___

### app

• **app**: [*Application*](../modules/src_declarations.md#application)

Defined in: [packages/server/src/services/feed-fires/feed-fires.class.ts:13](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/feed-fires/feed-fires.class.ts#L13)

___

### docs

• **docs**: *any*

Defined in: [packages/server/src/services/feed-fires/feed-fires.class.ts:14](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/feed-fires/feed-fires.class.ts#L14)

___

### options

• **options**: SequelizeServiceOptions

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:12

## Accessors

### events

• get **events**(): *string*[]

**Returns:** *string*[]

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:86

___

### id

• get **id**(): *string*

**Returns:** *string*

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:85

## Methods

### \_create

▸ **_create**(`data`: *Partial*<any\> \| *Partial*<any\>[], `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *Partial*<any\> \| *Partial*<any\>[] |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:20

___

### \_find

▸ **_find**(`params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:18

___

### \_get

▸ **_get**(`id`: Id, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:19

___

### \_patch

▸ **_patch**(`id`: Id, `data`: *Partial*<any\>, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | *Partial*<any\> |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:22

___

### \_remove

▸ **_remove**(`id`: Id, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:23

___

### \_update

▸ **_update**(`id`: Id, `data`: *any*, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | *any* |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:21

___

### allowsMulti

▸ **allowsMulti**(`method`: *string*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`method` | *string* |

**Returns:** *boolean*

Inherited from: void

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:95

___

### create

▸ **create**(`data`: *any*, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |
`params?` | Params |

**Returns:** *Promise*<any\>

Overrides: void

Defined in: [packages/server/src/services/feed-fires/feed-fires.class.ts:73](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/feed-fires/feed-fires.class.ts#L73)

___

### filterQuery

▸ **filterQuery**(`params?`: Params, `opts?`: *any*): { [key: string]: *any*;  } & { `paginate`: *false* \| *Pick*<PaginationOptions, *max*\> \| { `default?`: *number* ; `max?`: *number*  }  }

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |
`opts?` | *any* |

**Returns:** { [key: string]: *any*;  } & { `paginate`: *false* \| *Pick*<PaginationOptions, *max*\> \| { `default?`: *number* ; `max?`: *number*  }  }

Inherited from: void

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:87

___

### find

▸ **find**(`params`: Params): *Promise*<any\>

**`function`** find it is used to find specific users

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`params` | Params | user id   |

**Returns:** *Promise*<any\>

{@Array} of found users

Overrides: void

Defined in: [packages/server/src/services/feed-fires/feed-fires.class.ts:28](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/feed-fires/feed-fires.class.ts#L28)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:97

___

### getModel

▸ **getModel**(`params`: Params): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`params` | Params |

**Returns:** *any*

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:16

___

### patch

▸ **patch**(`id`: Id, `data`: *Partial*<any\>, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | *Partial*<any\> |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:100

___

### remove

▸ **remove**(`feedId`: *string*, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |
`params?` | Params |

**Returns:** *Promise*<any\>

Overrides: void

Defined in: [packages/server/src/services/feed-fires/feed-fires.class.ts:92](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/feed-fires/feed-fires.class.ts#L92)

___

### update

▸ **update**(`id`: Id, `data`: *any*, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | *any* |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:99
