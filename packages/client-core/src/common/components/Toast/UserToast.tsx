import React from 'react'
import { connect } from 'react-redux'
import { selectUserState } from '../../../user/reducers/user/selector'
import Toast from './Toast'
// @ts-ignore
import styles from './toast.module.scss'
import { useTranslation } from 'react-i18next'

type Props = {
  user?: any
}

const mapStateToProps = (state: any): any => {
  return {
    user: selectUserState(state)
  }
}

const UserToast = (props: Props) => {
  const messages = props.user?.get('toastMessages')
  const { t } = useTranslation()
  const msgs = messages
    ? Array.from(messages).map((m: any) => {
        if (m.args.userAdded)
          return (
            <span>
              <span className={styles.userAdded}>{m.user.name}</span> {t('common:toast.joined')}
            </span>
          )
        else if (m.args.userRemoved)
          return (
            <span>
              <span className={styles.userRemoved}>{m.user.name}</span> {t('common:toast.left')}
            </span>
          )
      })
    : []

  return <Toast messages={msgs} customClass={styles.userToastContainer} />
}

export default connect(mapStateToProps)(UserToast)
