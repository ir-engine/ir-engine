---
id: "src_admin_reducers_admin_reducers"
title: "Module: src/admin/reducers/admin/reducers"
sidebar_label: "src/admin/reducers/admin/reducers"
custom_edit_url: null
hide_title: true
---

# Module: src/admin/reducers/admin/reducers

## Variables

### PAGE\_LIMIT

• `Const` **PAGE\_LIMIT**: ``100``= 100

Defined in: [packages/client-core/src/admin/reducers/admin/reducers.ts:34](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/admin/reducers/admin/reducers.ts#L34)

___

### initialAdminState

• `Const` **initialAdminState**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `authUser` | *object* |
| `authUser.accessToken` | *string* |
| `authUser.authentication` | *object* |
| `authUser.authentication.strategy` | *string* |
| `authUser.identityProvider` | IdentityProvider |
| `error` | *string* |
| `identityProvider` | IdentityProvider |
| `instances` | *object* |
| `instances.fetched` | *boolean* |
| `instances.instances` | *any*[] |
| `instances.lastFetched` | Date |
| `instances.limit` | *number* |
| `instances.retrieving` | *boolean* |
| `instances.skip` | *number* |
| `instances.total` | *number* |
| `instances.updateNeeded` | *boolean* |
| `isLoggedIn` | *boolean* |
| `isProcessing` | *boolean* |
| `locationTypes` | *object* |
| `locationTypes.locationTypes` | *any*[] |
| `locationTypes.updateNeeded` | *boolean* |
| `locations` | *object* |
| `locations.fetched` | *boolean* |
| `locations.lastFetched` | Date |
| `locations.limit` | *number* |
| `locations.locations` | *any*[] |
| `locations.retrieving` | *boolean* |
| `locations.skip` | *number* |
| `locations.total` | *number* |
| `locations.updateNeeded` | *boolean* |
| `scenes` | *object* |
| `scenes.fetched` | *boolean* |
| `scenes.lastFetched` | Date |
| `scenes.limit` | *number* |
| `scenes.retrieving` | *boolean* |
| `scenes.scenes` | *any*[] |
| `scenes.skip` | *number* |
| `scenes.total` | *number* |
| `scenes.updateNeeded` | *boolean* |
| `user` | *object* |
| `user.id` | *string* |
| `user.identityProviders` | *any*[] |
| `user.name` | *string* |
| `users` | *object* |
| `users.fetched` | *boolean* |
| `users.lastFetched` | Date |
| `users.limit` | *number* |
| `users.retrieving` | *boolean* |
| `users.skip` | *number* |
| `users.total` | *number* |
| `users.updateNeeded` | *boolean* |
| `users.users` | *any*[] |

Defined in: [packages/client-core/src/admin/reducers/admin/reducers.ts:36](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/admin/reducers/admin/reducers.ts#L36)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: *any*): *any*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `state` | *any* |
| `action` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/src/admin/reducers/admin/reducers.ts:91](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/admin/reducers/admin/reducers.ts#L91)
