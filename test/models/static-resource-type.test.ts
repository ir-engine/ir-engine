// TODO: Types should immutable in that they cannot be updated easily
// TODO: So add 'update' but passing the test would be a rejection of the change
// TODO: Uncomment and fix

// import app from '../../src/app'

// describe('CRUD operation on \'Static Resource Type\' model', () => {
//   const model = app.service('static-resource-type').Model

//   it('Create', function (done) {
//     model.create({
//       type: 'test'
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Read', done => {
//     model.findOne({
//       where: {
//         type: 'test'
//       }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Delete', done => {
//     model.destroy({
//       where: { type: 'test' }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })
// })
