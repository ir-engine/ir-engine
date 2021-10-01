use crate::types::*;
use crate::utils::*;

use common::account_identifier::AccountIdentifierStruct;
use derive_new::*;
use ic_kit::candid::CandidType;
use ic_kit::ic::trap;
use ic_kit::Context;
use serde::Deserialize;

use std::collections::hash_map::Entry;
use std::collections::HashMap;
use std::convert::Into;
use std::default::Default;

#[derive(CandidType, Clone, Default, Deserialize)]
pub struct Ledger {
    tokens: HashMap<TokenIndex, TokenMetadata>,
    user_tokens: HashMap<User, Vec<TokenIndex>>,
}

impl Ledger {
    pub fn transfer(&mut self, from: &User, to: &User, token_identifier: &TokenIdentifier) {
        // changeing token owner in the tokens map
        let token_index = into_token_index(token_identifier);
        ledger()
            .tokens
            .get_mut(&token_index)
            .expect("unable to find token identifier in tokens")
            .account_identifier = to.clone().into();

        // remove the token from the previous owner's tokenlist
        let mut from_token_indexes = ledger()
            .user_tokens
            .get_mut(&from)
            .expect("unable to find previous owner");
        from_token_indexes.remove(
            from_token_indexes
                .iter()
                .position(|token_index_in_vec| &token_index == token_index_in_vec)
                .expect("unable to find token index in users_token"),
        );
        if (from_token_indexes.len() == 0) {
            ledger().user_tokens.remove(&from);
        }

        // add the token to the new owner's tokenlist
        ledger()
            .user_tokens
            .entry(to.clone())
            .or_default()
            .push(token_index);
    }

    pub fn mintNFT(&mut self, mint_request: &MintRequest) -> TokenIdentifier {
        let token_index = ledger().tokens.len() as TokenIndex;
        ledger().tokens.insert(
            token_index,
            TokenMetadata::new(
                mint_request.to.clone().into(),
                Metadata::nonfungible(mint_request.metadata.clone()),
                into_token_identifier(&token_index),
            ),
        );
        ledger()
            .user_tokens
            .entry(mint_request.to.clone().into())
            .or_default()
            .push(token_index);
        into_token_identifier(&token_index)
    }

    pub fn bearer(&self, token_identifier: &TokenIdentifier) -> AccountIdentifierReturn {
        AccountIdentifierReturn::Ok(
            ledger()
                .tokens
                .get(&into_token_index(&token_identifier))
                .expect("unable to locate token id")
                .account_identifier
                .clone(),
        )
    }

    pub fn getAllMetadataForUser(&self, user: &User) -> Vec<TokenMetadata> {
        ledger()
            .user_tokens
            .get(user)
            .unwrap_or(&vec![])
            .iter()
            .map(|token_index| {
                ledger()
                    .tokens
                    .get(token_index)
                    .expect("unable to find token index")
                    .clone()
            })
            .collect()
    }

    pub fn supply(&self, token_identifier: &TokenIdentifier) -> BalanceReturn {
        BalanceReturn::Ok(ledger().tokens.len().into())
    }

    pub fn metadata(&self, token_identifier: &TokenIdentifier) -> MetadataReturn {
        MetadataReturn::Ok(
            ledger()
                .tokens
                .get(&into_token_index(&token_identifier))
                .expect("unable to find token index")
                .metadata
                .clone(),
        )
    }

    #[cfg(test)]
    pub fn clear(&mut self) {
        self.tokens.clear();
        self.user_tokens.clear();
    }
}
