const { APIETHERSCAN, SERVICE_URL } = process.env

export { default as listTokensFrom } from './listTokensFrom'

export const ETHSCAN_API = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${APIETHERSCAN}`

export const METADATA_API = SERVICE_URL || ''
