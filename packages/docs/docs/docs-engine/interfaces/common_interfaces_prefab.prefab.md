---
id: "common_interfaces_prefab.prefab"
title: "Interface: Prefab"
sidebar_label: "Prefab"
custom_edit_url: null
hide_title: true
---

# Interface: Prefab

[common/interfaces/Prefab](../modules/common_interfaces_prefab.md).Prefab

Interface for Prototype of Entity and Component collection to provide reusability.\
Prefab is a pattern for creating an entity and component collection as a prototype

## Hierarchy

* **Prefab**

  ↳ [*NetworkPrefab*](networking_interfaces_networkprefab.networkprefab.md)

## Properties

### localClientComponents

• `Optional` **localClientComponents**: { `data?`: *any* ; `type`: *any*  }[]

List of Components to be implemented on Entity.

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L10)

___

### onAfterCreate

• `Optional` **onAfterCreate**: [*BehaviorValue*](common_interfaces_behaviorvalue.behaviorvalue.md)[]

Call after Creation of Entity from this Prefab.

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L20)

___

### onAfterDestroy

• `Optional` **onAfterDestroy**: [*BehaviorValue*](common_interfaces_behaviorvalue.behaviorvalue.md)[]

Call after destruction of Entity created from this Prefab.

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L24)

___

### onBeforeCreate

• `Optional` **onBeforeCreate**: [*BehaviorValue*](common_interfaces_behaviorvalue.behaviorvalue.md)[]

Call before Creation of Entity from this Prefab.

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L18)

___

### onBeforeDestroy

• `Optional` **onBeforeDestroy**: [*BehaviorValue*](common_interfaces_behaviorvalue.behaviorvalue.md)[]

Call before destruction of Entity created from this Prefab.

Defined in: [packages/engine/src/common/interfaces/Prefab.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/Prefab.ts#L22)
