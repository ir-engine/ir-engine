---
id: "components_token"
title: "Module: components/Token"
sidebar_label: "components/Token"
custom_edit_url: null
hide_title: true
---

# Module: components/Token

## Type aliases

### TokenCompProps

Ƭ **TokenCompProps**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`isOnSale`? | *boolean* |
`token` | [*TokenProps*](components_token.md#tokenprops) |
`onBuy`? | (`\_\_namedParameters`: { `id`: *string* ; `price`: BigNumber  }) => *void* |
`onSale`? | (`\_\_namedParameters`: { `id`: *string* ; `onSale?`: *boolean* ; `price`: BigNumber  }) => *Promise*<boolean\> |
`onTransfer`? | (`\_\_namedParameters`: { `address`: *string* ; `id`: *string*  }) => *Promise*<boolean\> |

Defined in: [packages/nft/src/components/Token.tsx:16](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/nft/src/components/Token.tsx#L16)

___

### TokenProps

Ƭ **TokenProps**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`id` | *string* |
`name` | *string* |
`price` | BigNumber |
`uri` | *string* |

Defined in: [packages/nft/src/components/Token.tsx:9](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/nft/src/components/Token.tsx#L9)

## Functions

### default

▸ `Const`**default**(`__namedParameters`: [*TokenCompProps*](components_token.md#tokencompprops)): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | [*TokenCompProps*](components_token.md#tokencompprops) |

**Returns:** *Element*

Defined in: [packages/nft/src/components/Token.tsx:32](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/nft/src/components/Token.tsx#L32)
