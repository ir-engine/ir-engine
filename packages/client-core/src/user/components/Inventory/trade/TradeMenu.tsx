import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import styles from '../Inventory.module.scss'
import { useTranslation } from 'react-i18next'
import { LazyImage } from '../../../../common/components/LazyImage'

const TradeMenu = (props: any): any => {
  const { t } = useTranslation()

  const renderTradeItemList = () => {
    const itemList = []

    for (let i = 0; i < 10; i++) {
      itemList.push(
        <Card key={'trade-item-key-' + i} className={`${styles.itemPreviewWrapper}`}>
          <CardContent onClick={() => {}}>
            <LazyImage key={'trade-img-key-' + i} src={'/itemPlate.png'} alt={''} />
          </CardContent>
        </Card>
      )
    }
    return itemList
  }

  const headerItem = (title, coins) => {
    return (
      <div>
        <span className={styles.tradeTitle}>{title}</span>
        <div className={styles.userCoins}>
          {' '}
          <img className={styles.coinImage} src={'/inventory/coins.png'} alt={''} />
          <span className={styles.coins}>{coins}</span>
        </div>
      </div>
    )
  }

  const actionButton = (imagePath, isDisable, clickAction) => {
    return (
      <Card className={`${styles.btnAction} ${isDisable && styles.disable}`}>
        <CardContent onClick={clickAction}>
          <LazyImage src={imagePath} alt={''} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={styles.tradePanel}>
      <div className={`${styles.panel} ${styles.tradePanelLeft}`}>
        {headerItem('You', 214257)}
        <section className={styles.tradeContainer}>{renderTradeItemList()}</section>
        <div className={styles.actions}>
          {actionButton('/inventory/cross.svg', false, () => {})}
          {actionButton('/inventory/handshake.svg', false, () => {})}
        </div>
      </div>
      <div className={`${styles.panel} ${styles.tradePanelRight}`}>
        {headerItem('Boredgamer22', 214257)}
        <section className={styles.tradeContainer}>{renderTradeItemList()}</section>
        <div className={styles.actions}>{actionButton('/inventory/handshake.svg', true, () => {})}</div>
      </div>
    </div>
  )
}

export default TradeMenu
