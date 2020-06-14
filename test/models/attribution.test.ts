import app from '../../server/app'

describe('CRUD operation on \'Attribution\' model', () => {
  const model = app.service('attribution').Model

<<<<<<< HEAD
  it('Create', async () => {
=======
  it('Create', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.create({
      creator: 'test',
      url: 'http://localhost:3030'
    })
  })

<<<<<<< HEAD
  it('Read', async () => {
=======
  it('Read', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.findOne({
      where: {
        creator: 'test'
      }
    })
  })

<<<<<<< HEAD
  it('Update', async () => {
=======
  it('Update', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.update(
      { creator: 'test1' },
      { where: { creator: 'test' } }
    )
  })

<<<<<<< HEAD
  it('Delete', async () => {
=======
  it('Delete', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.destroy({
      where: { creator: 'test1' }
    })
  })
})
