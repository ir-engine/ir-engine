import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Typography from '@material-ui/core/Typography'
import AddIcon from '@material-ui/icons/Add'
import SearchIcon from '@material-ui/icons/Search'
import Table from '@material-ui/core/Table'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import TablePagination from '@material-ui/core/TablePagination'
import InputAdornment from '@material-ui/core/InputAdornment'
import { client } from '../../../../feathers'
import styles from '../UserMenu.module.scss'

const LocationMenu = ({ changeActiveLocation }) => {
  const [page, setPage] = useState(0)
  const [locationDetails, setLocationsDetails] = useState(null)
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
    client
      .service('location')
      .find({
        query: {
          $limit: rows,
          $skip: page * rows,
          adminnedLocations: true,
          search
        }
      })
      .then((res) => {
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
                      <SearchIcon className={styles.primaryForeground} />
                    </InputAdornment>
                  )
                }}
              />
              <Button className={styles.newLocation} onClick={() => changeActiveLocation({ location_setting: {} })}>
                <AddIcon />
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
                  {locationDetails.data.map((row, i) => {
                    return (
                      <TableRow
                        className={styles.tableRow}
                        key={i}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') changeActiveLocation(row)
                        }}
                        onClick={() => changeActiveLocation(row)}
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
