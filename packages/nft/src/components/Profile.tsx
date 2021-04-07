import { useWeb3React } from '@web3-react/core'
import { utils, BigNumber } from 'ethers'
import Token from './Token'
import { updateTokensOnSale, updateUser } from '../actions'
import { useStateContext } from '../state'

export type ProfileProps = {}

const Profile = () => {
  const { state, dispatch } = useStateContext()
  const { contract, user, tokensOnSale } = state
  const { library } = useWeb3React()

  if (!user) return null

  const { address, balance, ownedTokens } = user

  const onConfirmTransfer = async (): Promise<boolean> => {
    if (!user || !user.address || !library) return false
    try {
      await updateUser({
        contract: contract?.payload,
        userAccount: user.address,
        library,
        dispatch,
      })
      return true
    } catch (e) {
      return false
    }
  }

  const onTransferToken = async ({
    id,
    address,
  }: {
    id: string
    address: string
  }): Promise<boolean> => {
    if (!contract?.payload) return false

    try {
      const tx = await contract.payload['safeTransferFrom(address,address,uint256)'](
        user.address,
        address,
        id,
        {
          from: user.address,
        }
      )
      const receipt = await tx.wait()
      if (receipt.confirmations >= 1) {
        return onConfirmTransfer()
      } else {
        return false
      }
    } catch (e) {
      console.log(e)
      return false
    }
  }

  const onSaleToken = async ({
    id,
    price,
    onSale = true,
  }: {
    id: string
    price: BigNumber
    onSale?: boolean
  }): Promise<boolean> => {
    if (!contract?.payload || !user?.address) return false
    try {
      await contract.payload.setTokenSale(id, onSale, price, { from: user.address })
      await updateTokensOnSale({ dispatch, contract: contract?.payload })
      return await onConfirmTransfer()
    } catch (e) {
      console.log(e)
      return false
    }
  }

  return (
    <div>
      <h1>My Profile</h1>
      <div>
      <span>Address:  {address}</span>
      <span>Balance: Ξ {balance}</span>
        {ownedTokens && ownedTokens.length > 0 ? (
          <div>
              My items{' '}
              <span> ({ownedTokens.length} item) </span>
              {ownedTokens.map((t, index) => (
                <Token
                  isOnSale={
                    !!tokensOnSale?.find(a => utils.formatUnits(a.id) === utils.formatUnits(t.id))
                  }
                  onSale={onSaleToken}
                  onTransfer={onTransferToken}
                  token={t}
                  key={index}
                />
              ))}
          </div>
        ) : (
          ownedTokens && (
            <div>
              <h2>You don't own any NFT tokens</h2>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Profile
