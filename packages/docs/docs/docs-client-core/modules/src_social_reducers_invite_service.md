---
id: "src_social_reducers_invite_service"
title: "Module: src/social/reducers/invite/service"
sidebar_label: "src/social/reducers/invite/service"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/invite/service

## Functions

### acceptInvite

▸ **acceptInvite**(`inviteId`: *string*, `passcode`: *string*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `inviteId` | *string* |
| `passcode` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/invite/service.ts:153](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/social/reducers/invite/service.ts#L153)

___

### declineInvite

▸ **declineInvite**(`invite`: Invite): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `invite` | Invite |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/invite/service.ts:168](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/social/reducers/invite/service.ts#L168)

___

### removeInvite

▸ **removeInvite**(`invite`: Invite): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `invite` | Invite |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/invite/service.ts:142](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/social/reducers/invite/service.ts#L142)

___

### retrieveReceivedInvites

▸ **retrieveReceivedInvites**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `skip?` | *number* |
| `limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/invite/service.ts:102](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/social/reducers/invite/service.ts#L102)

___

### retrieveSentInvites

▸ **retrieveSentInvites**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `skip?` | *number* |
| `limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/invite/service.ts:121](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/social/reducers/invite/service.ts#L121)

___

### sendInvite

▸ **sendInvite**(`data`: *any*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `data` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/src/social/reducers/invite/service.ts:29](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/social/reducers/invite/service.ts#L29)

___

### updateInviteTarget

▸ **updateInviteTarget**(`targetObjectType?`: *string*, `targetObjectId?`: *string*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `targetObjectType?` | *string* |
| `targetObjectId?` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/invite/service.ts:178](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/social/reducers/invite/service.ts#L178)
