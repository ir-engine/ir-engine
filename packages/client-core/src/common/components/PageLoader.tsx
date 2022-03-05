import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Common.module.scss'

const PageLoader = (): any => {
  const { t } = useTranslation()
  return <div className={styles['page-loader']}>{t('common:pageLoader.loading')}</div>
}

export default PageLoader
