use crate::utils::*;
use common::account_identifier::AccountIdentifierStruct;

use derive_new::*;
use ic_kit::candid::CandidType;
pub use ic_kit::candid::Nat;
pub use ic_kit::candid::Principal;
use ic_kit::Context;
use serde::Deserialize;

pub use std::convert::{From, Into};
pub use std::vec::Vec;

pub type Balance = Nat;
pub type Memo = Vec<u8>;
pub type SubAccount = Vec<u8>;
pub type TokenIdentifier = String;
pub type TokenIndex = u32;
pub type AccountIdentifier = String;
pub type Date = u64;
pub type TransactionId = Nat;

pub type AccountIdentifierReturn = Result<AccountIdentifier, CommonError>;
pub type BalanceReturn = Result<Balance, CommonError>;
pub type MetadataReturn = Result<Metadata, CommonError>;
pub type Blob = Vec<u8>;

#[derive(Clone, CandidType, Debug, Deserialize, Eq, Hash, PartialEq)]
pub enum User {
    address(AccountIdentifier),
    principal(Principal),
}

impl From<User> for AccountIdentifierStruct {
    fn from(user: User) -> Self {
        match user {
            User::principal(p) => p.into(),
            User::address(a) => {
                AccountIdentifierStruct::from_hex(&a).expect("unable to decode account identifier")
            }
        }
    }
}

impl From<User> for String {
    fn from(user: User) -> Self {
        match user {
            User::principal(p) => Into::<AccountIdentifierStruct>::into(p).to_hex(),
            User::address(a) => a,
        }
    }
}

impl From<AccountIdentifier> for User {
    fn from(account_identifier: AccountIdentifier) -> Self {
        User::address(account_identifier)
    }
}

pub fn into_token_index(token_identifier: &TokenIdentifier) -> TokenIndex {
    token_identifier
        .parse::<u32>()
        .expect("unable to convert token identifier to token index")
}

pub fn into_token_identifier(token_index: &TokenIndex) -> TokenIdentifier {
    token_index.to_string()
}

#[derive(CandidType, Deserialize)]
pub struct TransferRequest {
    pub amount: Balance,
    pub from: User,
    pub memo: Memo,
    pub notify: bool,
    pub subaccount: Option<SubAccount>,
    pub to: User,
    pub token: TokenIdentifier,
}

#[derive(Clone, CandidType, Deserialize)]
pub enum TransferError {
    CannotNotify(AccountIdentifier),
    InsufficientBalance,
    InvalidToken(TokenIdentifier),
    Other(String),
    Rejected,
    Unauthorized(AccountIdentifier),
}

pub type TransferResponse = Result<Balance, TransferError>;

#[derive(Clone, CandidType, Deserialize)]
pub struct MintRequest {
    pub metadata: Option<MetadataContainer>,
    pub to: User,
}

#[derive(Clone, CandidType, Deserialize)]
pub enum Metadata {
    fungible(FungibleMetadata),
    nonfungible(Option<MetadataContainer>),
}

#[derive(Clone, CandidType, Deserialize)]
pub struct FungibleMetadata {
    name: String,
    symbol: String,
    decimals: u8,
    metadata: Option<MetadataContainer>,
}

#[derive(Clone, CandidType, Deserialize, new)]
pub enum MetadataContainer {
    data(Vec<MetadataValue>),
    blob(Blob),
    json(String),
}

#[derive(Clone, CandidType, Deserialize)]
pub struct MetadataValue(String, Value);

#[derive(Clone, CandidType, Deserialize)]
pub enum Value {
    text(String),
    blob(Blob),
    nat(Nat),
    nat8(u8),
}

#[derive(Clone, CandidType, Debug, Deserialize)]
pub enum CommonError {
    InvalidToken(TokenIdentifier),
    Other(String),
}

#[derive(Clone, CandidType, Deserialize, new)]
pub struct TokenMetadata {
    pub account_identifier: AccountIdentifier,
    pub metadata: Metadata,
    pub token_identifier: TokenIdentifier,
}

#[derive(new, CandidType, Clone, Default, Deserialize)]
pub struct TokenLevelMetadata {
    pub owner: Option<Principal>,
    pub symbol: String,
    pub name: String,
    pub history: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct Transaction {
    pub txid: TransactionId,
    request: TransferRequest,
    date: Date,
}

#[derive(CandidType, Deserialize)]
pub enum TransactionRequestFilter {
    txid(TransactionId),
    user(User),
    date(Date, Date),
    page(Nat, Nat),
    all,
}

#[derive(CandidType, Deserialize)]
pub struct TransactionsRequest {
    query: TransactionRequestFilter,
    token: TokenIdentifier,
}

pub type TransactionsResult = Result<Vec<Transaction>, CommonError>;
