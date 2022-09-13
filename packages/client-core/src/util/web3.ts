/**
 *
 * @param address Wallet address to be reduced
 * @param length Reduced length
 * @returns
 */

 export const publicKeyToReduceString = (address: string, length: number = 10) => {
    if (!address.startsWith('juno')) {
      return address
    }
  
    length = (address.length - length) / 2
    const part1 = address.slice(0, length)
    const part2 = address.slice(address.length - length)
    return part1 + '...' + part2
  }
  