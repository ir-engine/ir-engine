---
id: "redux_service_common"
title: "Module: redux/service.common"
sidebar_label: "redux/service.common"
custom_edit_url: null
hide_title: true
---

# Module: redux/service.common

## Variables

### apiUrl

• `Const` **apiUrl**: *any*

Defined in: [packages/client-core/redux/service.common.ts:5](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/service.common.ts#L5)

## Functions

### ajaxGet

▸ **ajaxGet**(`url`: *string*, `noAuth`: *boolean*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *string* |
`noAuth` | *boolean* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/redux/service.common.ts:11](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/service.common.ts#L11)

___

### ajaxPost

▸ **ajaxPost**(`url`: *string*, `data`: *any*, `noAuth`: *boolean*, `image`: *boolean*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *string* |
`data` | *any* |
`noAuth` | *boolean* |
`image` | *boolean* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/redux/service.common.ts:22](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/service.common.ts#L22)

___

### axiosRequest

▸ **axiosRequest**(`method`: *any*, `url`: *any*, `data?`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`method` | *any* |
`url` | *any* |
`data?` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/redux/service.common.ts:48](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/service.common.ts#L48)

___

### getAuthHeader

▸ **getAuthHeader**(): *object*

**Returns:** *object*

Defined in: [packages/client-core/redux/service.common.ts:7](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/service.common.ts#L7)
