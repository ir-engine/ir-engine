// import app from '../../src/app'

describe('CRUD operation on \'Scene\' model', () => {
  // const model = app.service('scene').Model
  // const ownedFileModel = app.service('owned-file').Model
  // const userModel = app.service('user').Model
  // let userId: any, modelOwnedFileId: any, screenshotOwnedFileId: any

  // before(async () => {
  //   const user = await userModel.create({})
  //   userId = user.id

  //   const modelOwnedFile = await ownedFileModel.create({
  //     key: Math.random().toString(),
  //     content_type: 'application/json',
  //     content_length: '1024',
  //     state: 'active',
  //     account_id: userId
  //   })

  //   modelOwnedFileId = modelOwnedFile.owned_file_id

  //   const screenOwnedFile = await ownedFileModel.create({
  //     key: Math.random().toString(),
  //     content_type: 'application/json',
  //     content_length: '1024',
  //     state: 'active',
  //     account_id: userId
  //   })

  //   screenshotOwnedFileId = screenOwnedFile.owned_file_id
  // })

  // it('Create', (done) => {
  //   model.create({
  //     slug: 'testscene',
  //     allow_remixing: true,
  //     allow_promotion: true,
  //     name: 'test',
  //     model_owned_file_id: modelOwnedFileId,
  //     screenshot_owned_file_id: screenshotOwnedFileId
  //   }).then(res => {
  //     done()
  //   }).catch(done)
  // })

  // it('Read', done => {
  //   model.findOne({
  //     where: {
  //       slug: 'testscene'
  //     }
  //   }).then(res => {
  //     done()
  //   }).catch(done)
  // })

  // it('Update', done => {
  //   model.update(
  //     { name: 'updated name test' },
  //     { where: { slug: 'testscene' } }
  //   ).then(res => {
  //     done()
  //   }).catch(done)
  // })

  // it('Delete', done => {
  //   model.destroy({
  //     where: { slug: 'testscene' }
  //   }).then(res => {
  //     done()
  //   }).catch(done)
  // })

  // after(async () => {
  //   await userModel.destroy({
  //     where: {
  //       id: userId
  //     }
  //   })

  //   await ownedFileModel.destroy({
  //     where: {
  //       account_id: userId
  //     }
  //   })
  // })
})
