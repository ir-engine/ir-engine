import app from '../../src/app'
import { Op } from 'sequelize'

describe('CRUD operation on \'UserRelationship\' model', () => {
  const model = app.service('user-relationship').Model
  const userModel = app.service('user').Model
  const userRelationshipTypeModel = app.service('user-relationship-type').Model
  var userId: any, relatedUserId: any, userRelationshipType: any

  before(async () => {
    const user = await userModel.create({
      email: 'vinay.k@queppelin.com',
      password: '12345',
      mobile: '8767367277',
      githubId: 'vinaykr579',
      isVerified: true
    })
    userId = user.id
    const relatedUser = await userModel.create({
      email: 'vinay.kr@queppelin.com',
      password: '12345',
      mobile: '8767367278',
      githubId: 'vinaykr578',
      isVerified: true
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

  it('Create', done => {
    model.create({
      userId: userId,
      relatedUserId: relatedUserId,
      type: userRelationshipType
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        userId: userId
      }
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

  after(() => {
    userModel.destroy({
      where: {
        id: {
          [Op.in]: [userId, relatedUserId]
        }
      }
    })
  })
})
