---
id: "client_core_redux_chat_service"
title: "Module: client-core/redux/chat/service"
sidebar_label: "client-core/redux/chat/service"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/chat/service

## Functions

### createMessage

▸ **createMessage**(`values`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`values` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:89](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/chat/service.ts#L89)

___

### getChannelMessages

▸ **getChannelMessages**(`channelId`: *string*, `skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`channelId` | *string* |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:104](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/chat/service.ts#L104)

___

### getChannels

▸ **getChannels**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:21](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/chat/service.ts#L21)

___

### getInstanceChannel

▸ **getInstanceChannel**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:74](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/chat/service.ts#L74)

___

### patchMessage

▸ **patchMessage**(`messageId`: *string*, `text`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`messageId` | *string* |
`text` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:136](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/chat/service.ts#L136)

___

### removeMessage

▸ **removeMessage**(`messageId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`messageId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:125](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/chat/service.ts#L125)

___

### updateChatTarget

▸ **updateChatTarget**(`targetObjectType`: *string*, `targetObject`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`targetObjectType` | *string* |
`targetObject` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:149](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/chat/service.ts#L149)

___

### updateMessageScrollInit

▸ **updateMessageScrollInit**(`value`: *boolean*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:162](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/chat/service.ts#L162)
