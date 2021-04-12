---
id: "user_accept_invite_accept_invite_class.acceptinvite"
title: "Class: AcceptInvite"
sidebar_label: "AcceptInvite"
custom_edit_url: null
hide_title: true
---

# Class: AcceptInvite

[user/accept-invite/accept-invite.class](../modules/user_accept_invite_accept_invite_class.md).AcceptInvite

accept invite class for get, create, update and remove user invite

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new AcceptInvite**(`options?`: ServiceOptions, `app`: Application): [*AcceptInvite*](user_accept_invite_accept_invite_class.acceptinvite.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | ServiceOptions |
`app` | Application |

**Returns:** [*AcceptInvite*](user_accept_invite_accept_invite_class.acceptinvite.md)

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L17)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L15)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L17)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L16)

## Methods

### create

▸ **create**(`data`: Data, `params?`: Params): *Promise*<Data\>

A function for creating invite

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`data` | Data | which will be used for creating new accept invite   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:284](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L284)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

A function which help to find all accept invite and display it

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`params?` | Params | number of limit and skip for pagination Number should be passed as query parmas   |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

{@Array} all listed invite

Implementation of: void

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L32)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

A funtion which display specific accept invite

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of specific accept invite   |
`params?` | Params | query which contain passcode   |

**Returns:** *Promise*<Data\>

{@Object} contains single invite

Implementation of: void

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L45)

___

### patch

▸ **patch**(`id`: Id, `data`: Data, `params?`: Params): *Promise*<Data\>

A function for updating accept invite

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of specific accept invite   |
`data` | Data | for updaing accept invite   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

Data

Implementation of: void

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:314](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L314)

___

### remove

▸ **remove**(`id`: Id, `params?`: Params): *Promise*<Data\>

A function for removing accept invite

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of specific accept invite   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

id

Implementation of: void

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:325](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L325)

___

### update

▸ **update**(`id`: Id, `data`: Data, `params?`: Params): *Promise*<Data\>

A function to update accept invite

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of specific accept invite   |
`data` | Data | for updating accept invite   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

Data

Implementation of: void

Defined in: [packages/server-core/src/user/accept-invite/accept-invite.class.ts:301](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/user/accept-invite/accept-invite.class.ts#L301)
