---
id: "world_project_project_hooks"
title: "Module: world/project/project.hooks"
sidebar_label: "world/project/project.hooks"
custom_edit_url: null
hide_title: true
---

# Module: world/project/project.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `after` | *object* |
| `after.all` | *any*[] |
| `after.create` | (`context`: *HookContext*<any, Service<any\>\>) => *HookContext*<any, Service<any\>\>[] |
| `after.find` | *any*[] |
| `after.get` | *any*[] |
| `after.patch` | *any*[] |
| `after.remove` | *any*[] |
| `after.update` | *any*[] |
| `before` | *object* |
| `before.all` | *Hook*<any, Service<any\>\>[] |
| `before.create` | (`context`: *HookContext*<any, Service<any\>\>) => *any*[] |
| `before.find` | *any*[] |
| `before.get` | *any*[] |
| `before.patch` | (`context`: *HookContext*<any, Service<any\>\>) => *any*[] |
| `before.remove` | (`context`: *HookContext*<any, Service<any\>\>) => *any*[] |
| `before.update` | *Hook*<any, Service<any\>\>[] |
| `error` | *object* |
| `error.all` | *any*[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
