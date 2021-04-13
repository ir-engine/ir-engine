const colors = require('colors')
const XR3 = artifacts.require('XR3.sol')
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

module.exports = async deployer => {
  const app = await deployProxy(XR3, { deployer, initializer: 'initialize' })
  const owner = await app.owner()
  console.log(colors.grey(`XR3 contract owner: ${owner}`))
  console.log(colors.green('XR3 contract address:'))
  console.log(colors.yellow(app.address))
}
