export default ({ IDL }) => {
  const SubAccount_3 = IDL.Vec(IDL.Nat8);
  const SubAccount_2 = SubAccount_3;
  const SubAccount = SubAccount_2;
  const TokenIndex_2 = IDL.Nat32;
  const TokenIndex = TokenIndex_2;
  const AccountIdentifier_2 = IDL.Text;
  const AccountIdentifier = AccountIdentifier_2;
  const AccountIdentifier_3 = AccountIdentifier;
  const Settlement = IDL.Record({
    'subaccount' : SubAccount,
    'seller' : IDL.Principal,
    'buyer' : AccountIdentifier_3,
    'price' : IDL.Nat64,
  });
  const TokenIdentifier_2 = IDL.Text;
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const BalanceRequest_2 = IDL.Record({
    'token' : TokenIdentifier_2,
    'user' : User,
  });
  const BalanceRequest = BalanceRequest_2;
  const Balance = IDL.Nat;
  const CommonError_2 = IDL.Variant({
    'InvalidToken' : TokenIdentifier_2,
    'Other' : IDL.Text,
  });
  const Result_9 = IDL.Variant({ 'ok' : Balance, 'err' : CommonError_2 });
  const BalanceResponse_2 = Result_9;
  const BalanceResponse = BalanceResponse_2;
  const TokenIdentifier = TokenIdentifier_2;
  const CommonError = CommonError_2;
  const Result_7 = IDL.Variant({
    'ok' : AccountIdentifier_3,
    'err' : CommonError,
  });
  const Time_2 = IDL.Int;
  const Time = Time_2;
  const Listing = IDL.Record({
    'locked' : IDL.Opt(Time),
    'seller' : IDL.Principal,
    'price' : IDL.Nat64,
  });
  const Result_8 = IDL.Variant({
    'ok' : IDL.Tuple(AccountIdentifier_3, IDL.Opt(Listing)),
    'err' : CommonError,
  });
  const Extension_2 = IDL.Text;
  const Extension = Extension_2;
  const Metadata_2 = IDL.Variant({
    'fungible' : IDL.Record({
      'decimals' : IDL.Nat8,
      'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'name' : IDL.Text,
      'symbol' : IDL.Text,
    }),
    'nonfungible' : IDL.Record({ 'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)) }),
  });
  const Metadata = Metadata_2;
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'status_code' : IDL.Nat16,
  });
  const ListRequest = IDL.Record({
    'token' : TokenIdentifier,
    'from_subaccount' : IDL.Opt(SubAccount),
    'price' : IDL.Opt(IDL.Nat64),
  });
  const Result_5 = IDL.Variant({ 'ok' : IDL.Null, 'err' : CommonError });
  const Result_6 = IDL.Variant({ 'ok' : Metadata, 'err' : CommonError });
  const Balance_2 = Balance;
  const Result_4 = IDL.Variant({ 'ok' : Balance_2, 'err' : CommonError });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Vec(TokenIndex),
    'err' : CommonError,
  });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(
      IDL.Tuple(TokenIndex, IDL.Opt(Listing), IDL.Opt(IDL.Vec(IDL.Nat8)))
    ),
    'err' : CommonError,
  });
  const Transaction = IDL.Record({
    'token' : TokenIdentifier,
    'time' : Time,
    'seller' : IDL.Principal,
    'buyer' : AccountIdentifier_3,
    'price' : IDL.Nat64,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const TransferRequest_2 = IDL.Record({
    'to' : User,
    'token' : TokenIdentifier_2,
    'notify' : IDL.Bool,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount_2),
    'amount' : Balance,
  });
  const TransferRequest = TransferRequest_2;
  const Result = IDL.Variant({
    'ok' : Balance,
    'err' : IDL.Variant({
      'CannotNotify' : AccountIdentifier,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier_2,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  const TransferResponse_2 = Result;
  const TransferResponse = TransferResponse_2;
  const nft_canister = IDL.Service({
    'acceptCycles' : IDL.Func([], [], []),
    'addRefund' : IDL.Func(
        [IDL.Text, IDL.Principal, SubAccount],
        [],
        ['oneway'],
      ),
    'availableCycles' : IDL.Func([], [IDL.Nat], ['query']),
    'backendRefundSettlement' : IDL.Func(
        [IDL.Text],
        [
          IDL.Vec(IDL.Tuple(TokenIndex, Settlement)),
          IDL.Vec(IDL.Tuple(AccountIdentifier_3, IDL.Principal, SubAccount)),
          IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(SubAccount))),
          IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(SubAccount))),
        ],
        ['query'],
      ),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'bearer' : IDL.Func([TokenIdentifier], [Result_7], ['query']),
    'details' : IDL.Func([TokenIdentifier], [Result_8], ['query']),
    'extensions' : IDL.Func([], [IDL.Vec(Extension)], ['query']),
    'getRegistry' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier_3))],
        ['query'],
      ),
    'getTokens' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, Metadata))],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'list' : IDL.Func([ListRequest], [Result_5], []),
    'listings' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, Listing, Metadata))],
        ['query'],
      ),
    'lock' : IDL.Func(
        [TokenIdentifier, IDL.Nat64, AccountIdentifier_3, SubAccount],
        [Result_7],
        [],
      ),
    'metadata' : IDL.Func([TokenIdentifier], [Result_6], ['query']),
    'mint' : IDL.Func([TokenIdentifier], [IDL.Bool], []),
    'payments' : IDL.Func([], [IDL.Opt(IDL.Vec(SubAccount))], ['query']),
    'refunds' : IDL.Func([], [IDL.Opt(IDL.Vec(SubAccount))], ['query']),
    'removePayments' : IDL.Func([IDL.Vec(SubAccount)], [], []),
    'removeRefunds' : IDL.Func([IDL.Vec(SubAccount)], [], []),
    'settle' : IDL.Func([TokenIdentifier], [Result_5], []),
    'settlements' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier_3, IDL.Nat64))],
        ['query'],
      ),
    'supply' : IDL.Func([TokenIdentifier], [Result_4], ['query']),
    'tokens' : IDL.Func([AccountIdentifier_3], [Result_3], ['query']),
    'tokens_ext' : IDL.Func([AccountIdentifier_3], [Result_2], ['query']),
    'transactions' : IDL.Func([], [IDL.Vec(Transaction)], ['query']),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'unwrap' : IDL.Func([TokenIdentifier, IDL.Opt(SubAccount)], [IDL.Bool], []),
    'wrap' : IDL.Func([TokenIdentifier], [IDL.Bool], []),
  });
  return nft_canister;
};
export const init = ({ IDL }) => { return []; };