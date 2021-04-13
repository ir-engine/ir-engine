import { ActionProps } from '.';
// import XR3 from '../../contracts/XR3.json'
import { Contract } from 'ethers';
import { ActionType } from '../reducer';

type Props = ActionProps<{
  chainId: number
}>

const getContract = async ({ dispatch, library, chainId }: Props) => {
  if (!library) throw new Error('No Web3 Found');

  const networkid = (id: number) => {
    switch (id) {
      case 1337:
        return 5777;
      default:
        return id;
    }
  };

  // try {
  //   const deployedNetwork = XR3.networks[String(networkid(chainId)) as keyof typeof XR3.networks]

  //   if (!deployedNetwork) {
  //     throw new Error('The network you selected is no supported yet.')
  //   }

  //   const { address } = deployedNetwork
  //   const contract = new Contract(address, XR3.abi, library.getSigner())

  //   const name = await contract.name()
  //   const symbol = await contract.symbol()

  //   dispatch({
  //     type: ActionType.CONTRACT,
  //     payload: {
  //       payload: contract,
  //       details: {
  //         address,
  //         name,
  //         symbol,
  //       },
  //     },
  //   })

  //   return contract
  // } catch (e) {
  //   console.log(e)
  //   throw new Error(e)
  // }
};

export default getContract;
