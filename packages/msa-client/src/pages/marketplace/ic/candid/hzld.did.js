export default ({ IDL }) => {
  const User = IDL.Principal;
  const BalanceRequest = IDL.Record({ 'user' : User });
  const Balance = IDL.Nat;
  const Metadata = IDL.Vec(IDL.Nat8);
  const TransferRequest = IDL.Record({
    'to' : User,
    'metadata' : IDL.Opt(Metadata),
    'from' : User,
    'amount' : Balance,
  });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({
      'InsufficientBalance' : IDL.Null,
      'InvalidSource' : User,
      'Unauthorized' : IDL.Null,
    }),
  });
  const TransferResponse = Result_2;
  const OperatorAction = IDL.Variant({
    'removeOperator' : IDL.Null,
    'setOperator' : IDL.Null,
  });
  const OperatorRequest = IDL.Record({
    'owner' : User,
    'operators' : IDL.Vec(IDL.Tuple(User, OperatorAction)),
  });
  const Result = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({ 'Unauthorized' : IDL.Null, 'InvalidOwner' : User }),
  });
  const OperatorResponse = Result;
  return IDL.Service({
    'getBalance' : IDL.Func([BalanceRequest], [IDL.Opt(Balance)], []),
    'getBalanceInsecure' : IDL.Func(
        [BalanceRequest],
        [IDL.Opt(Balance)],
        ['query'],
      ),
    'getCommunityChestValueInsecure' : IDL.Func(
        [],
        [IDL.Opt(IDL.Nat)],
        ['query'],
      ),
    'getInfo' : IDL.Func(
        [],
        [
          IDL.Record({
            'balance' : IDL.Nat,
            'maxLiveSize' : IDL.Nat,
            'heap' : IDL.Nat,
            'size' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getNumberOfAccounts' : IDL.Func([], [IDL.Nat], []),
    'getTokenInfo' : IDL.Func(
        [],
        [
          IDL.Record({
            'fee' : IDL.Nat,
            'totalMinted' : IDL.Nat,
            'totalSupply' : IDL.Nat,
            'totalTransactions' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getTotalMinted' : IDL.Func([], [IDL.Nat], []),
    'mint' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'updateOperator' : IDL.Func(
        [IDL.Vec(OperatorRequest)],
        [OperatorResponse],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };