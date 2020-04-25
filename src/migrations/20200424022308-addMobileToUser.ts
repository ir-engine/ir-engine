import { QueryInterface, DataTypes } from 'sequelize'

export = {
  up: (queryInterface: QueryInterface) => {
    return await queryInterface.addColumn('user', 'mobile', {
      type: DataTypes.STRING
    })
  },

  down: (queryInterface: QueryInterface) => {
    return await queryInterface.removeColumn('user', 'mobile')
  }
};
