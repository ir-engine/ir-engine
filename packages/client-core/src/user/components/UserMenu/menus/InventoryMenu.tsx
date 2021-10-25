import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { NavigateNext, NavigateBefore, Check, ArrowBack, PersonAdd, Delete, Close } from '@material-ui/icons'
import styles from '../UserMenu.module.scss'
import { useTranslation } from 'react-i18next'
import { LazyImage } from '../../../../common/components/LazyImage'

const InventoryMenu = (props: any): any => {
  const MAX_ITEMS_PER_PAGE = 9
  const MIN_ITEMS_PER_PAGE = 6

  const getItemPerPage = () => (window.innerWidth > 768 ? MAX_ITEMS_PER_PAGE : MIN_ITEMS_PER_PAGE)
  const { t } = useTranslation()

  const [page, setPage] = useState(0)
  const [itemPerPage, setItemPerPage] = useState(getItemPerPage())
  const [selectedItemId, setSelectedItemId] = useState('')
  const [isItemLoaded, setItemLoaded] = useState(false)

  useEffect((() => {
    function handleResize() {
      setItemPerPage(getItemPerPage())
    }

    window.addEventListener('resize', handleResize)

    return (_) => {
      window.removeEventListener('resize', handleResize)
    }
  }) as any)

  useEffect(() => {
    props.fetchInventoryItemList()
  }, [isItemLoaded])

  useEffect(() => {
    if (page * itemPerPage >= props.itemList.length) {
      if (page === 0) return
      setPage(page - 1)
    }
  }, [props.itemList])

  const loadNextItems = (e) => {
    e.preventDefault()
    if ((page + 1) * itemPerPage >= props.itemList.length) return
    setPage(page + 1)
  }
  const loadPreviousItems = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  const selectItem = (itemResources: any) => {
    setSelectedItemId(itemResources.id)
  }

  const renderInventoryItemList = () => {
    const itemList = []
    const startIndex = page * itemPerPage
    const endIndex = startIndex + itemPerPage
    for (let i = startIndex; i < endIndex; i++) {
      const inventoryItem = props.itemList.length > i ? props.itemList[i] : null

      itemList.push(
        <Card key={inventoryItem?.id || 'inventery-ite,-key-' + i} className={`${styles.itemPreviewWrapper}`}>
          {inventoryItem && (
            <CardContent onClick={() => inventoryItem && selectItem(inventoryItem)}>
              <LazyImage key={inventoryItem?.id} src={inventoryItem?.image} alt={inventoryItem?.name} />
              <div className={styles.itemName}>{inventoryItem.name}</div>
            </CardContent>
          )}
        </Card>
      )
    }
    return itemList
  }

  return (
    <div className={styles.inventoryPanel}>
      <section className={styles.inventoryContainer}>{renderInventoryItemList()}</section>
      <section className={styles.controlContainer}>
        <button
          type="button"
          className={`${styles.iconBlock} ${page === 0 ? styles.disabled : ''}`}
          onClick={loadPreviousItems}
        >
          <NavigateBefore />
        </button>
        <div className={styles.pageBlock}>
          {t('user:inventoryMenu.page')} {page + 1} / {Math.ceil(props.itemList.length / itemPerPage)}
        </div>
        <button
          type="button"
          className={`${styles.iconBlock} ${(page + 1) * itemPerPage >= props.itemList.length ? styles.disabled : ''}`}
          onClick={loadNextItems}
        >
          <NavigateNext />
        </button>
      </section>
    </div>
  )
}

export default InventoryMenu
