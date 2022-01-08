import { setField } from 'feathers-authentication-hooks'

// Don't remove this comment. It's needed to format import lines nicely.

export default setField({
  from: 'params.user.id',
  as: 'data.userId'
})
