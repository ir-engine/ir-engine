/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import styles from './SimpleModal.module.scss'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import CreatorAsTitle from '../CreatorAsTitle'
import { useTranslation } from 'react-i18next'

interface Props {
  onClose: any
  selectedValue?: any
  open?: boolean
  list: any[]
  type?: string
}
const SimpleModal = (props: Props): any => {
  const { onClose, selectedValue, open, list, type } = props
  const { t } = useTranslation()

  const handleClose = () => {
    onClose(selectedValue)
  }

  const renderListTitle = () => {
    switch (type) {
      case 'feed-fires':
      case 'comment-fires':
        return (list ? list?.length : '0') + t('social:simpleModal.flames')
      case 'followers':
        return (list ? list?.length : '0') + t('social:simpleModal.followers')
      case 'following':
        return (list ? list?.length : '0') + t('social:simpleModal.following')
      default:
        return ''
    }
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle className={styles.dialogTitle}>{renderListTitle()}</DialogTitle>
      {list?.length > 0 ? (
        list?.map((creator, creatorIndex) => <CreatorAsTitle creator={creator} key={creatorIndex} />)
      ) : (
        <p>{t('social:simpleModal.emptyList')}</p>
      )}
    </Dialog>
  )
}

export default SimpleModal
