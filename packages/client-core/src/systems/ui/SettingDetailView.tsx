import { createState } from '@speigg/hookstate'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UserSetting } from '@xrengine/common/src/interfaces/User'
import { EngineRendererAction, useEngineRendererState } from '@xrengine/engine/src/renderer/EngineRendererState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { dispatchAction } from '@xrengine/hyperflux'

import { AuthService, useAuthState } from '../../user/services/AuthService'

const styles = {
  container: {
    width: '500px',
    minHeight: '208px',
    bottom: '75px',
    padding: '0 30px',
    borderRadius: '20px',
    backgroundColor: 'var(--popupBackground)',
    boxShadow: '16px 16px 32px #11111159',
    color: 'var(--textColor)',
    maxHeight: 'calc(100vh - 100px)',
    overflow: 'auto',
    touchAction: 'auto'
  },
  settingView: { margin: '30px 0' },
  audioSection: { color: 'var(--textColor)', position: 'relative' },
  title: {
    margin: '0px',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '400',
    fontSize: '2.125rem',
    lineHeight: '1.235',
    letterSpacing: '0.00735em'
  },
  sectionRow: { display: 'flex', alignItems: 'center' },
  iconSpan: {
    width: '24px',
    height: '24px',
    flexShrink: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    outline: 'none!important'
  },
  iconSvg: {
    color: 'var(--buttonOutlined)',
    width: '100%',
    height: '100%',
    userSelect: 'none',
    display: 'inline-block',
    fill: 'currentcolor',
    flexShrink: '0',
    fontSize: '1.5rem'
  },
  label: {
    marginLeft: '10px',
    fontSize: '14px',
    width: '100px',
    display: 'inline-block',
    flexShrink: '0',
    fontFamily: 'Roboto'
  },
  slider: {
    width: '100%',
    accentColor: 'var(--iconButtonSelectedBackground)',
    'input[range]::webkit-slider-track': {
      backgroundColor: 'var(--iconButtonSelectedBackground)'
    }
  },
  graphicsSection: { marginTop: '25px', color: 'var(--textColor)', position: 'relative' },
  graphicsCheckBoxRow: { margin: '5px 20px 0 0', display: 'flex', alignItems: 'center' },
  checkBoxRow: {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    verticalAlign: 'middle',
    margin: '4px 20px 0 0'
  },
  checkBoxLabel: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '400',
    fontSize: '1rem',
    lineHeight: '1.5',
    letterSpacing: '0.00938em'
  },
  checkBoxSpan: {
    padding: '0',
    color: 'var(--iconButtonSelectedBackground)',
    marginRight: '10px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
    outline: '0px',
    border: '0px',
    cursor: 'pointer',
    userSelect: 'none',
    verticalAlign: 'middle',
    appearance: 'none',
    textDecoration: 'none'
  },
  checkBoxInput: {
    cursor: 'inherit',
    position: 'absolute',
    opacity: '0',
    width: '100%',
    height: '100%',
    top: '0px',
    left: '0px',
    margin: '0px',
    padding: '0px',
    zIndex: '1'
  },
  checkBoxSvg: {
    fontSize: '24px',
    userSelect: 'none',
    width: '1em',
    height: '1em',
    display: 'inline-block',
    fill: 'currentcolor',
    flexShrink: '0'
  },
  automaticContainer: {
    marginTop: '5px',
    position: 'absolute',
    top: '-8px',
    right: '0',
    display: 'flex',
    alignItems: 'center'
  },
  automaticRow: {
    margin: '0 -2px 0 0',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    verticalAlign: 'middle',
    flexDirection: 'row-reverse'
  },
  automaticCheckBoxSpan: {
    marginLeft: '10px',
    marginRight: '0',
    padding: '0',
    color: 'var(--iconButtonSelectedBackground)',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    outline: '0px',
    border: '0px',
    cursor: 'pointer',
    userSelect: 'none',
    verticalAlign: 'middle',
    appearance: 'none',
    textDecoration: 'none'
  }
}

export function createSettingDetailView() {
  return createXRUI(SettingDetailView, createSettingDetailState())
}

function createSettingDetailState() {
  return createState({
    settingMenuOpen: false
  })
}

