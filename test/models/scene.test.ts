// Deactivated, need to fix after all step

// import app from '../../src/app'

// describe('CRUD operation on \'Scene\' model', () => {
//   const model = app.service('scene').Model
//   const ownedFileModel = app.service('owned-file').Model
//   const userModel = app.service('user').Model
//   const userRoleModel = app.service('user-role').Model
//   const collectionTypeModel = app.service('collection-type').Model
//   const collectionModel = app.service('collection').Model
//   let userId: any, modelOwnedFileId: any, screenshotOwnedFileId: any
//   let userRole: any, collectionId: any, collectionType: any

//   before(async () => {
//     userRole = await userRoleModel.create({ role: 'usertestrole' }).role
//     userId = await userModel.create({ userRole }).id
//     collectionType = await collectionTypeModel.create({ type: 'test-project' }).type
//     collectionId = await collectionModel.create({ name: 'test-collection', collectionType }).id

//     modelOwnedFileId = await ownedFileModel.create({
//       key: Math.random().toString(),
//       content_type: 'application/json',
//       content_length: '1024',
//       state: 'active',
//       ownerUserId: userId,
//       url: 'http://wikipedia.org'
//     }).id

//     screenshotOwnedFileId = await ownedFileModel.create({
//       key: Math.random().toString(),
//       content_type: 'application/json',
//       content_length: '1024',
//       state: 'active',
//       ownerUserId: userId,
//       url: 'http://wikipedia.org'
//     }).id
//   })

//   it('Create', (done) => {
//     model.create({
//       slug: 'testscene',
//       allow_remixing: true,
//       allow_promotion: true,
//       name: 'test',
//       collectionId,
//       modelOwnedFileId: modelOwnedFileId,
//       screenshotOwnedFileId
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Read', done => {
//     model.findOne({
//       where: {
//         slug: 'testscene'
//       }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Update', done => {
//     model.update(
//       { name: 'updated name test' },
//       { where: { slug: 'testscene' } }
//     ).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Delete', done => {
//     model.destroy({
//       where: { slug: 'testscene' }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   after(async () => {
//     userModel.destroy({
//       where: {
//         id: userId
//       }
//     })

//     userRoleModel.destroy({
//       where: {
//         role: userRole
//       }
//     })

//     collectionModel.destroy({
//       where: {
//         id: collectionId
//       }
//     })

//     collectionTypeModel.destroy({
//       where: {
//         type: collectionType
//       }
//     })

//     await ownedFileModel.destroy({
//       where: {
//         id: modelOwnedFileId
//       }
//     })

//     await ownedFileModel.destroy({
//       where: {
//         id: screenshotOwnedFileId
//       }
//     })
//   })
// })
