// import app from '../../src/app'

// describe('CRUD operation on \'Entity\' model', () => {
//   const model = app.service('entity').Model
//   const entityTypeModel = app.service('entity-type').Model
//   let entityType: any

//   before(async () => {
//     const entity = await entityTypeModel.create({
//       type: 'test_entity_type'
//     })
//     entityType = entity.type
//   })

//   it('Create', done => {
//     model.create({
//       name: 'test',
//       entityType: entityType
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Read', done => {
//     model.findOne({
//       where: {
//         entityType: entityType
//       }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Update', done => {
//     model.update(
//       { name: 'test1' },
//       { where: { entityType: entityType } }
//     ).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Delete', done => {
//     model.destroy({
//       where: { entityType: entityType }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   after(async () => {
//     entityTypeModel.destroy({
//       where: {
//         type: entityType
//       }
//     })
//   })
// })
