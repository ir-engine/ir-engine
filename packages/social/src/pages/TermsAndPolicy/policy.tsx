import policy from '../../components/TermsandPolicy/policy'
import React from 'react'
import './TermsandPolicy.module.scss'
import { Button } from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

const Policy = React.memo(() => {
  const { t } = useTranslation()
  const history = useHistory()
  return (
    <div
      style={{
        padding: '2% 5%'
      }}
    >
      <Button
        variant="text"
        className="backButton"
        onClick={() => {
          history.goBack()
        }}
      >
        <ArrowBackIosIcon />
        {t('social:creatorForm.back')}
      </Button>
      <div dangerouslySetInnerHTML={{ __html: policy }} />
    </div>
  )
})

export default Policy
