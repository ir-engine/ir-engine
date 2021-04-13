---
id: "user_magic_link_magic_link_class.magiclink"
title: "Class: Magiclink"
sidebar_label: "Magiclink"
custom_edit_url: null
hide_title: true
---

# Class: Magiclink

[user/magic-link/magic-link.class](../modules/user_magic_link_magic_link_class.md).Magiclink

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new Magiclink**(`options?`: ServiceOptions, `app`: Application): [*Magiclink*](user_magic_link_magic_link_class.magiclink.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`options` | ServiceOptions | {} |
`app` | Application | - |

**Returns:** [*Magiclink*](user_magic_link_magic_link_class.magiclink.md)

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:29](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L29)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L27)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:29](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L29)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:28](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L28)

## Methods

### create

▸ **create**(`data`: *any*, `params?`: Params): *Promise*<Data\>

A function which is used to create magic link

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`data` | *any* | used create magic link   |
`params?` | Params | contain user info   |

**Returns:** *Promise*<Data\>

creted data

Implementation of: ServiceMethods.create

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:213](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L213)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

A function which find magic link  and display it

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

{@Array} all magic link

Implementation of: ServiceMethods.find

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:43](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L43)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

A function which find specific magic link by id

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of specific magic link   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

{@Object} contains id of magic link and message

Implementation of: ServiceMethods.get

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:55](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L55)

___

### patch

▸ **patch**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

A function which is used to update magic link

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId |  |
`data` | Data | used to update   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

data

Implementation of: ServiceMethods.patch

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:82](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L82)

___

### remove

▸ **remove**(`id`: NullableId, `params?`: Params): *Promise*<Data\>

A function which is used to remove magic link

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId | of magic link used to remove data   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

id

Implementation of: ServiceMethods.remove

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:92](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L92)

___

### sendEmail

▸ **sendEmail**(`toEmail`: *string*, `token`: *string*, `type`: *connection* \| *login*, `identityProvider`: [*IdentityProvider*](user_identity_provider_identity_provider_class.identityprovider.md), `subscriptionId?`: *string*): *Promise*<void\>

A function used to sent an email

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`toEmail` | *string* | email of reciever   |
`token` | *string* | generated token   |
`type` | *connection* \| *login* | of login   |
`identityProvider` | [*IdentityProvider*](user_identity_provider_identity_provider_class.identityprovider.md) | - |
`subscriptionId?` | *string* | - |

**Returns:** *Promise*<void\>

{@function} sent email

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:106](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L106)

___

### sendSms

▸ **sendSms**(`mobile`: *string*, `token`: *string*, `type`: *connection* \| *login*): *Promise*<void\>

A function which used to send sms

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`mobile` | *string* | of receiver user   |
`token` | *string* | generated token   |
`type` | *connection* \| *login* | of login   |

**Returns:** *Promise*<void\>

{@function}  send sms

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:174](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L174)

___

### update

▸ **update**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

A function which is used to update magic link

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId |  |
`data` | Data | which will be used for updating magic link   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

updated data

Implementation of: ServiceMethods.update

Defined in: [packages/server-core/src/user/magic-link/magic-link.class.ts:70](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/server-core/src/user/magic-link/magic-link.class.ts#L70)
