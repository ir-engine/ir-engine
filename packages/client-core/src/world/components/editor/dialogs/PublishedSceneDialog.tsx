import PropTypes from 'prop-types'
import React from 'react'
import PreviewDialog from './PreviewDialog'
import { Button } from '../inputs/Button'
import { useTranslation } from 'react-i18next'

/**
 * PublishedSceneDialog used to show dialog when scene get published.
 *
 * @author Robert Long
 * @param       {function} onCancel
 * @param       {string} sceneName
 * @param       {string} sceneUrl
 * @param       {string} screenshotUrl
 * @param       {any} props
 * @constructor
 */
export function PublishedSceneDialog({ onCancel, sceneName, sceneUrl, screenshotUrl, ...props }) {
  const { t } = useTranslation()
  return (
    <PreviewDialog imageSrc={screenshotUrl} title={t('editor:dialog.published.title')} {...props}>
      <h1>{sceneName}</h1>
      <p>{t('editor:dialog.published.header')}</p>
      <Button as="a" href={sceneUrl} target="_blank">
        {t('editor:dialog.published.lbl-view')}
      </Button>
    </PreviewDialog>
  )
}

/**
 * Declairing propTypes for PublishedSceneDialog.
 *
 * @author Robert Long
 * @type {Object}
 */
PublishedSceneDialog.propTypes = {
  onCancel: PropTypes.func.isRequired,
  sceneName: PropTypes.string.isRequired,
  sceneUrl: PropTypes.string.isRequired,
  screenshotUrl: PropTypes.string.isRequired
}
export default PublishedSceneDialog
