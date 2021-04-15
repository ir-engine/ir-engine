---
id: "networking_instance_provision_instance_provision_class.instanceprovision"
title: "Class: InstanceProvision"
sidebar_label: "InstanceProvision"
custom_edit_url: null
hide_title: true
---

# Class: InstanceProvision

[networking/instance-provision/instance-provision.class](../modules/networking_instance_provision_instance_provision_class.md).InstanceProvision

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new InstanceProvision**(`options?`: ServiceOptions, `app`: Application): [*InstanceProvision*](networking_instance_provision_instance_provision_class.instanceprovision.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`options` | ServiceOptions | {} |
`app` | Application | - |

**Returns:** [*InstanceProvision*](networking_instance_provision_instance_provision_class.instanceprovision.md)

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:28](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L28)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:26](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L26)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:28](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L28)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L27)

## Methods

### create

▸ **create**(`data`: Data, `params?`: Params): *Promise*<Data\>

A method which is used to create instance

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`data` | Data | which is used to create instance   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

data of instance

Implementation of: ServiceMethods.create

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:340](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L340)

___

### find

▸ **find**(`params?`: Params): *Promise*<any\>

A method which find running Gameserver

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`params?` | Params | of query of locationId and instanceId   |

**Returns:** *Promise*<any\>

{@function} getFreeGameserver and getGSInService

Implementation of: ServiceMethods.find

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:132](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L132)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

A method which get specific instance

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of instance   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

id and text

Implementation of: ServiceMethods.get

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:326](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L326)

___

### getFreeGameserver

▸ **getFreeGameserver**(): *Promise*<any\>

An method which start server for instance

**`author`** Vyacheslav Solovjov

**Returns:** *Promise*<any\>

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:38](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L38)

___

### getGSInService

▸ **getGSInService**(`availableLocationInstances`: *any*): *Promise*<any\>

A method which get instance of GameServerr

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`availableLocationInstances` | *any* | for Gameserver   |

**Returns:** *Promise*<any\>

ipAddress and port

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:69](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L69)

___

### gsCleanup

▸ **gsCleanup**(`instance`: *any*): *Promise*<boolean\>

A method which get clean up server

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`instance` | *any* | of ipaddress and port   |

**Returns:** *Promise*<boolean\>

{@Boolean}

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:97](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L97)

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

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:367](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L367)

___

### remove

▸ **remove**(`id`: NullableId, `params?`: Params): *Promise*<Data\>

A method used to remove specific instance

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId | of instance   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

id

Implementation of: ServiceMethods.remove

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:379](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L379)

___

### update

▸ **update**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

A method used to update instance

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId |  |
`data` | Data | which is used to update instance   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

data of updated instance

Implementation of: ServiceMethods.update

Defined in: [packages/server-core/src/networking/instance-provision/instance-provision.class.ts:356](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/networking/instance-provision/instance-provision.class.ts#L356)
