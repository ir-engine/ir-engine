---
id: "payments_subscription_confirm_subscription_confirm_class.subscriptionconfirm"
title: "Class: SubscriptionConfirm"
sidebar_label: "SubscriptionConfirm"
custom_edit_url: null
hide_title: true
---

# Class: SubscriptionConfirm

[payments/subscription-confirm/subscription-confirm.class](../modules/payments_subscription_confirm_subscription_confirm_class.md).SubscriptionConfirm

A class for Subcription Confirm  service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new SubscriptionConfirm**(`options?`: ServiceOptions, `app`: Application): [*SubscriptionConfirm*](payments_subscription_confirm_subscription_confirm_class.subscriptionconfirm.md)

#### Parameters:

| Name | Type | Default value |
| :------ | :------ | :------ |
| `options` | ServiceOptions | {} |
| `app` | Application | - |

**Returns:** [*SubscriptionConfirm*](payments_subscription_confirm_subscription_confirm_class.subscriptionconfirm.md)

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:19](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L19)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:17](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L17)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:19](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L19)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:18](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L18)

## Methods

### create

▸ **create**(`data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `data` | Data |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.create

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:78](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L78)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: ServiceMethods.find

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:26](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L26)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `id` | Id |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.get

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:30](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L30)

___

### patch

▸ **patch**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `id` | NullableId |
| `data` | Data |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.patch

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:90](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L90)

___

### remove

▸ **remove**(`id`: NullableId, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `id` | NullableId |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.remove

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:94](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L94)

___

### update

▸ **update**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `id` | NullableId |
| `data` | Data |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.update

Defined in: [packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts:86](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/server-core/src/payments/subscription-confirm/subscription-confirm.class.ts#L86)
