---
id: "src_social_reducers_chat_actions"
title: "Module: src/social/reducers/chat/actions"
sidebar_label: "src/social/reducers/chat/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/chat/actions

## Table of contents

### Interfaces

- [ChatTargetSetAction](../interfaces/src_social_reducers_chat_actions.chattargetsetaction.md)
- [CreatedChannelAction](../interfaces/src_social_reducers_chat_actions.createdchannelaction.md)
- [CreatedMessageAction](../interfaces/src_social_reducers_chat_actions.createdmessageaction.md)
- [LoadedChannelAction](../interfaces/src_social_reducers_chat_actions.loadedchannelaction.md)
- [LoadedChannelsAction](../interfaces/src_social_reducers_chat_actions.loadedchannelsaction.md)
- [LoadedMessagesAction](../interfaces/src_social_reducers_chat_actions.loadedmessagesaction.md)
- [PatchedChannelAction](../interfaces/src_social_reducers_chat_actions.patchedchannelaction.md)
- [PatchedMessageAction](../interfaces/src_social_reducers_chat_actions.patchedmessageaction.md)
- [RemovedChannelAction](../interfaces/src_social_reducers_chat_actions.removedchannelaction.md)
- [RemovedMessageAction](../interfaces/src_social_reducers_chat_actions.removedmessageaction.md)
- [SetMessageScrollInitAction](../interfaces/src_social_reducers_chat_actions.setmessagescrollinitaction.md)

## Type aliases

### ChatAction

Ƭ **ChatAction**: [*LoadedChannelsAction*](../interfaces/src_social_reducers_chat_actions.loadedchannelsaction.md) \| [*LoadedChannelAction*](../interfaces/src_social_reducers_chat_actions.loadedchannelaction.md) \| [*CreatedMessageAction*](../interfaces/src_social_reducers_chat_actions.createdmessageaction.md) \| [*LoadedMessagesAction*](../interfaces/src_social_reducers_chat_actions.loadedmessagesaction.md) \| [*PatchedMessageAction*](../interfaces/src_social_reducers_chat_actions.patchedmessageaction.md) \| [*RemovedMessageAction*](../interfaces/src_social_reducers_chat_actions.removedmessageaction.md) \| [*ChatTargetSetAction*](../interfaces/src_social_reducers_chat_actions.chattargetsetaction.md) \| [*SetMessageScrollInitAction*](../interfaces/src_social_reducers_chat_actions.setmessagescrollinitaction.md) \| [*CreatedChannelAction*](../interfaces/src_social_reducers_chat_actions.createdchannelaction.md) \| [*PatchedChannelAction*](../interfaces/src_social_reducers_chat_actions.patchedchannelaction.md) \| [*RemovedChannelAction*](../interfaces/src_social_reducers_chat_actions.removedchannelaction.md)

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:86](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L86)

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

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:166](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L166)

___

### createdMessage

▸ **createdMessage**(`message`: Message, `selfUser`: User): [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | Message |
`selfUser` | User |

**Returns:** [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:117](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L117)

___

### loadedChannel

▸ **loadedChannel**(`channelResult`: Channel, `channelFetchedType`: *string*): [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`channelResult` | Channel |
`channelFetchedType` | *string* |

**Returns:** [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:99](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L99)

___

### loadedChannels

▸ **loadedChannels**(`channelResult`: ChannelResult): [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`channelResult` | ChannelResult |

**Returns:** [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:107](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L107)

___

### loadedMessages

▸ **loadedMessages**(`channelId`: *string*, `messageResult`: MessageResult): [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`channelId` | *string* |
`messageResult` | MessageResult |

**Returns:** [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:139](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L139)

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

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:173](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L173)

___

### patchedMessage

▸ **patchedMessage**(`message`: Message): [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | Message |

**Returns:** [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:125](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L125)

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

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:180](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L180)

___

### removedMessage

▸ **removedMessage**(`message`: Message): [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | Message |

**Returns:** [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:132](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L132)

___

### setChatTarget

▸ **setChatTarget**(`targetObjectType`: *string*, `targetObject`: *any*, `targetChannelId`: *string*): [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`targetObjectType` | *string* |
`targetObject` | *any* |
`targetChannelId` | *string* |

**Returns:** [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:150](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L150)

___

### setMessageScrollInit

▸ **setMessageScrollInit**(`value`: *boolean*): [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** [*ChatAction*](src_social_reducers_chat_actions.md#chataction)

Defined in: [packages/client-core/src/social/reducers/chat/actions.ts:159](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/social/reducers/chat/actions.ts#L159)
