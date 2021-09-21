export default ({ IDL }) => {
  return IDL.Service({
    'list' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'log' : IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => { return []; };