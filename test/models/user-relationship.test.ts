import app from '../../server/app'
import { Op } from 'sequelize'

describe('CRUD operation on \'UserRelationship\' model', () => {
  const model = app.service('user-relationship').Model
  const userModel = app.service('user').Model
  const userRelationshipTypeModel = app.service('user-relationship-type').Model
  let userId: any, relatedUserId: any, userRelationshipType: any

<<<<<<< HEAD
  beforeAll(async () => {
=======
  beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    const user = await userModel.create({
      name: 'george'
    })
    userId = user.id
    const relatedUser = await userModel.create({
      name: 'janice'
    })
    relatedUserId = relatedUser.id
    const userRelationshipTypes = await userRelationshipTypeModel.findAll()
    if (userRelationshipTypes.length) {
      userRelationshipType = userRelationshipTypes[0].type
    } else {
      userRelationshipType = 'test'
      userRelationshipTypeModel.create({
        type: 'test'
      })
    }
  })

<<<<<<< HEAD
  it('Create', () => {
=======
  it('Create', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    model.create({
      userId: userId,
      relatedUserId: relatedUserId,
      type: userRelationshipType
<<<<<<< HEAD
    })
  })

  it('Read', () => {
=======
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    model.findOne({
      where: {
        userId: userId
      }
<<<<<<< HEAD
    })
  })

  it('Update', () => {
    model.update(
      { type: userRelationshipType },
      { where: { userId: userId } }
    )
  })

  it('Delete', () => {
    model.destroy({
      where: { userId: userId }
    })
  })

  afterAll(() => {
=======
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { type: userRelationshipType },
      { where: { userId: userId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { userId: userId }
    }).then(res => {
      done()
    }).catch(done)
  })

  afterEach(() => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    userModel.destroy({
      where: {
        id: {
          [Op.in]: [userId, relatedUserId]
        }
      }
    })
    userRelationshipTypeModel.destroy({
      where: {
        type: userRelationshipType
      }
    })
  })
})
