---
id: "redux_admin_reducers"
title: "Module: redux/admin/reducers"
sidebar_label: "redux/admin/reducers"
custom_edit_url: null
hide_title: true
---

# Module: redux/admin/reducers

## Variables

### PAGE\_LIMIT

• `Const` **PAGE\_LIMIT**: *100*= 100

Defined in: [packages/client-core/redux/admin/reducers.ts:31](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/reducers.ts#L31)

___

### initialState

• `Const` **initialState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`authUser` | *object* |
`authUser.accessToken` | *string* |
`authUser.authentication` | *object* |
`authUser.authentication.strategy` | *string* |
`authUser.identityProvider` | IdentityProvider |
`error` | *string* |
`identityProvider` | IdentityProvider |
`instances` | *object* |
`instances.fetched` | *boolean* |
`instances.instances` | *any*[] |
`instances.lastFetched` | Date |
`instances.limit` | *number* |
`instances.retrieving` | *boolean* |
`instances.skip` | *number* |
`instances.total` | *number* |
`instances.updateNeeded` | *boolean* |
`isLoggedIn` | *boolean* |
`isProcessing` | *boolean* |
`locationTypes` | *object* |
`locationTypes.locationTypes` | *any*[] |
`locationTypes.updateNeeded` | *boolean* |
`locations` | *object* |
`locations.fetched` | *boolean* |
`locations.lastFetched` | Date |
`locations.limit` | *number* |
`locations.locations` | *any*[] |
`locations.retrieving` | *boolean* |
`locations.skip` | *number* |
`locations.total` | *number* |
`locations.updateNeeded` | *boolean* |
`scenes` | *object* |
`scenes.fetched` | *boolean* |
`scenes.lastFetched` | Date |
`scenes.limit` | *number* |
`scenes.retrieving` | *boolean* |
`scenes.scenes` | *any*[] |
`scenes.skip` | *number* |
`scenes.total` | *number* |
`scenes.updateNeeded` | *boolean* |
`user` | *object* |
`user.id` | *string* |
`user.identityProviders` | *any*[] |
`user.name` | *string* |
`users` | *object* |
`users.fetched` | *boolean* |
`users.lastFetched` | Date |
`users.limit` | *number* |
`users.retrieving` | *boolean* |
`users.skip` | *number* |
`users.total` | *number* |
`users.updateNeeded` | *boolean* |
`users.users` | *any*[] |

Defined in: [packages/client-core/redux/admin/reducers.ts:33](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/reducers.ts#L33)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/redux/admin/reducers.ts:88](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/reducers.ts#L88)
