---
id: "user_sms_sms_class.sms"
title: "Class: Sms"
sidebar_label: "Sms"
custom_edit_url: null
hide_title: true
---

# Class: Sms

[user/sms/sms.class](../modules/user_sms_sms_class.md).Sms

A class for Sms service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new Sms**(`options?`: ServiceOptions, `app`: Application): [*Sms*](user_sms_sms_class.sms.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | ServiceOptions |
`app` | Application |

**Returns:** [*Sms*](user_sms_sms_class.sms.md)

Defined in: [packages/server-core/src/user/sms/sms.class.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L17)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/user/sms/sms.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L15)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/user/sms/sms.class.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L17)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/user/sms/sms.class.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L16)

## Methods

### create

▸ **create**(`data`: *any*, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server-core/src/user/sms/sms.class.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L34)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: void

Defined in: [packages/server-core/src/user/sms/sms.class.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L24)

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

Defined in: [packages/server-core/src/user/sms/sms.class.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L28)

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

Defined in: [packages/server-core/src/user/sms/sms.class.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L47)

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

Defined in: [packages/server-core/src/user/sms/sms.class.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L51)

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

Defined in: [packages/server-core/src/user/sms/sms.class.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/sms/sms.class.ts#L43)
