export default ({ IDL }) => {
  const ClaimResult = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const AddressBook = IDL.Record({
    'controllers' : IDL.Vec(IDL.Principal),
    'tokens' : IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Principal)),
    'claim_index' : IDL.Nat64,
    'token_seeds' : IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
    'total_supply' : IDL.Nat64,
  });
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
  return IDL.Service({
    'add_airdrops' : IDL.Func([IDL.Vec(IDL.Principal)], [IDL.Bool], []),
    'add_controller' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'claim' : IDL.Func([], [ClaimResult], []),
    'get_address_book' : IDL.Func([], [AddressBook], ['query']),
    'get_airdrops' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Bool))],
        ['query'],
      ),
    'get_controllers' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_token_properties' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'name' : IDL.Func([], [IDL.Text], ['query']),
    'owner_of' : IDL.Func([IDL.Nat64], [IDL.Opt(IDL.Principal)], ['query']),
    'remaining' : IDL.Func([], [IDL.Nat64], []),
    'remove_controller' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'supply' : IDL.Func([], [IDL.Nat64], []),
    'symbol' : IDL.Func([], [IDL.Text], ['query']),
    'transfer_to' : IDL.Func([IDL.Principal, IDL.Nat64], [IDL.Bool], []),
    'user_tokens' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat64)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };