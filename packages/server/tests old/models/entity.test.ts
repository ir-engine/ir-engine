import app from '../../packages/server/src/app'
import { v1 } from 'uuid'

describe('CRUD operation on \'Entity\' model', () => {
  const model = (app.service('entity') as any).Model
  const entityId = v1();
  it('Create', async () => {
    await model.create({
      name: 'test',
      entityId: entityId
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        entityId: entityId
      }
    })
  })

  it('Update', async () => {
    await model.update(
      { name: 'test1' },
      { where: { entityId: entityId } }
    )
  })

  it('Delete', async () => {
    await model.destroy({
      where: { entityId: entityId }
    })
  })
})