const SettingDetailView = () => {
  const { t } = useTranslation()
  const rendererState = useEngineRendererState()

  const authState = useAuthState()
  const selfUser = authState.user
  const [userSettings, setUserSetting] = useState<UserSetting>(selfUser?.user_setting.value!)

  const setUserSettings = (newSetting: any): void => {
    const setting = { ...userSettings, ...newSetting }
    setUserSetting(setting)
    AuthService.updateUserSettings(selfUser.user_setting.value?.id, setting)
  }

  return (
    <div style={styles.container as {}} xr-layer="true">
      <div style={styles.settingView as {}}>
        <section style={styles.audioSection as {}}>
          <h4 style={styles.title as {}}>{t('user:usermenu.setting.audio')}</h4>
          <div style={styles.sectionRow as {}}>
            <span style={styles.iconSpan as {}}>
              <svg style={styles.iconSvg as {}} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
              </svg>
            </span>
            <span style={styles.label as {}}>{t('user:usermenu.setting.lbl-volume')}</span>

            <input
              style={styles.slider as {}}
              type="range"
              min="1"
              max="100"
              value={userSettings?.volume == null ? 100 : userSettings?.volume}
              onChange={(event: any) => {
                setUserSettings({ volume: parseInt(event.target.value) })
                const mediaElements = document.querySelectorAll<HTMLMediaElement>('video, audio')
                for (let i = 0; i < mediaElements.length; i++) {
                  mediaElements[i].volume = parseInt(event.target.value) / 100
                }
              }}
            ></input>
          </div>

          <div style={styles.sectionRow as {}}>
            <span style={styles.iconSpan as {}}>
              <svg
                style={styles.iconSvg as {}}
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
                data-testid="MicIcon"
              >
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path>
              </svg>
            </span>
            <span style={styles.label as {}}>{t('user:usermenu.setting.lbl-microphone')}</span>
            <input
              style={styles.slider as {}}
              type="range"
              min="1"
              max="100"
              value={userSettings?.microphone == null ? 100 : userSettings?.microphone}
              onChange={(event: any) => {
                setUserSettings({ microphone: parseInt(event.target.value) })
              }}
            ></input>
          </div>
        </section>
        <section style={styles.graphicsSection as {}}>
          <h4 style={styles.title as {}}>{t('user:usermenu.setting.graphics')}</h4>
          <div style={styles.sectionRow as {}}>
            <span style={styles.iconSpan as {}}>
              <svg
                style={styles.iconSvg as {}}
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
                data-testid="BlurLinearIcon"
              >
                <path d="M5 17.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM9 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zM3 21h18v-2H3v2zM5 9.5c.83 0 1.5-.67 1.5-1.5S5.83 6.5 5 6.5 3.5 7.17 3.5 8 4.17 9.5 5 9.5zm0 4c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM9 17c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8-.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM3 3v2h18V3H3zm14 5.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm0 4c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM13 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"></path>
              </svg>
            </span>
            <span style={styles.label as {}}>{t('user:usermenu.setting.lbl-resolution')}</span>

            <input
              style={styles.slider as {}}
              type="range"
              min="1"
              max="5"
              step="1"
              value={rendererState.qualityLevel.value}
              onChange={(event: any) => {
                dispatchAction(EngineRendererAction.setQualityLevel(parseInt(event.target.value)))
                dispatchAction(EngineRendererAction.setAutomatic(false))
              }}
            ></input>
          </div>

          <div style={styles.graphicsCheckBoxRow as {}}>
            <label style={styles.checkBoxRow as {}}>
              <span
                style={styles.checkBoxSpan as {}}
                onClick={() => {
                  dispatchAction(EngineRendererAction.setPostProcessing(!rendererState.usePostProcessing.value))
                  dispatchAction(EngineRendererAction.setAutomatic(false))
                }}
              >
                <input
                  style={styles.checkBoxInput as {}}
                  checked={rendererState.usePostProcessing.value}
                  type="checkbox"
                  data-indeterminate="false"
                  onChange={(value: any) => {
                    dispatchAction(EngineRendererAction.setPostProcessing(value.target.checked))
                    dispatchAction(EngineRendererAction.setAutomatic(false))
                  }}
                />
                <svg style={styles.checkBoxSvg as {}} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                  {rendererState.usePostProcessing.value ? (
                    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                  ) : (
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                  )}
                </svg>
              </span>
              <span style={styles.checkBoxLabel as {}}>{t('user:usermenu.setting.lbl-pp')}</span>
            </label>
            <label style={styles.checkBoxRow as {}}>
              <span
                style={styles.checkBoxSpan as {}}
                onClick={() => {
                  dispatchAction(EngineRendererAction.setShadows(!rendererState.useShadows.value))
                  dispatchAction(EngineRendererAction.setAutomatic(false))
                }}
              >
                <input
                  style={styles.checkBoxInput as {}}
                  type="checkbox"
                  data-indeterminate="false"
                  checked={rendererState.useShadows.value}
                  onChange={(value: any) => {
                    dispatchAction(EngineRendererAction.setShadows(value.target.checked))
                    dispatchAction(EngineRendererAction.setAutomatic(false))
                  }}
                />
                <svg style={styles.checkBoxSvg as {}} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                  {rendererState.useShadows.value ? (
                    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                  ) : (
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                  )}
                </svg>
              </span>
              <span style={styles.checkBoxLabel as {}}>{t('user:usermenu.setting.lbl-shadow')}</span>
            </label>
          </div>
          <div style={styles.automaticContainer as {}}>
            <label style={styles.automaticRow as {}}>
              <span style={styles.automaticCheckBoxSpan as {}}>
                <input
                  style={styles.checkBoxInput as {}}
                  type="checkbox"
                  data-indeterminate="false"
                  checked={rendererState.automatic.value}
                  onChange={(value: any) => {
                    dispatchAction(EngineRendererAction.setAutomatic(value.target.checked))
                  }}
                />
                <svg style={styles.checkBoxSvg as {}} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                  {rendererState.automatic.value ? (
                    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                  ) : (
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                  )}
                </svg>
              </span>
              <span style={styles.checkBoxLabel as {}}>{t('user:usermenu.setting.lbl-automatic')}</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}
