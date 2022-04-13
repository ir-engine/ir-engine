import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './index.module.scss'

const PageLoader = (): JSX.Element => {
  const { t } = useTranslation()
  return <div className={styles['page-loader']}>{t('common:pageLoader.loading')}</div>
}

export default PageLoader
