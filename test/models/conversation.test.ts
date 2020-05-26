import app from '../../src/app'
import GenerateRandomAnimalName from 'random-animal-name-generator'
import { Op } from 'sequelize'

describe('CRUD operation on \'Message\' model', () => {
  const model = app.service('conversation').Model
  const userModel = app.service('user').Model

  let firstuserId: any, seconduserId: any

  before(async () => {
    let user = await userModel.create({
      name: GenerateRandomAnimalName().toUpperCase()
    })
    firstuserId = user.id

    user = await userModel.create({
      name: GenerateRandomAnimalName().toUpperCase()
    })
    seconduserId = user.id
  })

  it('Create', (done) => {
    model.create({
      firstuserId: firstuserId,
      seconduserId: seconduserId,
      type: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        firstuserId: firstuserId,
        seconduserId: seconduserId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: {
        firstuserId: firstuserId,
        seconduserId: seconduserId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    await userModel.destroy({
      where: {
        id: {
          [Op.in]: [firstuserId, seconduserId]
        }
      }

    })
  })
})
