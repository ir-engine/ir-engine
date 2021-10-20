const accessControls = {
  admin: {
    listScope: 'all',
    createScope: 'all',
    readScope: 'all',
    updateScope: 'all',
    deleteScope: 'all'
  },
  user: {
    listScope: 'all',
    createScope: 'none',
    readScope: 'all',
    updateScope: 'none',
    deleteScope: 'none'
  },
  guest: {
    listScope: 'all',
    createScope: 'none',
    readScope: 'all',
    updateScope: 'none',
    deleteScope: 'none'
  }
}

export default accessControls
