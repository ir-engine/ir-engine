// import app from '../app'
export default function (options = {}) {
  return async (context: any): Promise<any> => {
    const identityProvider = context.result

    await context.app.service('user').remove(identityProvider.userId)

    Object.assign(context.result, { removedUserId: identityProvider.userId })
    return context
  }
}
