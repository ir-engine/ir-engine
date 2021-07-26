import app from '../../packages/server/src/app'
import { Op } from 'sequelize'

describe('CRUD operation on \'UserRelationship\' model', () => {
  const model = (app.service('user-relationship') as any).Model
  const userModel = (app.service('user') as any).Model
  const userRelationshipTypeModel = (app.service('user-relationship-type') as any).Model
  let userId: any, relatedUserId: any, userRelationshipType: any

  beforeAll(async () => {
    const user = await userModel.create({
      name: 'george'
    })
    userId = user.id
    const relatedUser = await userModel.create({
      name: 'janice'
    })
    relatedUserId = relatedUser.id
    userRelationshipType = 'test'
    userRelationshipTypeModel.create({
      type: 'test'
    })
  })

  it('Create', () => {
    model.create({
      userId: userId,
      relatedUserId: relatedUserId,
      type: userRelationshipType
    })
  })

  it('Read', () => {
    model.findOne({
      where: {
        userId: userId
      }
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
