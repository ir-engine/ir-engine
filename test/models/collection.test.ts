// // TODO: Add collection type association

// import app from '../../src/app'

// describe('CRUD operation on \'Collection\' model', () => {
//   const model = app.service('collection').Model

//   before(async () => {
//     setTimeout(() => {
//       console.log('Waited for thirty seconds before test started.')
//     }, 30000)
//   })

//   it('Create', done => {
//     model.create({
//       name: 'test',
//       description: 'test description',
//       metadata: JSON.stringify({ a: 'test' }),
//       isPublic: true
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
//       { description: 'test1 description' },
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
