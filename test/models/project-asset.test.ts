// import app from '../../src/app'
// import { Op } from 'sequelize'

// describe('CRUD operation on \'ProjectAsset\' model', () => {
//   const model = app.service('project-asset').Model
//   const assetModel = app.service('asset').Model
//   const projectModel = app.service('project').Model
//   let assetId: any, projectId: any, newAssetId: any

//   before(async () => {
//     let asset = await assetModel.create({
//       name: 'test asset',
//       type: 'image'
//     })
//     assetId = asset.asset_id

//     asset = await assetModel.create({
//       name: 'new test asset',
//       type: 'image'
//     })
//     newAssetId = asset.asset_id

//     const project = await projectModel.create({
//       name: 'test project'
//     })
//     projectId = project.id
//   })

//   it('Create', (done) => {
//     model.create({
//       project_id: projectId,
//       asset_id: assetId
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Read', done => {
//     model.findOne({
//       where: {
//         project_id: projectId
//       }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Update', done => {
//     model.update(
//       { asset_id: newAssetId },
//       { where: { project_id: projectId } }
//     ).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Delete', done => {
//     model.destroy({
//       where: { project_id: projectId }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   after(async () => {
//     projectModel.destroy({
//       where: {
//         id: projectId
//       }
//     })

//     assetModel.destroy({
//       where: {
//         asset_id: {
//           [Op.in]: [assetId, newAssetId]
//         }
//       }
//     })
//   })
// })
