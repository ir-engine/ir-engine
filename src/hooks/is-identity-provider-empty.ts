// import app from '../app'
export default function (options = {}) {
  return async (context: any): Promise<boolean> => {
    const identityProvider = context.result
    if (!identityProvider) {
      return false
    }

    const count = await context.app.service('identity-provider').Model.count({
      where: {
        userId: identityProvider.userId
      }
    })
    return count === 0
  }
}
