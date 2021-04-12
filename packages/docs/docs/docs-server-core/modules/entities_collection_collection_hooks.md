---
id: "entities_collection_collection_hooks"
title: "Module: entities/collection/collection.hooks"
sidebar_label: "entities/collection/collection.hooks"
custom_edit_url: null
hide_title: true
---

# Module: entities/collection/collection.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`after` | *object* |
`after.all` | *any*[] |
`after.create` | *any*[] |
`after.find` | *any*[] |
`after.get` | (`context`: *HookContext*<any, Service<any\>\>) => *HookContext*<any, Service<any\>\>[] |
`after.patch` | *any*[] |
`after.remove` | *any*[] |
`after.update` | *any*[] |
`before` | *object* |
`before.all` | *Hook*<any, Service<any\>\>[] |
`before.create` | *any*[] |
`before.find` | *any*[] |
`before.get` | *any*[] |
`before.patch` | *any*[] |
`before.remove` | *any*[] |
`before.update` | *any*[] |
`error` | *object* |
`error.all` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
`error.create` | *any*[] |
`error.find` | *any*[] |
`error.get` | *any*[] |
`error.patch` | *any*[] |
`error.remove` | *any*[] |
`error.update` | *any*[] |
