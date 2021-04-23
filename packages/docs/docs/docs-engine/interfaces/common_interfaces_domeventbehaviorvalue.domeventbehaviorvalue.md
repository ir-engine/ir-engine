---
id: "common_interfaces_domeventbehaviorvalue.domeventbehaviorvalue"
title: "Interface: DomEventBehaviorValue"
sidebar_label: "DomEventBehaviorValue"
custom_edit_url: null
hide_title: true
---

# Interface: DomEventBehaviorValue

[common/interfaces/DomEventBehaviorValue](../modules/common_interfaces_domeventbehaviorvalue.md).DomEventBehaviorValue

Interface for DOM Event Behavior.

## Hierarchy

* [*BehaviorValue*](common_interfaces_behaviorvalue.behaviorvalue.md)

  ↳ **DomEventBehaviorValue**

## Properties

### args

• `Optional` **args**: *any*

Args of Behavior.

Inherited from: [BehaviorValue](common_interfaces_behaviorvalue.behaviorvalue.md).[args](common_interfaces_behaviorvalue.behaviorvalue.md#args)

Defined in: [packages/engine/src/common/interfaces/BehaviorValue.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/BehaviorValue.ts#L10)

___

### behavior

• **behavior**: [*Behavior*](../modules/common_interfaces_behavior.md#behavior)

Type of Behavior.

Inherited from: [BehaviorValue](common_interfaces_behaviorvalue.behaviorvalue.md).[behavior](common_interfaces_behaviorvalue.behaviorvalue.md#behavior)

Defined in: [packages/engine/src/common/interfaces/BehaviorValue.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/BehaviorValue.ts#L6)

___

### element

• `Optional` **element**: *viewport* \| *document* \| *window*

Container element in which behavior will be captured.

Defined in: [packages/engine/src/common/interfaces/DomEventBehaviorValue.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/DomEventBehaviorValue.ts#L12)

___

### networked

• `Optional` **networked**: *boolean*

Whether Behavior is Networked or not.

Inherited from: [BehaviorValue](common_interfaces_behaviorvalue.behaviorvalue.md).[networked](common_interfaces_behaviorvalue.behaviorvalue.md#networked)

Defined in: [packages/engine/src/common/interfaces/BehaviorValue.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/BehaviorValue.ts#L8)

___

### passive

• `Optional` **passive**: *boolean*

Is the Event listener passive.

Defined in: [packages/engine/src/common/interfaces/DomEventBehaviorValue.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/DomEventBehaviorValue.ts#L10)

___

### selector

• `Optional` **selector**: *string*

Selector string for the DOM element.

Defined in: [packages/engine/src/common/interfaces/DomEventBehaviorValue.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/interfaces/DomEventBehaviorValue.ts#L8)
