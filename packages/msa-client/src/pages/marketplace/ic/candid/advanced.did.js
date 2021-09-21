export default ({ IDL }) => {
  const OrderId = IDL.Nat32;
  const Balance = IDL.Nat;
  const Balance_2 = Balance;
  const TokenIdentifier = IDL.Text;
  const TokenIdentifier_2 = TokenIdentifier;
  const Rate = IDL.Tuple(IDL.Nat, IDL.Nat);
  const AccountIdentifier_2 = IDL.Text;
  const AccountIdentifier = AccountIdentifier_2;
  const AccountIdentifier_3 = AccountIdentifier;
  const Order = IDL.Record({
    'isGiveBase' : IDL.Bool,
    'trade' : Balance_2,
    'base' : TokenIdentifier_2,
    'rate' : Rate,
    'user' : AccountIdentifier_3,
    'quote' : TokenIdentifier_2,
    'filled' : Balance_2,
    'amount' : Balance_2,
  });
  const CurrencyPair = IDL.Text;
  const TokenIndex_2 = IDL.Nat32;
  const TokenIndex = TokenIndex_2;
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
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const BalanceRequest_2 = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User,
  });
  const BalanceRequest = BalanceRequest_2;
  const CommonError_2 = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const Result_11 = IDL.Variant({ 'ok' : Balance, 'err' : CommonError_2 });
  const BalanceResponse_2 = Result_11;
  const BalanceResponse = BalanceResponse_2;
  const SubAccount_2 = IDL.Vec(IDL.Nat8);
  const SubAccount = SubAccount_2;
  const SubAccount_3 = SubAccount;
  const CancelOrderRequest = IDL.Record({
    'subaccount' : IDL.Opt(SubAccount_3),
    'orderId' : OrderId,
  });
  const Result_10 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const CancelOrderResponse = Result_10;
  const Extension_2 = IDL.Text;
  const Extension = Extension_2;
  const LimitOrderRequest = IDL.Record({
    'subaccount' : IDL.Opt(SubAccount_3),
    'getAmount' : Balance_2,
    'getToken' : TokenIdentifier_2,
    'giveToken' : TokenIdentifier_2,
    'giveAmount' : Balance_2,
  });
  const Result_9 = IDL.Variant({
    'ok' : IDL.Tuple(IDL.Opt(OrderId), Balance_2, Balance_2),
    'err' : IDL.Variant({
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier_2,
      'Other' : IDL.Text,
    }),
  });
  const LimitOrderResponse = Result_9;
  const MarketOrderRequest = IDL.Record({
    'subaccount' : IDL.Opt(SubAccount_3),
    'getToken' : TokenIdentifier_2,
    'giveToken' : TokenIdentifier_2,
    'giveAmount' : Balance_2,
  });
  const Result_8 = IDL.Variant({
    'ok' : IDL.Tuple(Balance_2, Balance_2),
    'err' : IDL.Variant({
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier_2,
      'Other' : IDL.Text,
    }),
  });
  const MarketOrderResponse = Result_8;
  const CommonError = CommonError_2;
  const Result_7 = IDL.Variant({ 'ok' : Metadata, 'err' : CommonError });
  const Result_6 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : CommonError });
  const RegisterTokenRequest = IDL.Record({
    'owner' : AccountIdentifier_3,
    'metadata' : Metadata,
    'supply' : Balance_2,
  });
  const Result_5 = IDL.Variant({ 'ok' : TokenIndex, 'err' : IDL.Text });
  const Result_4 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(AccountIdentifier_3, Balance_2)),
    'err' : CommonError,
  });
  const Result_3 = IDL.Variant({ 'ok' : Balance_2, 'err' : CommonError });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(TokenIndex),
    'err' : CommonError,
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const TransferRequest_2 = IDL.Record({
    'to' : User,
    'token' : TokenIdentifier,
    'notify' : IDL.Bool,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferRequest = TransferRequest_2;
  const Result = IDL.Variant({
    'ok' : Balance,
    'err' : IDL.Variant({
      'CannotNotify' : AccountIdentifier,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  const TransferResponse_2 = Result;
  const TransferResponse = TransferResponse_2;
  const advanced_token = IDL.Service({
    'DEXDebugData' : IDL.Func(
        [],
        [
          IDL.Vec(IDL.Tuple(OrderId, Order)),
          IDL.Vec(
            IDL.Tuple(
              CurrencyPair,
              IDL.Tuple(IDL.Vec(OrderId), IDL.Vec(OrderId)),
            )
          ),
          IDL.Vec(IDL.Tuple(TokenIdentifier_2, Balance_2)),
        ],
        ['query'],
      ),
    'acceptCycles' : IDL.Func([], [], []),
    'allMetadata' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, IDL.Tuple(Metadata, Balance_2)))],
        ['query'],
      ),
    'allRegistry' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              TokenIndex,
              IDL.Vec(IDL.Tuple(AccountIdentifier_3, Balance_2)),
            )
          ),
        ],
        ['query'],
      ),
    'availableCycles' : IDL.Func([], [IDL.Nat], ['query']),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'cancelOrder' : IDL.Func([CancelOrderRequest], [CancelOrderResponse], []),
    'changeAdmin' : IDL.Func([IDL.Principal], [], []),
    'clearDEX' : IDL.Func([], [], []),
    'extensions' : IDL.Func([], [IDL.Vec(Extension)], ['query']),
    'getOrderBook' : IDL.Func(
        [TokenIdentifier_2, TokenIdentifier_2],
        [
          IDL.Opt(
            IDL.Tuple(
              IDL.Vec(TokenIdentifier_2),
              CurrencyPair,
              IDL.Vec(Order),
              IDL.Vec(Order),
              IDL.Opt(Rate),
            )
          ),
        ],
        ['query'],
      ),
    'limitOrder' : IDL.Func([LimitOrderRequest], [LimitOrderResponse], []),
    'marketOrder' : IDL.Func([MarketOrderRequest], [MarketOrderResponse], []),
    'metadata' : IDL.Func([TokenIdentifier_2], [Result_7], ['query']),
    'numberOfTokenHolders' : IDL.Func(
        [TokenIdentifier_2],
        [Result_6],
        ['query'],
      ),
    'numberOfTokens' : IDL.Func([], [IDL.Nat], ['query']),
    'registerToken' : IDL.Func([RegisterTokenRequest], [Result_5], []),
    'registry' : IDL.Func([TokenIdentifier_2], [Result_4], ['query']),
    'supply' : IDL.Func([TokenIdentifier_2], [Result_3], ['query']),
    'tokenRegistry' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, Metadata, Balance_2, IDL.Nat))],
        ['query'],
      ),
    'tokens' : IDL.Func([AccountIdentifier_3], [Result_2], ['query']),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
  });
  return advanced_token;
};
export const init = ({ IDL }) => { return []; };