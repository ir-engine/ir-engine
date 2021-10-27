import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import Button from '@material-ui/core/Button'
import CardContent from '@material-ui/core/CardContent'
import styles from '../Inventory.module.scss'
import { useTranslation } from 'react-i18next'
import { LazyImage } from '../../../../common/components/LazyImage'
const PurchaseMarketItemMenu = (props: any): any => {
  const { t } = useTranslation()

  const handleBuyNow = () => {}

  const handleCancel = () => {}

  return (
    <div className={styles.purchaseMarketItemPanel}>
      <div className={styles.container}>
        <span className={styles.itemNumber}>#456656</span>
        <span className={styles.itemName}>Headline: Amet minim mollit non deserunt</span>
        <span className={styles.itemInfo}>Product Dimensions ‏ : ‎ 6.5 x 2.29 x 1.97 inches; 2.54 Pounds</span>
        <span className={styles.itemInfo}>Item model number ‏ : ‎ ALK AA48FFP-U AMZ</span>
        <span className={styles.itemInfo}>Batteries ‏ : ‎ 48 AA batteries required.</span>
        <span className={styles.itemInfo}>Date First Available ‏ : ‎ August 1, 2020</span>
        <span className={styles.itemInfo}>Manufacturer ‏ : ‎ Amazon Basics</span>
        <span className={styles.itemInfo}>ASIN ‏ : ‎ B00MNV8E0C</span>
        <span className={styles.itemInfo}>Country of Origin ‏ : ‎ China</span>
        <span className={styles.itemInfo}>
          Domestic Shipping: Currently, item can be shipped only within the U.S. and to APO/FPO addresses. For APO/FPO
          shipments, please check with the manufacturer regarding warranty and support issues.
        </span>
        <div className={styles.itemPreviewImage}>
          <LazyImage src={'/itemPlate.png'} alt={''} />
        </div>
        <span className={styles.itemPrice}>{t('user:inventory.price')} 0.25114 ETH</span>
        <Button onClick={handleBuyNow} className={styles.buyNowBtn}>
          {t('user:inventory.buyNow')}
        </Button>
        <Button onClick={handleCancel} className={styles.cancelBtn}>
          {t('user:inventory.cancel')}
        </Button>
      </div>
    </div>
  )
}

export default PurchaseMarketItemMenu
