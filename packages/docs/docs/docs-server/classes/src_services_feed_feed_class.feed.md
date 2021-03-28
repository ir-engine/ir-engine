---
id: "src_services_feed_feed_class.feed"
title: "Class: Feed"
sidebar_label: "Feed"
custom_edit_url: null
hide_title: true
---

# Class: Feed

[src/services/feed/feed.class](../modules/src_services_feed_feed_class.md).Feed

A class for ARC Feed service

## Hierarchy

* *Service*

  ↳ **Feed**

## Constructors

### constructor

\+ **new Feed**(`options`: *Partial*<SequelizeServiceOptions\>, `app`: [*Application*](../modules/src_declarations.md#application)): [*Feed*](src_services_feed_feed_class.feed.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *Partial*<SequelizeServiceOptions\> |
`app` | [*Application*](../modules/src_declarations.md#application) |

**Returns:** [*Feed*](src_services_feed_feed_class.feed.md)

Overrides: void

Defined in: [packages/server/src/services/feed/feed.class.ts:13](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/feed/feed.class.ts#L13)

## Properties

### Model

• **Model**: *any*

Inherited from: void

Defined in: node_modules/feathers-sequelize/types/index.d.ts:11

___

### app

• **app**: [*Application*](../modules/src_declarations.md#application)

Defined in: [packages/server/src/services/feed/feed.class.ts:12](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/feed/feed.class.ts#L12)

___

### docs

• **docs**: *any*

Defined in: [packages/server/src/services/feed/feed.class.ts:13](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/feed/feed.class.ts#L13)

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

Defined in: [packages/server/src/services/feed/feed.class.ts:258](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/feed/feed.class.ts#L258)

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

Name | Type |
:------ | :------ |
`params` | Params |

**Returns:** *Promise*<any\>

{@Array} of found users

Overrides: void

Defined in: [packages/server/src/services/feed/feed.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/feed/feed.class.ts#L27)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<any\>

A function which is used to find specific project

**`author`** Vykliuk Tetiana

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of single feed   |
`params?` | Params | contains current user   |

**Returns:** *Promise*<any\>

{@Object} contains specific feed

Overrides: void

Defined in: [packages/server/src/services/feed/feed.class.ts:195](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/feed/feed.class.ts#L195)

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

▸ **patch**(`id`: *string*, `data?`: *any*, `params?`: Params): *Promise*<any\>

A function which is used to update viewsCount field of feed

**`author`** 

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | *string* | of feed to update   |
`data?` | *any* | - |
`params?` | Params |  |

**Returns:** *Promise*<any\>

updated feed

Overrides: void

Defined in: [packages/server/src/services/feed/feed.class.ts:284](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/feed/feed.class.ts#L284)

___

### remove

▸ **remove**(`id`: Id, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: void

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:101

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
