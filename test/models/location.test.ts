// TODO: Fix and uncomment

// import app from '../../src/app'

// describe('CRUD operation on \'Location\' model', () => {
//   const model = app.service('location').Model

//   it('Create', function (done) {
//     this.timeout(10000)
//     model.create({
//       name: 'test',
//       maxUsersPerInstance: 10
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Read', done => {
//     model.findOne({
//       where: {
//         name: 'test'
//       }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Update', done => {
//     model.update(
//       { maxUsersPerInstance: 11 },
//       { where: { name: 'test' } }
//     ).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Delete', done => {
//     model.destroy({
//       where: { name: 'test' }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })
// })
