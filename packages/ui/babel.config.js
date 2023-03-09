module.exports = {
  presets: [
    ["@babel/preset-react",
    'enzyme-adapter-react-16', '@babel/preset-env', {targets: {node: 'current'}}]
  ],
};