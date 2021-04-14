---
id: "networkfunctions"
title: "Module: NetworkFunctions"
sidebar_label: "NetworkFunctions"
custom_edit_url: null
hide_title: true
---

# Module: NetworkFunctions

## Functions

### cleanupOldGameservers

▸ **cleanupOldGameservers**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: [NetworkFunctions.ts:63](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L63)

___

### getFreeSubdomain

▸ **getFreeSubdomain**(`gsIdentifier`: *string*, `subdomainNumber`: *number*): *Promise*<string\>

#### Parameters:

Name | Type |
:------ | :------ |
`gsIdentifier` | *string* |
`subdomainNumber` | *number* |

**Returns:** *Promise*<string\>

Defined in: [NetworkFunctions.ts:17](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L17)

___

### getUserIdFromSocketId

▸ **getUserIdFromSocketId**(`socketId`: *any*): *string* \| *null*

#### Parameters:

Name | Type |
:------ | :------ |
`socketId` | *any* |

**Returns:** *string* \| *null*

Defined in: [NetworkFunctions.ts:95](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L95)

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

Defined in: [NetworkFunctions.ts:181](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L181)

___

### handleDisconnect

▸ **handleDisconnect**(`socket`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |

**Returns:** *Promise*<any\>

Defined in: [NetworkFunctions.ts:361](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L361)

___

### handleHeartbeat

▸ **handleHeartbeat**(`socket`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |

**Returns:** *Promise*<any\>

Defined in: [NetworkFunctions.ts:354](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L354)

___

### handleIncomingMessage

▸ **handleIncomingMessage**(`socket`: *any*, `message`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`message` | *any* |

**Returns:** *Promise*<any\>

Defined in: [NetworkFunctions.ts:350](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L350)

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

Defined in: [NetworkFunctions.ts:273](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L273)

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

Defined in: [NetworkFunctions.ts:405](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L405)

___

### validateNetworkObjects

▸ **validateNetworkObjects**(): *void*

**Returns:** *void*

Defined in: [NetworkFunctions.ts:108](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/gameserver/src/NetworkFunctions.ts#L108)
