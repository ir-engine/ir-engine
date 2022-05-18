/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import styles from './SimpleModal.module.scss'
import { Modal, Card } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
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

  // return (
  //   <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
  //     <DialogTitle className={styles.dialogTitle}>{renderListTitle()}</DialogTitle>
  //     {list?.length > 0 ? (
  //       list?.map((creator, creatorIndex) => <CreatorAsTitle creator={creator} key={creatorIndex} />)
  //     ) : (
  //       <p>{t('social:simpleModal.emptyList')}</p>
  //     )}
  //   </Dialog>
  // )

  console.log(list)
  return (
    <Modal
      onClose={handleClose}
      open={open}
      // aria-labelledby="simple-dialog-title"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Card
        style={{
          width: 'auto',
          height: '60%',
          overflow: 'auto',
          padding: '1%'
        }}
      >
        {list?.length > 0 ? (
          list?.map((creator, creatorIndex) => <CreatorAsTitle creator={creator} key={creatorIndex} />)
        ) : (
          <p>{t('social:simpleModal.emptyList')}</p>
        )}
      </Card>
    </Modal>
  )
}

export default SimpleModal
