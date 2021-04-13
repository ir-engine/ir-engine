---
id: "user_user_relationship_user_relationship_class.userrelationship"
title: "Class: UserRelationship"
sidebar_label: "UserRelationship"
custom_edit_url: null
hide_title: true
---

# Class: UserRelationship

[user/user-relationship/user-relationship.class](../modules/user_user_relationship_user_relationship_class.md).UserRelationship

A class for User Relationship service

**`author`** Vyacheslav Solovjov

## Hierarchy

* *Service*

  ↳ **UserRelationship**

## Constructors

### constructor

\+ **new UserRelationship**(`options`: *Partial*<SequelizeServiceOptions\>, `app`: Application): [*UserRelationship*](user_user_relationship_user_relationship_class.userrelationship.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *Partial*<SequelizeServiceOptions\> |
`app` | Application |

**Returns:** [*UserRelationship*](user_user_relationship_user_relationship_class.userrelationship.md)

Overrides: Service.constructor

Defined in: [packages/server-core/src/user/user-relationship/user-relationship.class.ts:20](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/user-relationship/user-relationship.class.ts#L20)

## Properties

### Model

• **Model**: *any*

Inherited from: Service.Model

Defined in: node_modules/feathers-sequelize/types/index.d.ts:11

___

### app

• **app**: Application

Defined in: [packages/server-core/src/user/user-relationship/user-relationship.class.ts:19](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/user-relationship/user-relationship.class.ts#L19)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/user/user-relationship/user-relationship.class.ts:20](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/user-relationship/user-relationship.class.ts#L20)

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

▸ **create**(`data`: *any*, `params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |
`params` | Params |

**Returns:** *Promise*<any\>

Overrides: Service.create

Defined in: [packages/server-core/src/user/user-relationship/user-relationship.class.ts:72](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/user-relationship/user-relationship.class.ts#L72)

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

▸ **find**(`params?`: Params): *Promise*<any[] \| Paginated<any\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<any[] \| Paginated<any\>\>

Inherited from: Service.find

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:96

___

### findAll

▸ **findAll**(`params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`params` | Params |

**Returns:** *Promise*<any\>

Defined in: [packages/server-core/src/user/user-relationship/user-relationship.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/user-relationship/user-relationship.class.ts#L27)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: Service.get

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:97

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

▸ **patch**(`id`: NullableId, `data`: *any*, `params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`data` | *any* |
`params` | Params |

**Returns:** *Promise*<any\>

Overrides: Service.patch

Defined in: [packages/server-core/src/user/user-relationship/user-relationship.class.ts:99](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/user-relationship/user-relationship.class.ts#L99)

___

### remove

▸ **remove**(`id`: NullableId, `params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`params` | Params |

**Returns:** *Promise*<any\>

Overrides: Service.remove

Defined in: [packages/server-core/src/user/user-relationship/user-relationship.class.ts:118](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/user-relationship/user-relationship.class.ts#L118)

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
