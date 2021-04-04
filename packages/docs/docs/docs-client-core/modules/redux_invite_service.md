---
id: "redux_invite_service"
title: "Module: redux/invite/service"
sidebar_label: "redux/invite/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/invite/service

## Functions

### acceptInvite

▸ **acceptInvite**(`inviteId`: *string*, `passcode`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`inviteId` | *string* |
`passcode` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/invite/service.ts:156](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/service.ts#L156)

___

### declineInvite

▸ **declineInvite**(`invite`: Invite): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`invite` | Invite |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/invite/service.ts:171](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/service.ts#L171)

___

### removeInvite

▸ **removeInvite**(`invite`: Invite): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`invite` | Invite |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/invite/service.ts:145](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/service.ts#L145)

___

### retrieveReceivedInvites

▸ **retrieveReceivedInvites**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/invite/service.ts:105](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/service.ts#L105)

___

### retrieveSentInvites

▸ **retrieveSentInvites**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/invite/service.ts:124](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/service.ts#L124)

___

### sendInvite

▸ **sendInvite**(`data`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/invite/service.ts:32](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/service.ts#L32)

___

### updateInviteTarget

▸ **updateInviteTarget**(`targetObjectType?`: *string*, `targetObjectId?`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`targetObjectType?` | *string* |
`targetObjectId?` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/invite/service.ts:181](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/service.ts#L181)
