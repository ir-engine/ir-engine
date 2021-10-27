import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import styles from '../Inventory.module.scss'
import { useTranslation } from 'react-i18next'
import { LazyImage } from '../../../../common/components/LazyImage'
import Pagination from '@mui/material/Pagination'
const PurchaseMarketMenu = (props: any): any => {
  const { t } = useTranslation()

  const [page, setPage] = useState(0)
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className={styles.purchaseMarketPanel}>
      <div className={styles.pagination}>
        <Pagination defaultPage={1} count={100} page={page} onChange={handlePageChange} />
      </div>
    </div>
  )
}

export default PurchaseMarketMenu
