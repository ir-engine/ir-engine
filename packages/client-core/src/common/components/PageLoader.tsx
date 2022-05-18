import React from 'react'
import styles from './Common.module.scss'
import { useTranslation } from 'react-i18next'

const PageLoader = (): any => {
  const { t } = useTranslation()
  return <div className={styles['page-loader']}>{t('common:pageLoader.loading')}</div>
}

export default PageLoader
