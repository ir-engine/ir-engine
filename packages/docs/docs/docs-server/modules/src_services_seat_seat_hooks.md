---
id: "src_services_seat_seat_hooks"
title: "Module: src/services/seat/seat.hooks"
sidebar_label: "src/services/seat/seat.hooks"
custom_edit_url: null
hide_title: true
---

# Module: src/services/seat/seat.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`after` | *object* |
`after.all` | *any*[] |
`after.create` | *any*[] |
`after.find` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
`after.get` | *any*[] |
`after.patch` | *any*[] |
`after.remove` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
`after.update` | *any*[] |
`before` | *object* |
`before.all` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
`before.create` | *any*[] |
`before.find` | *IffHook*[] |
`before.get` | *any*[] |
`before.patch` | *any*[] |
`before.remove` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
`before.update` | *any*[] |
`error` | *object* |
`error.all` | *any*[] |
`error.create` | *any*[] |
`error.find` | *any*[] |
`error.get` | *any*[] |
`error.patch` | *any*[] |
`error.remove` | *any*[] |
`error.update` | *any*[] |
