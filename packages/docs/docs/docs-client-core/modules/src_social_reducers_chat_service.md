---
id: "src_social_reducers_chat_service"
title: "Module: src/social/reducers/chat/service"
sidebar_label: "src/social/reducers/chat/service"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/chat/service

## Functions

### createMessage

▸ **createMessage**(`values`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`values` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/chat/service.ts:91](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/service.ts#L91)

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

Defined in: [packages/client-core/src/social/reducers/chat/service.ts:106](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/service.ts#L106)

___

### getChannels

▸ **getChannels**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/chat/service.ts:23](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/service.ts#L23)

___

### getInstanceChannel

▸ **getInstanceChannel**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/chat/service.ts:76](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/service.ts#L76)

___

### patchMessage

▸ **patchMessage**(`messageId`: *string*, `text`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`messageId` | *string* |
`text` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/chat/service.ts:138](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/service.ts#L138)

___

### removeMessage

▸ **removeMessage**(`messageId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`messageId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/chat/service.ts:127](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/service.ts#L127)

___

### updateChatTarget

▸ **updateChatTarget**(`targetObjectType`: *string*, `targetObject`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`targetObjectType` | *string* |
`targetObject` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/chat/service.ts:151](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/service.ts#L151)

___

### updateMessageScrollInit

▸ **updateMessageScrollInit**(`value`: *boolean*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/chat/service.ts:164](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/service.ts#L164)
