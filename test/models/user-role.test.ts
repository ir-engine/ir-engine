import app from '../../server/app'

describe('CRUD operation on \'UserRole\' model', () => {
  const model = app.service('user-role').Model
<<<<<<< HEAD
  const role: string = 'testrole'

  it('Create', async () => {
=======
  let role: string = 'testrole'

  it('Create', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.create({
      role
    })
  })

<<<<<<< HEAD
  it('Read', async () => {
=======
  it('Read', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.findOne({
      where: { role }
    })
  })

<<<<<<< HEAD
  it('Delete', async () => {
=======
  it('Delete', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.destroy({
      where: { role }
    })
  })
})
