import app from '../../src/app'

describe('CRUD operation on \'GroupUserRank\' model', () => {
  const model = app.service('group-user-rank').Model
  before(async () => {
    setTimeout(() => {
      console.log('Waited for thirty seconds before test started.')
    }, 30000)
  })

  it('Create', done => {
    model.create({
      rank: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        rank: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { rank: 'test1' },
      { where: { rank: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { rank: 'test1' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
