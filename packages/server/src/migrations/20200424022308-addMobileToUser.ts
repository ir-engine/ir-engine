import { QueryInterface, DataTypes } from 'sequelize'

export = {
  up: async (queryInterface: QueryInterface) => {
    return await queryInterface.addColumn('user', 'mobile', {
      type: DataTypes.STRING
    })
  },

  down: async (queryInterface: QueryInterface) => {
    return await queryInterface.removeColumn('user', 'mobile')
  }
}
