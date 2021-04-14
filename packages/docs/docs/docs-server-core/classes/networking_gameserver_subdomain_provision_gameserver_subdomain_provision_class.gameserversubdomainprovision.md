---
id: "networking_gameserver_subdomain_provision_gameserver_subdomain_provision_class.gameserversubdomainprovision"
title: "Class: GameserverSubdomainProvision"
sidebar_label: "GameserverSubdomainProvision"
custom_edit_url: null
hide_title: true
---

# Class: GameserverSubdomainProvision

[networking/gameserver-subdomain-provision/gameserver-subdomain-provision.class](../modules/networking_gameserver_subdomain_provision_gameserver_subdomain_provision_class.md).GameserverSubdomainProvision

A class for Game server domain provision  service

**`author`** Vyacheslav Solovjov

## Hierarchy

* *Service*

  ↳ **GameserverSubdomainProvision**

## Constructors

### constructor

\+ **new GameserverSubdomainProvision**(`options`: *Partial*<SequelizeServiceOptions\>, `app`: Application): [*GameserverSubdomainProvision*](networking_gameserver_subdomain_provision_gameserver_subdomain_provision_class.gameserversubdomainprovision.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *Partial*<SequelizeServiceOptions\> |
`app` | Application |

**Returns:** [*GameserverSubdomainProvision*](networking_gameserver_subdomain_provision_gameserver_subdomain_provision_class.gameserversubdomainprovision.md)

Overrides: Service.constructor

Defined in: [packages/server-core/src/networking/gameserver-subdomain-provision/gameserver-subdomain-provision.class.ts:10](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/networking/gameserver-subdomain-provision/gameserver-subdomain-provision.class.ts#L10)

## Properties

### Model

• **Model**: *any*

Inherited from: Service.Model

Defined in: node_modules/feathers-sequelize/types/index.d.ts:11

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/networking/gameserver-subdomain-provision/gameserver-subdomain-provision.class.ts:10](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/networking/gameserver-subdomain-provision/gameserver-subdomain-provision.class.ts#L10)

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

▸ **create**(`data`: *Partial*<any\> \| *Partial*<any\>[], `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *Partial*<any\> \| *Partial*<any\>[] |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: Service.create

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:98

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

▸ **patch**(`id`: NullableId, `data`: *Partial*<any\>, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`data` | *Partial*<any\> |
`params?` | Params |

**Returns:** *Promise*<any\>

Inherited from: Service.patch

Defined in: node_modules/@feathersjs/adapter-commons/lib/service.d.ts:100

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
