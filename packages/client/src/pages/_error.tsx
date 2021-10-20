import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

const Error = ({ statusCode }: { statusCode?: number }): any => {
  const { t } = useTranslation()
  return (
    <Fragment>
      <p>{statusCode ? t('error.withStatusCode', { code: statusCode }) : t('error.withoutStatusCode')}</p>
      <a href="/">{t('error.goHomeLink')}</a>
    </Fragment>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
