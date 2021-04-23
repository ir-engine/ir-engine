---
id: "world_project_asset_project_asset_hooks"
title: "Module: world/project-asset/project-asset.hooks"
sidebar_label: "world/project-asset/project-asset.hooks"
custom_edit_url: null
hide_title: true
---

# Module: world/project-asset/project-asset.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `after` | *object* |
| `after.all` | *any*[] |
| `after.create` | *any*[] |
| `after.find` | *any*[] |
| `after.get` | *any*[] |
| `after.patch` | *any*[] |
| `after.remove` | *any*[] |
| `after.update` | *any*[] |
| `before` | *object* |
| `before.all` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.create` | *any*[] |
| `before.find` | *any*[] |
| `before.get` | *any*[] |
| `before.patch` | *any*[] |
| `before.remove` | *any*[] |
| `before.update` | *any*[] |
| `error` | *object* |
| `error.all` | *any*[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
