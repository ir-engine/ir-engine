/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import React, { useEffect } from 'react'
import { random } from 'lodash'

import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { useTranslation } from 'react-i18next'

import styles from './TipsAndTricks.module.scss'
import { connect } from 'react-redux'
import { getTipsAndTricks } from '@xrengine/client-core/src/socialmedia/reducers/tips_and_tricks/service'
import { selectTipsAndTricksState } from '@xrengine/client-core/src/socialmedia/reducers/tips_and_tricks/selector'
import { bindActionCreators, Dispatch } from 'redux'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'

const mapStateToProps = (state: any): any => {
  return {
    tipsAndTricksState: selectTipsAndTricksState(state)
  }
}
const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getTipsAndTricks: bindActionCreators(getTipsAndTricks, dispatch),
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})
interface Props {
  tipsAndTricksState?: any
  getTipsAndTricks?: any
  doLoginAuto?: any
}

export const TipsAndTricks = ({ tipsAndTricksState, getTipsAndTricks, doLoginAuto }: Props) => {
  const { t } = useTranslation()
  useEffect(() => {
    doLoginAuto(true)
    getTipsAndTricks()
  }, [])
  const tipsAndTricksList = tipsAndTricksState?.get('tips_and_tricks')

  return (
    <section className={styles.tipsandtricksContainer}>
      {tipsAndTricksList && tipsAndTricksList.length > 0 ? (
        tipsAndTricksList.map((item, itemindex) => (
          <Card className={styles.tipItem} square={true} elevation={0} key={itemindex}>
            <CardMedia
              className={styles.previewImage}
              component="video"
              src={item.videoUrl}
              title={item.title}
              controls
            />
            <CardContent className={styles.cardContent}>
              <Typography className={styles.tipsTitle}>{item.title}</Typography>
              <Typography className={styles.tipsDescription}>{item.description}</Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className={styles.noContent}>More Tips&Tricks will be available soon.</p>
      )}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(TipsAndTricks)
