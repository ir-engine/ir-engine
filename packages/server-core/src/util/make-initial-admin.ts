import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Application } from '../../declarations'
import { scopeTypeSeed } from '../scope/scope-type/scope-type.seed'

export default async (app: Application, userId: UserId) => {
  const adminCount = await app.service('user').Model.count({
    include: [
      {
        model: app.service('scope').Model,
        where: {
          type: 'admin:admin'
        }
      }
    ]
  })
  if (adminCount === 0) {
    const data = scopeTypeSeed.templates.map(({ type }) => {
      return { userId, type }
    })
    await app.service('scope').create(data)
  }
}
