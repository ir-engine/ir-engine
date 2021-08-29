/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { getCreatorNotificationList } from '../../reducers/creator/service'
import NotificationCard from '../NotificationCard'
import { useTranslation } from 'react-i18next'

import styles from './NotificationList.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getCreatorNotificationList: bindActionCreators(getCreatorNotificationList, dispatch)
})

interface Props {
  creatorsState?: any
  getCreatorNotificationList?: any
}
const NotificationList = ({ creatorsState, getCreatorNotificationList }: Props) => {
  const { t } = useTranslation()
  useEffect(() => {
    getCreatorNotificationList()
  }, [])
  const notificationList =
    creatorsState && creatorsState.get('creators') ? creatorsState.get('currentCreatorNotifications') : null
  return (
    <section className={styles.notificationsContainer}>
      <Typography variant="h2">{t('social:notification.activity')}</Typography>
      {notificationList && notificationList.map((item, key) => <NotificationCard key={key} notification={item} />)}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationList)
