const path = require('path');

const databaseOptions = {
  logging: !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { maxConnections: 10, minConnections: 1 },
  dialectOptions: {},
};

databaseOptions.dialectOptions.typeCast = (field, useDefaultTypeCasting) => {
  if ((field.type === "BIT") && (field.length === 1)) {
    const bytes = field.buffer();
    return bytes ? bytes[0] === 1 : bytes;
  }

  return useDefaultTypeCasting();
};

if (process.env.DATABASE_SSL && JSON.parse(process.env.DATABASE_SSL.toLowerCase())) {
  databaseOptions.dialectOptions.ssl = { rejectUnauthorized: true };
}

module.exports = [{
  name: 'default',
  modelsDir: path.resolve(__dirname, '../models'),
  connection: {
    url: process.env.DATABASE_URL,
    options: { ...databaseOptions },
  },
}];
