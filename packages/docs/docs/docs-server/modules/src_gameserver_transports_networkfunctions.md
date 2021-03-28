---
id: "src_gameserver_transports_networkfunctions"
title: "Module: src/gameserver/transports/NetworkFunctions"
sidebar_label: "src/gameserver/transports/NetworkFunctions"
custom_edit_url: null
hide_title: true
---

# Module: src/gameserver/transports/NetworkFunctions

## Functions

### cleanupOldGameservers

▸ **cleanupOldGameservers**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:61](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L61)

___

### getFreeSubdomain

▸ **getFreeSubdomain**(`gsIdentifier`: *string*, `subdomainNumber`: *number*): *Promise*<string\>

#### Parameters:

Name | Type |
:------ | :------ |
`gsIdentifier` | *string* |
`subdomainNumber` | *number* |

**Returns:** *Promise*<string\>

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:15](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L15)

___

### getUserIdFromSocketId

▸ **getUserIdFromSocketId**(`socketId`: *any*): *string* \| *null*

#### Parameters:

Name | Type |
:------ | :------ |
`socketId` | *any* |

**Returns:** *string* \| *null*

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:93](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L93)

___

### handleConnectToWorld

▸ **handleConnectToWorld**(`socket`: *any*, `data`: *any*, `callback`: *any*, `userId`: *any*, `user`: *any*, `avatarDetail`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |
`userId` | *any* |
`user` | *any* |
`avatarDetail` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:179](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L179)

___

### handleDisconnect

▸ **handleDisconnect**(`socket`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:353](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L353)

___

### handleHeartbeat

▸ **handleHeartbeat**(`socket`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:346](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L346)

___

### handleIncomingMessage

▸ **handleIncomingMessage**(`socket`: *any*, `message`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`message` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:342](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L342)

___

### handleJoinWorld

▸ **handleJoinWorld**(`socket`: *any*, `data`: *any*, `callback`: *any*, `userId`: *any*, `user`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |
`userId` | *any* |
`user` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:267](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L267)

___

### handleLeaveWorld

▸ **handleLeaveWorld**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:397](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L397)

___

### validateNetworkObjects

▸ **validateNetworkObjects**(): *void*

**Returns:** *void*

Defined in: [packages/server/src/gameserver/transports/NetworkFunctions.ts:106](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/NetworkFunctions.ts#L106)
