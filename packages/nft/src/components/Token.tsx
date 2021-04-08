import { BigNumber, utils } from 'ethers'
import { FormEvent, MouseEvent, useState } from 'react'
import useSWR from 'swr'
import { useStateContext } from '../state'
import { METADATA_API } from '../utils'
import { fetcherMetadata } from '../utils/fetchers'
import { Input, Button } from '@material-ui/core';

export type TokenProps = {
  id: string
  uri: string
  price: BigNumber
  name: string
}

export type TokenCompProps = {
  token: TokenProps
  isOnSale?: boolean
  onTransfer?({ id, address }: { id: string; address: string }): Promise<boolean>
  onBuy?({ id, price }: { id: string; price: BigNumber }): void
  onSale?({
    id,
    price,
    onSale,
  }: {
    id: string
    price: BigNumber
    onSale?: boolean
  }): Promise<boolean>
}

const Token = ({ token, isOnSale, onTransfer, onBuy, onSale }: TokenCompProps) => {
  const [transfer, setTransfer] = useState<boolean>(false)
  const [onSaleActive, setOnSale] = useState<boolean>(false)
  const [address, setAddress] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const {
    state: { user, ethPrice, contract },
  } = useStateContext()

  const onTransferClick = async (e: FormEvent | MouseEvent) => {
    e.preventDefault()
    try {
      if (onTransfer) {
        const result = await onTransfer({ id: token.id, address })
        if (result) {
          setOnSale(false)
        }
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  const onBuyClick = (e: MouseEvent) => {
    e.preventDefault()
    onBuy && onBuy({ id: token.id, price: token.price })
  }

  const onSaleClick = async (e: MouseEvent) => {
    e.preventDefault()
    if (!onSale) return
    try {
      const result = await onSale({ id: token.id, price: utils.parseEther(price), onSale: true })
      if (result) {
        setOnSale(false)
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  const { data } = useSWR(`${METADATA_API}/token?id=${token.id}`, fetcherMetadata)

  const tokenPriceEth = new Intl.NumberFormat('us-GB', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(utils.formatEther(token.price)) * Number(ethPrice))

  if (!data)
    return (
      <div>
        Loading...
      </div>
    )

  return (
    <div>
      <img
        src={data.image}
      />
      <h2>{data.name}</h2>
      <span>Price: {Number(utils.formatEther(token.price)).toFixed(2)}{' '} {tokenPriceEth}</span>
      <a
        target="_blank"
        href={`https://testnets.opensea.io/assets/${contract?.details.address}/${token.id}`}
      >
        View on Opensea.io
          </a>

      {onTransfer && (
        <div>
          {transfer && (
            <div>
              <Input onChange={e => setAddress(e.currentTarget.value)} placeholder="ETH Address 0x0..." />
              <Button onClick={onTransferClick}> Confirm </Button>
              <Button onClick={() => setTransfer(false)} > Cancel </Button>
            </div>
          )}
          {onSaleActive && (
            <div>
              <Input
                onChange={e => setPrice(e.currentTarget.value)}
                placeholder="Token Price in ETH"
              />
              <Button onClick={onSaleClick}> Confirm </Button>
              <Button onClick={() => setOnSale(false)}> Cancel</Button>
            </div>
          )}

          {!transfer && !onSaleActive && (
            <div>
              <Button onClick={() => setTransfer(!transfer)}> Transfer </Button>
              {isOnSale ? (
                <Button onClick={() =>
                  onSale &&
                  onSale({
                    id: token.id,
                    price: token.price,
                    onSale: false,
                  })
                }
                >
                  Remove from Sale
                </Button>
              ) : (
                <Button onClick={() => setOnSale(!onSaleActive)}>
                  Put Token for Sale
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      {onBuy && ( <Button onClick={onBuyClick} > Buy Token </Button> )}
    </div>
  )
}

export default Token
