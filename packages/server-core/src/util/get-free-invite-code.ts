import crypto from 'crypto'

const getFreeInviteCode = async (app): Promise<string> => {
  const code = crypto.randomBytes(4).toString('hex')
  const match = await app.service('user').find({
    query: {
      inviteCode: code
    },
    isInternal: true
  })
  return match.total === 0 ? code : await getFreeInviteCode(app)
}

export default getFreeInviteCode
