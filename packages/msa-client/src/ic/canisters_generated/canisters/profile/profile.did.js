export const idlFactory = ({ IDL }) => {
  const Profile = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'address' : IDL.Text,
  });
  return IDL.Service({
    'getOwnPrincipal' : IDL.Func([], [IDL.Principal], ['query']),
    'getOwnProfile' : IDL.Func([], [Profile], ['query']),
    'getPrincipalByEth' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'getProfileByEth' : IDL.Func([IDL.Text], [IDL.Opt(Profile)], ['query']),
    'getProfileByName' : IDL.Func([IDL.Text], [IDL.Opt(Profile)], ['query']),
    'getProfileByPrincipal' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(Profile)],
        ['query'],
      ),
    'linkAddress' : IDL.Func([IDL.Text, IDL.Text], [Profile], []),
    'list' : IDL.Func([], [IDL.Vec(Profile)], ['query']),
    'search' : IDL.Func([IDL.Text], [IDL.Opt(Profile)], ['query']),
    'setDescription' : IDL.Func([IDL.Text], [Profile], []),
    'setName' : IDL.Func([IDL.Text], [Profile], []),
  });
};
export const init = ({ IDL }) => { return []; };
