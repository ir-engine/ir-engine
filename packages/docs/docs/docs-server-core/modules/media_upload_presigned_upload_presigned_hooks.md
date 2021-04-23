---
id: "media_upload_presigned_upload_presigned_hooks"
title: "Module: media/upload-presigned/upload-presigned.hooks"
sidebar_label: "media/upload-presigned/upload-presigned.hooks"
custom_edit_url: null
hide_title: true
---

# Module: media/upload-presigned/upload-presigned.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `after` | *object* |
| `after.all` | *any*[] |
| `after.create` | *Hook*<any, Service<any\>\>[] |
| `after.find` | *any*[] |
| `after.get` | *any*[] |
| `after.patch` | *any*[] |
| `after.remove` | *any*[] |
| `after.update` | *any*[] |
| `before` | *object* |
| `before.all` | *any*[] |
| `before.create` | *Hook*<any, Service<any\>\>[] |
| `before.find` | *Hook*<any, Service<any\>\>[] |
| `before.get` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.patch` | *Hook*<any, Service<any\>\>[] |
| `before.remove` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.update` | *Hook*<any, Service<any\>\>[] |
| `error` | *object* |
| `error.all` | *any*[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
