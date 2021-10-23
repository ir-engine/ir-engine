import React from 'react'
import { useStyles } from './styles'
import { Typography, Grid } from '@material-ui/core'
import Authentication from './Authentication'
import Email from './Email'
import GameServer from './GameServer'
import Server from './Server'
import Client from './Client'
import Aws from './Aws'
import ChargeBee from './Chargebee'
import Redis from './Redis'
import Sidebar from './SideBar'
import MenuIcon from '@material-ui/icons/Menu'
import Button from '@material-ui/core/Button'
import Badge from '@material-ui/core/Badge'
import IconButton from '@material-ui/core/IconButton'
import ClearIcon from '@material-ui/icons/Clear'
import Analytics from './Analytics'

const Setting = () => {
  const classes = useStyles()
  const [isAws, setIsAws] = React.useState(false)
  const [isServer, setIsSever] = React.useState(false)
  const [isEmail, setIsEmail] = React.useState(false)
  const [isGame, setIsGame] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)
  const [isAuth, setIsAuth] = React.useState(false)
  const [isChargebee, setIsChargebee] = React.useState(false)
  const [isRedis, setIsRedis] = React.useState(false)
  const [isAnalytics, setIsAnalytics] = React.useState(true)
  const [Contents, setContents] = React.useState(<Analytics />)
  const [awsFocused, setAwsFocused] = React.useState(false)
  const [serverFocused, setServerFocused] = React.useState(false)
  const [emailFocused, setEmailFocused] = React.useState(false)
  const [gameFocused, setGameFocused] = React.useState(false)
  const [clientFocused, setClientFocused] = React.useState(false)
  const [authFocused, setAuthFocused] = React.useState(false)
  const [chargebeeFocused, setChargebeeFocused] = React.useState(false)
  const [redisFocused, setRedisFocused] = React.useState(false)
  const [menuVisible, setMenuVisible] = React.useState(false)
  const [analyticsFocused, setAnalyticsFocused] = React.useState(true)

  // const handleNotAutoFocused = ()=>{
  //   setIsFocused(!isFocused)
  // }

  const handleAuth = () => {
    setIsAuth(!isAuth)
    setAuthFocused(!authFocused)
    setIsAws(false)
    setIsRedis(false)
    setIsChargebee(false)
    setIsSever(false)
    setIsEmail(false)
    setIsGame(false)
    setIsClient(false)
    setIsAnalytics(false)
    setAwsFocused(false)
    setServerFocused(false)
    setEmailFocused(false)
    setGameFocused(false)
    setClientFocused(false)
    setChargebeeFocused(false)
    setRedisFocused(false)
    setMenuVisible(false)
    setAnalyticsFocused(false)
  }
  const handleAws = () => {
    setIsAws(!isAws)
    setAwsFocused(!awsFocused)
    setIsRedis(false)
    setIsChargebee(false)
    setIsAuth(false)
    setIsSever(false)
    setIsEmail(false)
    setIsGame(false)
    setIsClient(false)
    setIsAnalytics(false)
    setServerFocused(false)
    setEmailFocused(false)
    setGameFocused(false)
    setClientFocused(false)
    setChargebeeFocused(false)
    setRedisFocused(false)
    setAuthFocused(false)
    setMenuVisible(false)
    setAnalyticsFocused(false)
  }
  const handleChargebee = () => {
    setIsChargebee(!isChargebee)
    setChargebeeFocused(!chargebeeFocused)
    setIsAws(false)
    setIsRedis(false)
    setIsAuth(false)
    setIsSever(false)
    setIsEmail(false)
    setIsGame(false)
    setIsClient(false)
    setIsAnalytics(false)
    setServerFocused(false)
    setEmailFocused(false)
    setGameFocused(false)
    setClientFocused(false)
    setAwsFocused(false)
    setRedisFocused(false)
    setAuthFocused(false)
    setMenuVisible(false)
    setAnalyticsFocused(false)
  }
  const handleRedis = () => {
    setIsRedis(!isRedis)
    setRedisFocused(!redisFocused)
    setIsChargebee(false)
    setIsAws(false)
    setIsAuth(false)
    setIsSever(false)
    setIsEmail(false)
    setIsGame(false)
    setIsClient(false)
    setIsAnalytics(false)
    setServerFocused(false)
    setEmailFocused(false)
    setGameFocused(false)
    setClientFocused(false)
    setAwsFocused(false)
    setAuthFocused(false)
    setChargebeeFocused(false)
    setMenuVisible(false)
    setAnalyticsFocused(false)
  }

  const handleEmail = () => {
    setIsEmail(!isEmail)
    setEmailFocused(!emailFocused)
    setIsRedis(false)
    setIsChargebee(false)
    setIsAws(false)
    setIsAuth(false)
    setIsSever(false)
    setIsGame(false)
    setIsClient(false)
    setIsAnalytics(false)
    setServerFocused(false)
    setGameFocused(false)
    setClientFocused(false)
    setAwsFocused(false)
    setRedisFocused(false)
    setAuthFocused(false)
    setChargebeeFocused(false)
    setMenuVisible(false)
    setAnalyticsFocused(false)
  }
  const handleClient = () => {
    setIsClient(!isClient)
    setClientFocused(!clientFocused)
    setIsRedis(false)
    setIsChargebee(false)
    setIsAws(false)
    setIsAuth(false)
    setIsSever(false)
    setIsGame(false)
    setIsEmail(false)
    setIsAnalytics(false)
    setServerFocused(false)
    setGameFocused(false)
    setAwsFocused(false)
    setRedisFocused(false)
    setAuthFocused(false)
    setChargebeeFocused(false)
    setEmailFocused(false)
    setMenuVisible(false)
    setAnalyticsFocused(false)
  }
  const handleGameServer = () => {
    setIsGame(!isGame)
    setGameFocused(!gameFocused)
    setIsAws(false)
    setIsRedis(false)
    setIsAuth(false)
    setIsClient(false)
    setIsChargebee(false)
    setIsEmail(false)
    setIsAnalytics(false)
    setServerFocused(false)
    setClientFocused(false)
    setAwsFocused(false)
    setRedisFocused(false)
    setAuthFocused(false)
    setChargebeeFocused(false)
    setEmailFocused(false)
    setMenuVisible(false)
    setAnalyticsFocused(false)
  }
  const handleServer = () => {
    setIsSever(!isServer)
    setServerFocused(!serverFocused)
    setIsChargebee(false)
    setIsAws(false)
    setIsAuth(false)
    setIsClient(false)
    setIsGame(false)
    setIsRedis(false)
    setIsEmail(false)
    setIsAnalytics(false)
    setClientFocused(false)
    setAwsFocused(false)
    setRedisFocused(false)
    setAuthFocused(false)
    setChargebeeFocused(false)
    setEmailFocused(false)
    setGameFocused(false)
    setMenuVisible(false)
    setAnalyticsFocused(false)
  }

  const handleAnalytics = () => {
    setIsAnalytics(!isAnalytics)
    setAnalyticsFocused(!analyticsFocused)
    setIsSever(false)
    setIsChargebee(false)
    setIsAws(false)
    setIsAuth(false)
    setIsClient(false)
    setIsGame(false)
    setIsRedis(false)
    setIsEmail(false)
    setClientFocused(false)
    setAwsFocused(false)
    setRedisFocused(false)
    setAuthFocused(false)
    setChargebeeFocused(false)
    setEmailFocused(false)
    setGameFocused(false)
    setServerFocused(false)
  }

  React.useEffect(() => {
    if (isAuth) setContents(<Authentication />)
    if (isAws) setContents(<Aws />)
    if (isChargebee) setContents(<ChargeBee />)
    if (isRedis) setContents(<Redis />)
    if (isServer) setContents(<Server />)
    if (isEmail) setContents(<Email />)
    if (isGame) setContents(<GameServer />)
    if (isClient) setContents(<Client />)
    if (isAnalytics) setContents(<Analytics />)
  }, [isAws, isChargebee, isRedis, isServer, isEmail, isGame, isClient, isAnalytics])

  return (
    <div className={classes.root}>
      <div className={classes.invisible}>
        <div style={{ position: 'fixed' }}>
          <Button
            onClick={() => setMenuVisible(!menuVisible)}
            style={{ color: '#fff', fontSize: '3rem', background: '#43484F', position: 'fixed' }}
          >
            <MenuIcon />
          </Button>
        </div>
        {menuVisible && (
          <div className={classes.settings}>
            <Typography variant="h6" className={classes.settingsHeading}>
              {' '}
              Settings
            </Typography>
            <Sidebar
              handleAuth={handleAuth}
              handleAws={handleAws}
              handleChargebee={handleChargebee}
              handleRedis={handleRedis}
              handleEmail={handleEmail}
              handleClient={handleClient}
              handleGameServer={handleGameServer}
              handleServer={handleServer}
              handleAnalytics={handleAnalytics}
              serverFocused={serverFocused}
              awsFocused={awsFocused}
              emailFocused={emailFocused}
              gameFocused={gameFocused}
              clientFocused={clientFocused}
              authFocused={authFocused}
              chargebeeFocused={chargebeeFocused}
              redisFocused={redisFocused}
              analyticsFocused={analyticsFocused}
            />
          </div>
        )}
      </div>
      <Grid container spacing={3}>
        <Grid item sm={3} lg={3} className={classes.visible}>
          <Typography variant="h6" className={classes.settingsHeading}>
            {' '}
            Settings
          </Typography>
          <Sidebar
            handleAuth={handleAuth}
            handleAws={handleAws}
            handleChargebee={handleChargebee}
            handleRedis={handleRedis}
            handleEmail={handleEmail}
            handleClient={handleClient}
            handleGameServer={handleGameServer}
            handleServer={handleServer}
            handleAnalytics={handleAnalytics}
            serverFocused={serverFocused}
            awsFocused={awsFocused}
            emailFocused={emailFocused}
            gameFocused={gameFocused}
            clientFocused={clientFocused}
            authFocused={authFocused}
            chargebeeFocused={chargebeeFocused}
            redisFocused={redisFocused}
            analyticsFocused={analyticsFocused}
          />
        </Grid>
        <Grid item xs={12} sm={9} lg={9}>
          <div className={classes.contents}>{Contents}</div>
        </Grid>
      </Grid>
    </div>
  )
}

export default Setting
