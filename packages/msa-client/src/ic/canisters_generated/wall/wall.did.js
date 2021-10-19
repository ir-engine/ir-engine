export const idlFactory = ({ IDL }) => {
  const Post = IDL.Record({
    'id' : IDL.Int,
    'text' : IDL.Text,
    'user_id' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  return IDL.Service({
    'wall' : IDL.Func([IDL.Text], [IDL.Vec(Post)], ['query']),
    'write' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
