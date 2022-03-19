import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import { Grid, IconButton, Typography } from '@mui/material'
import Button from '@mui/material/Button'

import styles from '../../styles/settings.module.scss'
import Analytics from './Analytics'
import Authentication from './Authentication'
import Aws from './Aws'
import ChargeBee from './Chargebee'
import Client from './Client'
import Email from './Email'
import GameServer from './GameServer'
import Project from './Project'
import Redis from './Redis'
import Server from './Server'
import Sidebar from './SideBar'

const Setting = () => {
  const rootRef = useRef<any>()
  const [isAws, setIsAws] = useState(false)
  const [isProject, setIsProject] = useState(false)
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
  const [projectFocused, setProjectFocused] = useState(false)
  const [serverFocused, setServerFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [gameFocused, setGameFocused] = useState(false)
  const [clientFocused, setClientFocused] = useState(false)
  const [authFocused, setAuthFocused] = useState(false)
  const [chargebeeFocused, setChargebeeFocused] = useState(false)
  const [redisFocused, setRedisFocused] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [analyticsFocused, setAnalyticsFocused] = useState(true)
  const { t } = useTranslation()

  const handleAuth = () => {
    setIsAuth(!isAuth)
    setAuthFocused(!authFocused)
    setIsProject(false)
    setProjectFocused(false)
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
    setIsProject(false)
    setProjectFocused(false)
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
    setIsProject(false)
    setProjectFocused(false)
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
    setIsProject(false)
    setProjectFocused(false)
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
    setIsProject(false)
    setProjectFocused(false)
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
    setIsProject(false)
    setProjectFocused(false)
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
    setIsProject(false)
    setProjectFocused(false)
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
    setIsProject(false)
    setProjectFocused(false)
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
    setIsProject(false)
    setProjectFocused(false)
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

  const handleProject = () => {
    setIsProject(!isProject)
    setProjectFocused(!projectFocused)
    setIsAnalytics(false)
    setAnalyticsFocused(false)
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
    !isProject && setMenuVisible(false)
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
    if (isProject) setContents(<Project />)
  }, [isAws, isChargebee, isRedis, isServer, isEmail, isGame, isClient, isAnalytics, isProject])

  return (
    <div ref={rootRef}>
      <div className={styles.invisible}>
        <div style={{ position: 'fixed', zIndex: 1 }}>
          <Button size="medium" onClick={() => setMenuVisible(!menuVisible)} className={styles.menuBtn}>
            <MenuIcon />
          </Button>
        </div>
        {menuVisible && (
          <div className={styles.hoverSettings}>
            <Grid display="flex" flexDirection="row" alignItems="center" marginBottom="10px">
              <Typography variant="h6" className={styles.hoverSettingsHeading}>
                {t('admin:components.setting.settings')}
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
              handleProject={handleProject}
              serverFocused={serverFocused}
              awsFocused={awsFocused}
              emailFocused={emailFocused}
              gameFocused={gameFocused}
              clientFocused={clientFocused}
              authFocused={authFocused}
              chargebeeFocused={chargebeeFocused}
              redisFocused={redisFocused}
              analyticsFocused={analyticsFocused}
              projectFocused={projectFocused}
            />
          </div>
        )}
      </div>
      <Grid container spacing={3}>
        <Grid item sm={3} lg={3} className={styles.visible}>
          <Typography variant="h6" className={styles.settingsHeading}>
            {t('admin:components.setting.settings')}
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
            handleProject={handleProject}
            serverFocused={serverFocused}
            awsFocused={awsFocused}
            emailFocused={emailFocused}
            gameFocused={gameFocused}
            clientFocused={clientFocused}
            authFocused={authFocused}
            chargebeeFocused={chargebeeFocused}
            redisFocused={redisFocused}
            analyticsFocused={analyticsFocused}
            projectFocused={projectFocused}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={9}>
          <div className={styles.contents}>{Contents}</div>
        </Grid>
      </Grid>
    </div>
  )
}

export default Setting
