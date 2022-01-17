import ContactForm from '@xrengine/client-core/src/common/components/ContactForm'
import React from 'react'
import { Helmet } from 'react-helmet'
// import { Capacitor } from '@capacitor/core'
import { Trans, useTranslation } from 'react-i18next'
import { Redirect, useHistory } from 'react-router-dom'

const ROOT_REDIRECT: any = globalThis.process.env['VITE_ROOT_REDIRECT']

export const HomePage = (): any => {
  console.log('homepage')
  const router = useHistory()
  const { t } = useTranslation()
  // useEffect(() => {
  //   if (Capacitor.isNative) {
  //     router.push('/plugintest')
  //   }
  // }, [])

  if (ROOT_REDIRECT && ROOT_REDIRECT.length > 0 && ROOT_REDIRECT !== 'false') {
    const redirectParsed = new URL(ROOT_REDIRECT)
    if (redirectParsed.protocol == null) return <Redirect to={ROOT_REDIRECT} />
    else window.location.href = ROOT_REDIRECT
  } else
    return (
      <div className="lander">
        <style>
          {`
            [class*=lander] {
                pointer-events: auto;
            }
          `}
        </style>
        <Helmet>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;800&display=swap"
            rel="stylesheet"
          />
        </Helmet>
        <div className="main-background">
          <div className="img-container">
            <img src="static/main-background.png" alt="" />
          </div>
        </div>
        <nav className="navbar">
          <div className="logo-section">
            <object className="lander-logo" data="static/overlay_mark.svg" />
            <div className="logo-bottom">
              <span className="gray-txt">{t('index.by')}</span>
              <span className="gradiant-txt">{t('index.xr')}</span>
              <span className="white-txt">{t('index.foundation')}</span>
            </div>
          </div>
        </nav>

        <div className="main-section">
          <div className="desc">
            <Trans t={t} i18nKey="index.description">
              <span>Realtime social apps for everyone,</span>
              <br />
              <span className="second-line">
                at <span className="metaverse">Metaverse</span> scale.
              </span>
            </Trans>
          </div>
          <div className="form-container">
            <ContactForm />
          </div>
        </div>

        <div className="link-container">
          <div className="link-block">
            <a target="_blank" className="icon" href="https://discord.gg/mQ3D4FE">
              <img src="static/discord.svg" />
            </a>
            <a target="_blank" className="icon" href="https://github.com/XRFoundation">
              <img src="static/github.svg" />
            </a>
          </div>
          <div className="logo-bottom">
            <span className="gray-txt">{t('index.by')}</span>
            <span className="gradiant-txt">{t('index.xr')}</span>
            <span className="white-txt">{t('index.foundation')}</span>
          </div>
        </div>
      </div>
    )
}

export default HomePage
