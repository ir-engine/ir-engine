use crate::ledger::Ledger;
use crate::types::*;

use common::account_identifier::{AccountIdentifierStruct, Subaccount};
use common::principal_id::PrincipalId;

pub use ic_kit::candid::Principal;
use ic_kit::ic::trap;

use std::convert::TryInto;

pub fn caller() -> Principal {
    ic_kit::ic::caller()
}

pub fn ledger<'a>() -> &'a mut Ledger {
    ic_kit::ic::get_mut::<Ledger>()
}

pub fn token_level_metadata<'a>() -> &'a mut TokenLevelMetadata {
    ic_kit::ic::get_mut::<TokenLevelMetadata>()
}

pub fn expect_caller(input_principal: &Principal) {
    if (&caller() != input_principal) {
        trap("input_principal is different from caller");
    }
}

pub fn expect_caller_general(user: &User, subaccount: Option<SubAccount>) {
    match user {
        User::address(from_address) => {
            if (&AccountIdentifierStruct::new(
                PrincipalId(caller()),
                Some(Subaccount(
                    subaccount
                        .expect("SubAccount is missing")
                        .try_into()
                        .expect("unable to convert SubAccount to 32 bytes array"),
                )),
            )
            .to_hex()
                != from_address)
            {
                trap("input account identifier is different from caller")
            }
        }
        User::principal(principal) => expect_caller(principal),
    }
}
