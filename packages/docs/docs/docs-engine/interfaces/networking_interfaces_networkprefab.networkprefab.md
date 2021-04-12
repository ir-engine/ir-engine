---
id: "networking_interfaces_networkprefab.networkprefab"
title: "Interface: NetworkPrefab"
sidebar_label: "NetworkPrefab"
custom_edit_url: null
hide_title: true
---

# Interface: NetworkPrefab

[networking/interfaces/NetworkPrefab](../modules/networking_interfaces_networkprefab.md).NetworkPrefab

Interface for Network prefab.

## Hierarchy

* [*Prefab*](common_interfaces_prefab.prefab.md)

  ↳ **NetworkPrefab**

## Properties

### clientComponents

• **clientComponents**: NetworkComponentInterface[]

List of only client components.

Defined in: [packages/engine/src/networking/interfaces/NetworkPrefab.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/NetworkPrefab.ts#L19)

___

### localClientComponents

• `Optional` **localClientComponents**: { `data?`: *any* ; `type`: *any*  }[]

List of Components to be implemented on Entity.

Inherited from: [Prefab](common_interfaces_prefab.prefab.md).[localClientComponents](common_interfaces_prefab.prefab.md#localclientcomponents)

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L10)

___

### networkComponents

• **networkComponents**: NetworkComponentInterface[]

List of network components.

Defined in: [packages/engine/src/networking/interfaces/NetworkPrefab.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/NetworkPrefab.ts#L21)

___

### onAfterCreate

• `Optional` **onAfterCreate**: [*BehaviorValue*](common_interfaces_behaviorvalue.behaviorvalue.md)[]

Call after Creation of Entity from this Prefab.

Inherited from: [Prefab](common_interfaces_prefab.prefab.md).[onAfterCreate](common_interfaces_prefab.prefab.md#onaftercreate)

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L20)

___

### onAfterDestroy

• `Optional` **onAfterDestroy**: [*BehaviorValue*](common_interfaces_behaviorvalue.behaviorvalue.md)[]

Call after destruction of Entity created from this Prefab.

Inherited from: [Prefab](common_interfaces_prefab.prefab.md).[onAfterDestroy](common_interfaces_prefab.prefab.md#onafterdestroy)

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L24)

___

### onBeforeCreate

• `Optional` **onBeforeCreate**: [*BehaviorValue*](common_interfaces_behaviorvalue.behaviorvalue.md)[]

Call before Creation of Entity from this Prefab.

Inherited from: [Prefab](common_interfaces_prefab.prefab.md).[onBeforeCreate](common_interfaces_prefab.prefab.md#onbeforecreate)

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L18)

___

### onBeforeDestroy

• `Optional` **onBeforeDestroy**: [*BehaviorValue*](common_interfaces_behaviorvalue.behaviorvalue.md)[]

Call before destruction of Entity created from this Prefab.

Inherited from: [Prefab](common_interfaces_prefab.prefab.md).[onBeforeDestroy](common_interfaces_prefab.prefab.md#onbeforedestroy)

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L22)

___

### serverComponents

• **serverComponents**: NetworkComponentInterface[]

List of server components.

Defined in: [packages/engine/src/networking/interfaces/NetworkPrefab.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/NetworkPrefab.ts#L23)
