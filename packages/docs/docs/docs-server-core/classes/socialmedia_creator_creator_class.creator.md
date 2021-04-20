---
id: "socialmedia_creator_creator_class.creator"
title: "Class: Creator"
sidebar_label: "Creator"
custom_edit_url: null
hide_title: true
---

# Class: Creator

[socialmedia/creator/creator.class](../modules/socialmedia_creator_creator_class.md).Creator

A class for ARC Creator service

## Hierarchy

* *Service*

  ↳ **Creator**

## Constructors

### constructor

\+ **new Creator**(`options`: *Partial*<SequelizeServiceOptions\>, `app`: Application): [*Creator*](socialmedia_creator_creator_class.creator.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *Partial*<SequelizeServiceOptions\> |
`app` | Application |

**Returns:** [*Creator*](socialmedia_creator_creator_class.creator.md)

Overrides: Service.constructor

Defined in: [packages/server-core/src/socialmedia/creator/creator.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/server-core/src/socialmedia/creator/creator.class.ts#L15)

## Properties

### Model

• **Model**: *any*

Inherited from: Service.Model

Defined in: node_modules/feathers-sequelize/types/index.d.ts:11

___

### app

• **app**: Application

Defined in: [packages/server-core/src/socialmedia/creator/creator.class.ts:14](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/server-core/src/socialmedia/creator/creator.class.ts#L14)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/socialmedia/creator/creator.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/server-core/src/socialmedia/creator/creator.class.ts#L15)

___

### options

• **options**: SequelizeServiceOptions

Inherited from: Service.options

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

Inherited from: Service._create

Defined in: node_modules/feathers-sequelize/types/index.d.ts:20

___

### \_find

▸ **_find**(`params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: Service._find

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

Inherited from: Service._get

Defined in: node_modules/feathers-sequelize/types/index.d.ts:19

___

### \_patch

▸ **_patch**(`id`: NullableId, `data`: *Partial*<any\>, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`data` | *Partial*<any\> |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: Service._patch

Defined in: node_modules/feathers-sequelize/types/index.d.ts:22

___

### \_remove

▸ **_remove**(`id`: NullableId, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: Service._remove

Defined in: node_modules/feathers-sequelize/types/index.d.ts:23

___

### \_update

▸ **_update**(`id`: NullableId, `data`: *any*, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`data` | *any* |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: Service._update

Defined in: node_modules/feathers-sequelize/types/index.d.ts:21

___

### allowsMulti

▸ **allowsMulti**(`method`: *string*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`method` | *string* |

**Returns:** *boolean*

Inherited from: Service.allowsMulti

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

Overrides: Service.create

Defined in: [packages/server-core/src/socialmedia/creator/creator.class.ts:115](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/server-core/src/socialmedia/creator/creator.class.ts#L115)

___

### filterQuery

▸ **filterQuery**(`params?`: Params, `opts?`: *any*): { [key: string]: *any*;  } & { `paginate`: *false* \| *Pick*<PaginationOptions, *max*\> \| { `default?`: *number* ; `max?`: *number*  }  }

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |
`opts?` | *any* |

**Returns:** { [key: string]: *any*;  } & { `paginate`: *false* \| *Pick*<PaginationOptions, *max*\> \| { `default?`: *number* ; `max?`: *number*  }  }

Inherited from: Service.filterQuery

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

Overrides: Service.find

Defined in: [packages/server-core/src/socialmedia/creator/creator.class.ts:29](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/server-core/src/socialmedia/creator/creator.class.ts#L29)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<any\>

A function which is used to find specific project

**`author`** Vykliuk Tetiana

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of single Creator   |
`params?` | Params | contains current user   |

**Returns:** *Promise*<any\>

{@Object} contains specific feed

Overrides: Service.get

Defined in: [packages/server-core/src/socialmedia/creator/creator.class.ts:89](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/server-core/src/socialmedia/creator/creator.class.ts#L89)

___

### getModel

▸ **getModel**(`params`: Params): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`params` | Params |

**Returns:** *any*

Inherited from: Service.getModel

Defined in: node_modules/feathers-sequelize/types/index.d.ts:16

___

### patch

▸ **patch**(`id`: *string*, `data?`: *any*, `params?`: Params): *Promise*<any\>

A function which is used to update creator data

**`author`** Vykliuk Tetiana

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | *string* | of feed to update   |
`data?` | *any* | - |
`params?` | Params |  |

**Returns:** *Promise*<any\>

updated feed

Overrides: Service.patch

Defined in: [packages/server-core/src/socialmedia/creator/creator.class.ts:142](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/server-core/src/socialmedia/creator/creator.class.ts#L142)

___

### remove

▸ **remove**(`id`: NullableId, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: Service.remove

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

Inherited from: Service.update

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:99
