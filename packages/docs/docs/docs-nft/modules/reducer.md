---
id: "reducer"
title: "Module: reducer"
sidebar_label: "reducer"
custom_edit_url: null
hide_title: true
---

# Module: reducer

## Table of contents

### Enumerations

- [ActionType](../enums/reducer.actiontype.md)

## Type aliases

### Action

Ƭ **Action**: { `payload`: *string* ; `type`: [*ETH\_PRICE*](../enums/reducer.actiontype.md#eth_price)  } \| { `payload`: [*ContractProps*](types.md#contractprops) ; `type`: [*CONTRACT*](../enums/reducer.actiontype.md#contract)  } \| { `payload`: [*UserProps*](types.md#userprops) ; `type`: [*UPDATE\_USER*](../enums/reducer.actiontype.md#update_user)  } \| { `payload?`: *any* ; `type`: [*SIGN\_OUT*](../enums/reducer.actiontype.md#sign_out)  } \| { `payload?`: [*TokenProps*](components_token.md#tokenprops)[] ; `type`: [*LOAD\_TOKEN\_SALE*](../enums/reducer.actiontype.md#load_token_sale)  }

Defined in: [packages/nft/src/reducer.ts:13](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/nft/src/reducer.ts#L13)

## Functions

### reducer

▸ `Const`**reducer**(`state`: [*StateContext*](../interfaces/state.statecontext.md), `action`: [*Action*](reducer.md#action)): { `contract?`: [*ContractProps*](types.md#contractprops) ; `ethPrice`: *string* ; `isAuthenticated`: *boolean* ; `tokensOnSale?`: [*TokenProps*](components_token.md#tokenprops)[] ; `user?`: [*UserProps*](types.md#userprops)  } \| { `contract?`: [*ContractProps*](types.md#contractprops) ; `ethPrice?`: *string* ; `isAuthenticated`: *boolean* = true; `tokensOnSale?`: [*TokenProps*](components_token.md#tokenprops)[] ; `user`: [*UserProps*](types.md#userprops)  } \| { `contract?`: [*ContractProps*](types.md#contractprops) ; `ethPrice?`: *string* ; `isAuthenticated`: *boolean* ; `tokensOnSale`: [*TokenProps*](components_token.md#tokenprops)[] ; `user?`: [*UserProps*](types.md#userprops)  } \| { `contract`: [*ContractProps*](types.md#contractprops) ; `ethPrice?`: *string* ; `isAuthenticated`: *boolean* ; `tokensOnSale?`: [*TokenProps*](components_token.md#tokenprops)[] ; `user?`: [*UserProps*](types.md#userprops)  }

#### Parameters:

Name | Type |
:------ | :------ |
`state` | [*StateContext*](../interfaces/state.statecontext.md) |
`action` | [*Action*](reducer.md#action) |

**Returns:** { `contract?`: [*ContractProps*](types.md#contractprops) ; `ethPrice`: *string* ; `isAuthenticated`: *boolean* ; `tokensOnSale?`: [*TokenProps*](components_token.md#tokenprops)[] ; `user?`: [*UserProps*](types.md#userprops)  } \| { `contract?`: [*ContractProps*](types.md#contractprops) ; `ethPrice?`: *string* ; `isAuthenticated`: *boolean* = true; `tokensOnSale?`: [*TokenProps*](components_token.md#tokenprops)[] ; `user`: [*UserProps*](types.md#userprops)  } \| { `contract?`: [*ContractProps*](types.md#contractprops) ; `ethPrice?`: *string* ; `isAuthenticated`: *boolean* ; `tokensOnSale`: [*TokenProps*](components_token.md#tokenprops)[] ; `user?`: [*UserProps*](types.md#userprops)  } \| { `contract`: [*ContractProps*](types.md#contractprops) ; `ethPrice?`: *string* ; `isAuthenticated`: *boolean* ; `tokensOnSale?`: [*TokenProps*](components_token.md#tokenprops)[] ; `user?`: [*UserProps*](types.md#userprops)  }

Defined in: [packages/nft/src/reducer.ts:20](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/nft/src/reducer.ts#L20)
