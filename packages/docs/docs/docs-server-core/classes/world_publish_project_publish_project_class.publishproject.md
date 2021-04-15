---
id: "world_publish_project_publish_project_class.publishproject"
title: "Class: PublishProject"
sidebar_label: "PublishProject"
custom_edit_url: null
hide_title: true
---

# Class: PublishProject

[world/publish-project/publish-project.class](../modules/world_publish_project_publish_project_class.md).PublishProject

A class for Publish Project  service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new PublishProject**(`options?`: ServiceOptions, `app`: Application): [*PublishProject*](world_publish_project_publish_project_class.publishproject.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`options` | ServiceOptions | {} |
`app` | Application | - |

**Returns:** [*PublishProject*](world_publish_project_publish_project_class.publishproject.md)

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:22](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L22)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:20](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L20)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:22](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L22)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:21](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L21)

## Methods

### create

▸ **create**(`data`: *any*, `params`: Params): *Promise*<Data\>

A function which is used to create publish project

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`data` | *any* | of new publish project   |
`params` | Params | contains user info   |

**Returns:** *Promise*<Data\>

created new publish project

Implementation of: ServiceMethods.create

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:60](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L60)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

A function which is used to display all published project

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

all published project

Implementation of: ServiceMethods.find

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:34](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L34)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

A function which is used to get specific publish project

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of publish project   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

{@Object} contains id of publish project and message

Implementation of: ServiceMethods.get

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:46](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L46)

___

### patch

▸ **patch**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.patch

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:121](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L121)

___

### remove

▸ **remove**(`id`: NullableId, `params?`: Params): *Promise*<Data\>

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId | of specific project   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

{@Object} removed publish project

Implementation of: ServiceMethods.remove

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:132](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L132)

___

### update

▸ **update**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

A function which is used to update publish project

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId |  |
`data` | Data | of new publish project   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

{@Object} updated project

Implementation of: ServiceMethods.update

Defined in: [packages/server-core/src/world/publish-project/publish-project.class.ts:117](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/world/publish-project/publish-project.class.ts#L117)
