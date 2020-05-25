import app from '../../src/app'
import { Op } from 'sequelize'

describe('CRUD operation on \'ProjectAsset\' model', () => {
  const model = app.service('project-asset').Model
  const assetModel = app.service('asset').Model
  const userRoleModel = app.service('user-role').Model
  const userModel = app.service('user').Model
  const projectModel = app.service('project').Model
  let assetId: any, projectId: any, newAssetId: any, userId: any, userRole: any

  before(async () => {
    userRole = await userRoleModel.create({ role: 'usertestrole' }).role
    userId = await userModel.create({ userRole: userRole }).id

    let asset = await assetModel.create({
      name: 'test asset',
      type: 'image'
    })
    assetId = asset.id

    asset = await assetModel.create({
      name: 'new test asset',
      type: 'image'
    })
    newAssetId = asset.id

    const project = await projectModel.create({
      name: 'test project',
      creatorUserId: userId
    })
    projectId = project.id
  })

  it('Create', (done) => {
    model.create({
      projectId,
      assetId
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        projectId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { asssetId: newAssetId },
      { where: { projectId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { projectId }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    userModel.destroy({
      where: {
        id: userId
      }
    })
    userRoleModel.destroy({
      where: {
        role: userRole
      }
    })
    projectModel.destroy({
      where: {
        id: projectId
      }
    })

    assetModel.destroy({
      where: {
        assetId: {
          [Op.in]: [assetId, newAssetId]
        }
      }
    })
  })
})
