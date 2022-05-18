import React from 'react'
import Creator from '../../Creator'
import { useParams } from 'react-router-dom'

//@ts-ignore
import styles from './CreatorPopup.module.scss'

export const CreatorPopup = () => {
  const { creatorId } = useParams()
  return <Creator creatorId={creatorId} />
}

export default CreatorPopup
