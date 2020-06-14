import app from '../../server/app'

describe('CRUD operation on \'GroupUserRank\' model', () => {
  const model = app.service('group-user-rank').Model

<<<<<<< HEAD
  it('Create', async () => {
=======
  it('Create', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.create({
      rank: 'test'
    })
  })

<<<<<<< HEAD
  it('Read', async () => {
=======
  it('Read', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.findOne({
      where: {
        rank: 'test'
      }
    })
  })

<<<<<<< HEAD
  it('Update', async () => {
=======
  it('Update', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.update(
      { rank: 'test' },
      { where: { rank: 'test' } }
    )
  })

<<<<<<< HEAD
  it('Delete', async () => {
=======
  it('Delete', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.destroy({
      where: { rank: 'test' }
    })
  })
})
