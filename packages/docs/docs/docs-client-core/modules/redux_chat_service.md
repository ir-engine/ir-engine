---
id: "redux_chat_service"
title: "Module: redux/chat/service"
sidebar_label: "redux/chat/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/chat/service

## Functions

### createMessage

▸ **createMessage**(`values`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`values` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:92](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/service.ts#L92)

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

Defined in: [packages/client-core/redux/chat/service.ts:107](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/service.ts#L107)

___

### getChannels

▸ **getChannels**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:24](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/service.ts#L24)

___

### getInstanceChannel

▸ **getInstanceChannel**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:77](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/service.ts#L77)

___

### patchMessage

▸ **patchMessage**(`messageId`: *string*, `text`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`messageId` | *string* |
`text` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:139](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/service.ts#L139)

___

### removeMessage

▸ **removeMessage**(`messageId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`messageId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:128](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/service.ts#L128)

___

### updateChatTarget

▸ **updateChatTarget**(`targetObjectType`: *string*, `targetObject`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`targetObjectType` | *string* |
`targetObject` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:152](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/service.ts#L152)

___

### updateMessageScrollInit

▸ **updateMessageScrollInit**(`value`: *boolean*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/chat/service.ts:165](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/service.ts#L165)
