import { Paginated } from '@feathersjs/feathers'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Location, LocationSeed } from '@etherealengine/common/src/interfaces/Location'
import Button from '@etherealengine/ui/src/Button'
import Icon from '@etherealengine/ui/src/Icon'
import InputAdornment from '@etherealengine/ui/src/InputAdornment'
import Table from '@etherealengine/ui/src/Table'
import TableBody from '@etherealengine/ui/src/TableBody'
import TableCell from '@etherealengine/ui/src/TableCell'
import TableHead from '@etherealengine/ui/src/TableHead'
import TablePagination from '@etherealengine/ui/src/TablePagination'
import TableRow from '@etherealengine/ui/src/TableRow'
import TextField from '@etherealengine/ui/src/TextField'
import Typography from '@etherealengine/ui/src/Typography'

import { API } from '../../../../API'
import styles from '../index.module.scss'

interface Props {
  changeActiveLocation: (location: Location) => void
}
const LocationMenu = (props: Props) => {
  const [page, setPage] = useState(0)
  const [locationDetails, setLocationsDetails] = useState<Paginated<Location>>(null!)
  const ROWS_PER_PAGE = 10
  const { t } = useTranslation()
  const tableHeaders = [
    { id: 'name', numeric: false, disablePadding: false, label: t('user:usermenu.locationTable.col-name') },
    { id: 'sceneId', numeric: false, disablePadding: false, label: t('user:usermenu.locationTable.col-scene') },
    {
      id: 'maxUsersPerInstance',
      numeric: true,
      disablePadding: false,
      label: t('user:usermenu.locationTable.col-maxuser')
    }
  ]

  useEffect(() => {
    fetchLocations(0, ROWS_PER_PAGE)
  }, [])

  const fetchLocations = (page: number, rows: number, search?: string) => {
    API.instance.client
      .service('location')
      .find({
        query: {
          $limit: rows,
          $skip: page * rows,
          adminnedLocations: true,
          search
        }
      })
      .then((res: Paginated<Location>) => {
        setLocationsDetails(res)
      })
  }

  const handlePageChange = (_, page) => {
    fetchLocations(page, ROWS_PER_PAGE)
    setPage(page)
  }

  let isTimerStarted = false
  const handleSearch = () => {
    if (isTimerStarted) return

    isTimerStarted = true

    setTimeout(() => {
      isTimerStarted = false
      const value = (document.getElementById('searchbox') as any).value
      fetchLocations(page, ROWS_PER_PAGE, value)
    }, 500)
  }

  return (
    <div className={styles.menuPanel}>
      <section className={styles.locationPanel}>
        <Typography variant="h2">{t('user:usermenu.locationTable.title')}</Typography>
        {!locationDetails ? (
          <section>{t('user:usermenu.locationTable.loading')}</section>
        ) : (
          <>
            <section className={styles.control}>
              <TextField
                margin="none"
                size="small"
                placeholder={t('user:usermenu.locationTable.lbl-search')}
                variant="outlined"
                id="searchbox"
                onChange={handleSearch}
                className={styles.searchbox}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Icon type="Search" />
                    </InputAdornment>
                  )
                }}
              />
              <Button className={styles.newLocation} onClick={() => props.changeActiveLocation(LocationSeed)}>
                <Icon type="Add" />
                {t('user:usermenu.locationTable.lbl-new')}
              </Button>
            </section>
            <section className={styles.tableContainer}>
              <Table size="small" className={styles.locationTable}>
                <TableHead className={styles.tableHead}>
                  <TableRow className={styles.trow}>
                    {tableHeaders.map((headCell) => (
                      <TableCell className={styles.tcell} key={headCell.id}>
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody className={styles.tablebody}>
                  {locationDetails.data?.map((row, i) => {
                    return (
                      <TableRow
                        className={styles.tableRow}
                        key={i}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') props.changeActiveLocation(row)
                        }}
                        onClick={() => props.changeActiveLocation(row)}
                      >
                        {tableHeaders.map((headCell) => (
                          <TableCell className={styles.tableCell} key={headCell.id}>
                            {row[headCell.id]}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </section>
            <TablePagination
              component="div"
              count={locationDetails.total}
              rowsPerPage={ROWS_PER_PAGE}
              rowsPerPageOptions={[ROWS_PER_PAGE]}
              page={page}
              onPageChange={handlePageChange}
              size="small"
              className={styles.tablePagination}
            />
          </>
        )}
      </section>
    </div>
  )
}

export default LocationMenu
