---
id: "redux_chat_actions"
title: "Module: redux/chat/actions"
sidebar_label: "redux/chat/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/chat/actions

## Table of contents

### Interfaces

- [ChatTargetSetAction](../interfaces/redux_chat_actions.chattargetsetaction.md)
- [CreatedChannelAction](../interfaces/redux_chat_actions.createdchannelaction.md)
- [CreatedMessageAction](../interfaces/redux_chat_actions.createdmessageaction.md)
- [LoadedChannelAction](../interfaces/redux_chat_actions.loadedchannelaction.md)
- [LoadedChannelsAction](../interfaces/redux_chat_actions.loadedchannelsaction.md)
- [LoadedMessagesAction](../interfaces/redux_chat_actions.loadedmessagesaction.md)
- [PatchedChannelAction](../interfaces/redux_chat_actions.patchedchannelaction.md)
- [PatchedMessageAction](../interfaces/redux_chat_actions.patchedmessageaction.md)
- [RemovedChannelAction](../interfaces/redux_chat_actions.removedchannelaction.md)
- [RemovedMessageAction](../interfaces/redux_chat_actions.removedmessageaction.md)
- [SetMessageScrollInitAction](../interfaces/redux_chat_actions.setmessagescrollinitaction.md)

## Type aliases

### ChatAction

Ƭ **ChatAction**: [*LoadedChannelsAction*](../interfaces/redux_chat_actions.loadedchannelsaction.md) \| [*LoadedChannelAction*](../interfaces/redux_chat_actions.loadedchannelaction.md) \| [*CreatedMessageAction*](../interfaces/redux_chat_actions.createdmessageaction.md) \| [*LoadedMessagesAction*](../interfaces/redux_chat_actions.loadedmessagesaction.md) \| [*PatchedMessageAction*](../interfaces/redux_chat_actions.patchedmessageaction.md) \| [*RemovedMessageAction*](../interfaces/redux_chat_actions.removedmessageaction.md) \| [*ChatTargetSetAction*](../interfaces/redux_chat_actions.chattargetsetaction.md) \| [*SetMessageScrollInitAction*](../interfaces/redux_chat_actions.setmessagescrollinitaction.md) \| [*CreatedChannelAction*](../interfaces/redux_chat_actions.createdchannelaction.md) \| [*PatchedChannelAction*](../interfaces/redux_chat_actions.patchedchannelaction.md) \| [*RemovedChannelAction*](../interfaces/redux_chat_actions.removedchannelaction.md)

Defined in: [packages/client-core/redux/chat/actions.ts:86](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L86)

## Functions

### createdChannel

▸ **createdChannel**(`channel`: Channel): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`channel` | Channel |

**Returns:** *object*

Name | Type |
:------ | :------ |
`channel` | Channel |
`type` | *string* |

Defined in: [packages/client-core/redux/chat/actions.ts:166](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L166)

___

### createdMessage

▸ **createdMessage**(`message`: Message, `selfUser`: User): [*ChatAction*](redux_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | Message |
`selfUser` | User |

**Returns:** [*ChatAction*](redux_chat_actions.md#chataction)

Defined in: [packages/client-core/redux/chat/actions.ts:117](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L117)

___

### loadedChannel

▸ **loadedChannel**(`channelResult`: Channel, `channelFetchedType`: *string*): [*ChatAction*](redux_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`channelResult` | Channel |
`channelFetchedType` | *string* |

**Returns:** [*ChatAction*](redux_chat_actions.md#chataction)

Defined in: [packages/client-core/redux/chat/actions.ts:99](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L99)

___

### loadedChannels

▸ **loadedChannels**(`channelResult`: ChannelResult): [*ChatAction*](redux_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`channelResult` | ChannelResult |

**Returns:** [*ChatAction*](redux_chat_actions.md#chataction)

Defined in: [packages/client-core/redux/chat/actions.ts:107](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L107)

___

### loadedMessages

▸ **loadedMessages**(`channelId`: *string*, `messageResult`: MessageResult): [*ChatAction*](redux_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`channelId` | *string* |
`messageResult` | MessageResult |

**Returns:** [*ChatAction*](redux_chat_actions.md#chataction)

Defined in: [packages/client-core/redux/chat/actions.ts:139](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L139)

___

### patchedChannel

▸ **patchedChannel**(`channel`: Channel): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`channel` | Channel |

**Returns:** *object*

Name | Type |
:------ | :------ |
`channel` | Channel |
`type` | *string* |

Defined in: [packages/client-core/redux/chat/actions.ts:173](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L173)

___

### patchedMessage

▸ **patchedMessage**(`message`: Message): [*ChatAction*](redux_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | Message |

**Returns:** [*ChatAction*](redux_chat_actions.md#chataction)

Defined in: [packages/client-core/redux/chat/actions.ts:125](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L125)

___

### removedChannel

▸ **removedChannel**(`channel`: Channel): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`channel` | Channel |

**Returns:** *object*

Name | Type |
:------ | :------ |
`channel` | Channel |
`type` | *string* |

Defined in: [packages/client-core/redux/chat/actions.ts:180](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L180)

___

### removedMessage

▸ **removedMessage**(`message`: Message): [*ChatAction*](redux_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | Message |

**Returns:** [*ChatAction*](redux_chat_actions.md#chataction)

Defined in: [packages/client-core/redux/chat/actions.ts:132](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L132)

___

### setChatTarget

▸ **setChatTarget**(`targetObjectType`: *string*, `targetObject`: *any*, `targetChannelId`: *string*): [*ChatAction*](redux_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`targetObjectType` | *string* |
`targetObject` | *any* |
`targetChannelId` | *string* |

**Returns:** [*ChatAction*](redux_chat_actions.md#chataction)

Defined in: [packages/client-core/redux/chat/actions.ts:150](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L150)

___

### setMessageScrollInit

▸ **setMessageScrollInit**(`value`: *boolean*): [*ChatAction*](redux_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** [*ChatAction*](redux_chat_actions.md#chataction)

Defined in: [packages/client-core/redux/chat/actions.ts:159](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/chat/actions.ts#L159)
