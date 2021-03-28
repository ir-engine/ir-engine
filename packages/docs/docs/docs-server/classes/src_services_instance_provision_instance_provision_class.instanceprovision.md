---
id: "src_services_instance_provision_instance_provision_class.instanceprovision"
title: "Class: InstanceProvision"
sidebar_label: "InstanceProvision"
custom_edit_url: null
hide_title: true
---

# Class: InstanceProvision

[src/services/instance-provision/instance-provision.class](../modules/src_services_instance_provision_instance_provision_class.md).InstanceProvision

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new InstanceProvision**(`options?`: ServiceOptions, `app`: [*Application*](../modules/src_declarations.md#application)): [*InstanceProvision*](src_services_instance_provision_instance_provision_class.instanceprovision.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | ServiceOptions |
`app` | [*Application*](../modules/src_declarations.md#application) |

**Returns:** [*InstanceProvision*](src_services_instance_provision_instance_provision_class.instanceprovision.md)

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:28](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L28)

## Properties

### app

• **app**: [*Application*](../modules/src_declarations.md#application)

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:26](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L26)

___

### docs

• **docs**: *any*

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:28](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L28)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L27)

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

Implementation of: void

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:346](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L346)

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

Implementation of: void

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:134](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L134)

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

Implementation of: void

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:332](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L332)

___

### getFreeGameserver

▸ **getFreeGameserver**(): *Promise*<any\>

An method which start server for instance

**`author`** Vyacheslav Solovjov

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:38](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L38)

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

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:70](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L70)

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

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:99](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L99)

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

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:373](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L373)

___

### remove

▸ **remove**(`id`: Id, `params?`: Params): *Promise*<Data\>

A method used to remove specific instance

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of instance   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

id

Implementation of: void

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:385](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L385)

___

### update

▸ **update**(`id`: Id, `data`: Data, `params?`: Params): *Promise*<Data\>

A method used to update instance

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id |  |
`data` | Data | which is used to update instance   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

data of updated instance

Implementation of: void

Defined in: [packages/server/src/services/instance-provision/instance-provision.class.ts:362](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/instance-provision/instance-provision.class.ts#L362)
