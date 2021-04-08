import { useStateContext } from '../state'
import { ContractPropsDetails } from '../types'

export type ContractDetailsProps = {
  //
}

const ContractDetails = () => {
  const {
    state: { contract },
  } = useStateContext()
  return (
    <div>
      <h1>NFT Contract Details</h1>
      {contract &&
        Object.keys(contract.details).map(a => (
          <p key={a}>
            {a}:{' '}
            {contract.details[a as keyof ContractPropsDetails]}
          </p>
        ))}
    </div>
  )
}

export default ContractDetails
