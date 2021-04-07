import { Button, Container } from '@material-ui/core';
import { useWeb3React } from '@web3-react/core';
import {
  useEffect,
  useState
} from 'react';
import useSWR from 'swr';
import { getContract, updateUser } from '../actions';
import {
  injected,
  walletconnect
} from '../connectors';
import { ActionType } from '../reducer';
import { useStateContext } from '../state';
import { ETHSCAN_API } from '../utils';
import { fetcherETHUSD } from '../utils/fetchers';
import { useEagerConnect, useInactiveListener } from '../web3';
import MetamaskLogin from "../components/MetamaskLogin";
import Gallery from "../components/Gallery";

enum ConnectorNames {
  Injected = 'Injected',
  WalletConnect = 'WalletConnect',

}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
}

const App = () => {
  const { dispatch, state } = useStateContext()
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    // deactivate,
    setError,
    error,
  } = useWeb3React()

  const { data: ethPrice } = useSWR(ETHSCAN_API, fetcherETHUSD)

  useEffect(() => {
    dispatch({ type: ActionType.ETH_PRICE, payload: ethPrice })
  }, [ethPrice, dispatch])

  const signInUser = async () => {
    if (!account) throw new Error('No Account found')
    if (!chainId) throw new Error('No chainId')
    try {
      await library.getSigner(account).signMessage('👋')
      // const contract = await getContract({ dispatch, library, chainId })
      // await updateUser({ contract, userAccount: account, library, dispatch })
      console.log("Need to get contract here!");
    } catch (e) {
      setError(e)
    }
  }

  const [activatingConnector, setActivatingConnector] = useState<any>()
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  return (
    <Container>
      {!state.user ? (
        <>
            {Object.keys(connectorsByName).map((name: string) => {
              //@ts-ignore
              const currentConnector = connectorsByName[name]
              const activating = currentConnector === activatingConnector
              const connected = currentConnector === connector
              const disabled = !triedEager || !!activatingConnector || connected || !!error

              return (
                <Button
                  disabled={disabled}
                  key={name}
                  onClick={() => {
                    setActivatingConnector(currentConnector)
                    activate(connectorsByName[name])
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'black',
                      margin: '0 0 0 1rem',
                    }}
                  >
                    {activating &&
                    <span aria-label="loading">
                        Spinning...
                      </span>
                      }
                    {connected && (
                      <span role="img" aria-label="check">
                        ✅
                      </span>
                    )}
                  </div>
                  {name}
                </Button>
              )
            })}
          {!!(library && account) && connector === connectorsByName.Injected && (
            <MetamaskLogin onClickConnect={signInUser} />
          )}
        </>
      ) : (
        <Gallery />
      )}
    </Container>
  )
}

export default App
