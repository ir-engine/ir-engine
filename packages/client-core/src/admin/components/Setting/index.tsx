import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import { Grid, IconButton, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import React, { useEffect, useRef, useState } from 'react'
import Analytics from './Analytics'
import Authentication from './Authentication'
import Aws from './Aws'
import ChargeBee from './Chargebee'
import Client from './Client'
import Email from './Email'
import GameServer from './GameServer'
import Redis from './Redis'
import Server from './Server'
import Sidebar from './SideBar'
import { useStyles } from './styles'

const Setting = () => {
  const classes = useStyles()
  const rootRef = useRef<any>()
  const [isAws, setIsAws] = useState(false)
  const [isServer, setIsSever] = useState(false)
  const [isEmail, setIsEmail] = useState(false)
  const [isGame, setIsGame] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [isChargebee, setIsChargebee] = useState(false)
  const [isRedis, setIsRedis] = useState(false)
  const [isAnalytics, setIsAnalytics] = useState(true)
  const [Contents, setContents] = useState(<Analytics />)
  const [awsFocused, setAwsFocused] = useState(false)
  const [serverFocused, setServerFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [gameFocused, setGameFocused] = useState(false)
  const [clientFocused, setClientFocused] = useState(false)
  const [authFocused, setAuthFocused] = useState(false)
  const [chargebeeFocused, setChargebeeFocused] = useState(false)
  const [redisFocused, setRedisFocused] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [analyticsFocused, setAnalyticsFocused] = useState(true)

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
    !isAuth && setMenuVisible(false)
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
    !isAws && setMenuVisible(false)
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
    !isChargebee && setMenuVisible(false)
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
    !isRedis && setMenuVisible(false)
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
    !isEmail && setMenuVisible(false)
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
    !isClient && setMenuVisible(false)
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
    !isGame && setMenuVisible(false)
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
    !isServer && setMenuVisible(false)
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
    !isAnalytics && setMenuVisible(false)
    setServerFocused(false)
  }

  useEffect(() => {
    rootRef?.current?.scrollIntoView()
  }, [menuVisible])

  useEffect(() => {
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
    <div className={classes.root} ref={rootRef}>
      <div className={classes.invisible}>
        <div style={{ position: 'fixed', zIndex: 1 }}>
          <Button
            size="medium"
            onClick={() => setMenuVisible(!menuVisible)}
            style={{ color: '#fff', fontSize: '3rem', background: '#393d42', position: 'fixed' }}
          >
            <MenuIcon />
          </Button>
        </div>
        {menuVisible && (
          <div className={classes.hoverSettings}>
            <Grid display="flex" flexDirection="row" alignItems="center" marginBottom="10px">
              <Typography variant="h6" className={classes.hoverSettingsHeading}>
                Settings
              </Typography>
              <IconButton
                onClick={() => setMenuVisible(!menuVisible)}
                style={{
                  color: 'orange',
                  fontSize: '3rem',
                  background: 'transparent',
                  position: 'absolute',
                  right: '10px'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
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
        <Grid item xs={12} sm={12} md={12} lg={9}>
          <div className={classes.contents}>{Contents}</div>
        </Grid>
      </Grid>
    </div>
  )
}

export default Setting
