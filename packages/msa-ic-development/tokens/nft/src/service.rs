use crate::ledger::Ledger;
use crate::types::*;
use crate::utils::*;

use ic_kit::macros::*;
use ic_kit::Context;

#[update]
fn transfer(transfer_request: TransferRequest) -> TransferResponse {
    assert_ne!(
        transfer_request.from, transfer_request.to,
        "transfer request from and to cannot be the same"
    );
    assert_eq!(transfer_request.amount, 1, "only amount 1 is supported");
    expect_caller_general(&transfer_request.from, transfer_request.subaccount);

    ledger().transfer(
        &transfer_request.from,
        &transfer_request.to,
        &transfer_request.token,
    );

    Ok(Nat::from(1))
}

#[update]
fn mintNFT(mint_request: MintRequest) -> TokenIdentifier {
    expect_caller(&token_level_metadata().owner.expect("token owner not set"));

    ledger().mintNFT(&mint_request)
}

#[query]
fn bearer(token_identifier: TokenIdentifier) -> AccountIdentifierReturn {
    ledger().bearer(&token_identifier)
}

#[query]
fn getAllMetadataForUser(user: User) -> Vec<TokenMetadata> {
    ledger().getAllMetadataForUser(&user)
}

#[query]
fn supply(token_identifier: TokenIdentifier) -> BalanceReturn {
    ledger().supply(&token_identifier)
}

#[query]
fn metadata(token_identifier: TokenIdentifier) -> MetadataReturn {
    ledger().metadata(&token_identifier)
}

#[update]
fn add(transfer_request: TransferRequest) -> TransactionId {
    unimplemented!();
}

#[query]
fn transactions(transactions_request: TransactionsRequest) -> TransactionsResult {
    unimplemented!();
}

fn storeDataInStableStore() {
    ic_kit::get_context()
        .stable_store((ledger().clone(), token_level_metadata().clone()))
        .expect("unable to store data in stable storage");
}

fn restoreDataFromStableStrore() {
    let (ledger_stable, token_level_metadata_stable) = ic_kit::get_context()
        .stable_restore::<(Ledger, TokenLevelMetadata)>()
        .expect("unable to restore NFTLedger from stable storage");
    *ledger() = ledger_stable;
    *token_level_metadata() = token_level_metadata_stable;
}

#[init]
fn init(owner: Principal, symbol: String, name: String, history: Principal) {
    *token_level_metadata() = TokenLevelMetadata::new(Some(owner), symbol, name, Some(history));
    storeDataInStableStore();
}

#[pre_upgrade]
fn preUpgrade() {
    ic_cdk::api::print(format!("Executing preupgrade"));
    storeDataInStableStore();
}

#[post_upgrade]
fn postUpgrade() {
    ic_cdk::api::print(format!("Executing postupgrade"));
    restoreDataFromStableStrore();
}
