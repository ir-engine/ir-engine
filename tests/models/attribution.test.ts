import app from '../../packages/server/src/app'
import { Op } from 'sequelize';

describe('CRUD operation on \'Attribution\' model', () => {
  const model = app.service('attribution').Model

  beforeAll(async () => {
    await model.destroy({
      where: {
        [Op.or]: [
          {
            creator: 'test'
          },
          {
            creator: 'test1'
          }
        ]
      }
    })
  })

  it('Create', async () => {
    await model.create({
      creator: 'test',
      url: 'https://localhost:3030'
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        creator: 'test'
      }
    })
  })

  it('Update', async () => {
    await model.update(
      { creator: 'test1' },
      { where: { creator: 'test' } }
    )
  })

  it('Delete', async () => {
    await model.destroy({
      where: { creator: 'test1' }
    })
  })
})
