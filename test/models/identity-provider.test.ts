// TODO: Verify the both-ways connection and find a user by an identity provider
// TODO: Add tests to make sure our tokens and passwords are encrypted
// TODO: Fix and uncomment
// import app from '../../src/app'

// describe('CRUD operation on \'IdentityProvider\' model', () => {
//   const model = app.service('identity-provider').Model
//   const userModel = app.service('user').Model
//   const identityProviderTypeModel = app.service('identity-provider-type').Model
//   var userId: any, type: any

//   before(async () => {
//     const user = await userModel.create({
//     })
//     userId = user.id
//     const identityProviderType = await identityProviderTypeModel.create({
//       type: 'test'
//     })
//     type = identityProviderType.type
//   })

//   it('Create', done => {
//     model.create({
//       type: type,
//       userId: userId
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Read', done => {
//     model.findOne({
//       where: {
//         type: type
//       }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Update', done => {
//     model.update(
//       { type: type },
//       { where: { type: type } }
//     ).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Delete', done => {
//     model.destroy({
//       where: { type: type }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   after(() => {
//     userModel.destroy({
//       where: {
//         userId: userId
//       }
//     })
//     identityProviderTypeModel.destroy({
//       where: {
//         type: type
//       }
//     })
//   })

//   it('Should not create IdentityProvider without IdentityProviderType', done => {
//     model.create({
//       type: 'test11'
//     }).then(res => {
//       done(new Error('IdentityProvider created without IdentityProviderType.'))
//     }).catch(_err => {
//       done()
//     })
//   })
// })
