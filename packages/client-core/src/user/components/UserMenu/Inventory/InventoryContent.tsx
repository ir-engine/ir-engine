import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import makeStyles from '@mui/styles/makeStyles'
import { ArrowBackIos, FilterList } from '@mui/icons-material'
import styles from '../UserMenu.module.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Grid,
  Divider,
  Box,
  Card,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  Menu,
  MenuItem,
  Select,
  Stack
} from '@mui/material'
import { useHistory } from 'react-router-dom'
import { usePrevious } from '../../../../hooks/usePrevious'

const ITEM_HEIGHT = 48

const InventoryContent = ({
  coinData,
  data,
  user,
  id,
  InventoryService,
  isLoadingtransfer,
  type,
  changeActiveMenu
}: any) => {
  const { t } = useTranslation()
  const [state, setState] = useState({
    url: '',
    metadata: '',
    selectedid: '',
    userid: '',
    anchorEl: null,
    selectedtype: '',
    inventory: []
  })
  const { url, metadata, userid, selectedid, anchorEl, selectedtype, inventory } = state
  const prevState = usePrevious({ selectedtype })
  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setState((prevState: any) => ({
      ...prevState,
      anchorEl: event.currentTarget
    }))
  }
  const handleClose = () => {
    setState((prevState) => ({
      ...prevState,
      anchorEl: null
    }))
  }
  const handletypeselect = (id) => {
    setState((prevState) => ({
      ...prevState,
      selectedtype: id
    }))
    handleClose()
  }

  useEffect(() => {
    if (data.length !== 0) {
      setState((prevState: any) => ({
        ...prevState,
        url: data[0].url,
        metadata: data[0].metadata,
        selectedid: data[0].user_inventory.userInventoryId,
        inventory: [...data]
      }))
    }

    return () => {
      setState({
        url: '',
        metadata: '',
        selectedid: '',
        userid: '',
        anchorEl: null,
        selectedtype: '',
        inventory: []
      }) // This worked for me
    }
  }, [])

  useEffect(() => {
    if (prevState) {
      if (prevState.selectedtype !== selectedtype) {
        if (selectedtype === '') {
          setState((prevState: any) => ({
            ...prevState,
            url: data[0].url,
            metadata: data[0].metadata,
            selectedid: data[0].user_inventory.userInventoryId,
            inventory: [...data]
          }))
        } else {
          let filtereddata = data.filter((val) => val.inventoryItemTypeId === selectedtype)
          if (filtereddata.length !== 0) {
            setState((prevState: any) => ({
              ...prevState,
              url: filtereddata[0].url,
              metadata: filtereddata[0].metadata,
              selectedid: filtereddata[0].user_inventory.userInventoryId,
              inventory: [...filtereddata]
            }))
          } else {
            setState((prevState: any) => ({
              ...prevState,
              url: '',
              metadata: '',
              selectedid: '',
              inventory: []
            }))
          }
        }
      }
    }
  }, [selectedtype])

  return (
    <div className={`${styles.inventoryContent}`}>
      <Box sx={{ p: 2 }} className={`${styles.root} ${styles.contents}`}>
        <Stack direction="row" justifyContent="space-between" className={styles.title}>
          <IconButton
            sx={{ svg: { color: 'white' } }}
            className={styles.backButton}
            onClick={() => changeActiveMenu(null)}
          >
            <ArrowBackIos />
          </IconButton>
          <Typography className={`${styles.title} ${styles.titlesize}`}>{t('user:inventory.inventory')}</Typography>
          <Stack direction="row" justifyContent="center">
            <Stack sx={{ marginTop: '15px' }}>
              {coinData.length !== 0 ? (
                <Stack>
                  {coinData.map((value: any, index: number) => (
                    // <Card
                    //   key={index}
                    //   style={{marginBottom:"8px",padding:"2px"}}
                    // >
                    <Stack key={index} justifyContent="center" alignItems="center">
                      <img src={value.url} height="50" width="50" alt="" />
                      <Typography>{`${value.name}`}</Typography>
                      <Typography>{`Quantity: ${value.user_inventory.quantity}`}</Typography>
                    </Stack>
                    // </Card>
                  ))}
                </Stack>
              ) : (
                <Stack>
                  <Typography>{t('user:inventory.noDataFound')}</Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
        <Divider />
        {data.length !== 0 ? (
          <Grid container spacing={2} className={`${styles.p10} ${styles.contents}`}>
            <Grid item md={4} mx={2}>
              <Stack className={styles.card}>
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls="long-menu"
                  aria-expanded={open ? 'true' : undefined}
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <FilterList />
                </IconButton>
                <Menu
                  id="long-menu"
                  MenuListProps={{
                    'aria-labelledby': 'long-button'
                  }}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  PaperProps={{
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5,
                      width: '20ch'
                    }
                  }}
                >
                  <MenuItem
                    style={{ display: 'block' }}
                    selected={selectedtype === ''}
                    onClick={(e) => handletypeselect('')}
                  >
                    All
                  </MenuItem>
                  {type.map((option) => (
                    <MenuItem
                      style={{ display: 'block' }}
                      key={option.inventoryItemTypeId}
                      selected={option.inventoryItemTypeId === selectedtype}
                      onClick={(e) => handletypeselect(option.inventoryItemTypeId)}
                    >
                      {option.inventoryItemType}
                    </MenuItem>
                  ))}
                </Menu>
                {(selectedtype === '' ? data : inventory).length !== 0 ? (
                  <Stack>
                    {(selectedtype === '' ? data : inventory).map((value: any, index: number) => (
                      <Card
                        key={index}
                        style={{ marginBottom: '8px', padding: '2px' }}
                        onClick={() => {
                          setState((prevState) => ({
                            ...prevState,
                            url: value.url,
                            metadata: value.metadata,
                            selectedid: value.user_inventory.userInventoryId
                          }))
                        }}
                      >
                        <Stack
                          justifyContent="center"
                          alignItems="center"
                          className={`${
                            selectedid === value.user_inventory.userInventoryId ? styles.selecteditem : ''
                          }`}
                        >
                          <img src={value.url} height="100" width="100" alt="" />
                          <Typography>{`Name: ${value.name}`}</Typography>
                          <Typography>{`Type: ${value.inventory_item_type.inventoryItemType}`}</Typography>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Stack sx={{ color: 'black' }}>
                    <Typography>{t('user:inventory.noDataFound')}</Typography>
                  </Stack>
                )}
              </Stack>
              {/* {console.log("in render ", coinData)}
            {
              coinData.map((value: any, index: number) =>
                 <div>{value.name}</div>
              )
            } */}
            </Grid>
            <Grid item md={6}>
              {url !== '' && metadata.length !== 0 && (
                <Stack justifyContent="center" alignItems="center">
                  <Stack spacing={3} justifyContent="center" alignItems="center">
                    <img src={url} height="200" width="200" alt="" />
                  </Stack>
                  <Stack spacing={3} justifyContent="center" alignItems="center">
                    <Grid container spacing={3}>
                      {metadata.length !== 0 && (
                        <>
                          {JSON.parse(metadata).map((val, index) => (
                            <Grid item key={index} xs={6} md={6}>
                              <Typography variant="h6" className={styles.title}>{`${val.trait_type}:`}</Typography>
                              <Stack>
                                {val.trait_type !== 'personality' && val.trait_type !== 'age' ? (
                                  <LinearProgress variant="determinate" value={parseFloat(val.value)} />
                                ) : (
                                  <Typography className={styles.title}>{val.value}</Typography>
                                )}
                              </Stack>
                            </Grid>
                          ))}
                        </>
                      )}
                    </Grid>
                  </Stack>
                  <Stack justifyContent="center" alignItems="center" spacing={3} direction="row" className={styles.p10}>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">{t('user:inventory.user')}</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={userid}
                        label="user"
                        onChange={(e: any) => {
                          setState((prevState) => ({
                            ...prevState,
                            userid: e.target.value
                          }))
                        }}
                      >
                        {user.map((datas, index) => (
                          <MenuItem style={{ display: 'block', marginRight: '18px' }} key={index} value={datas.id}>
                            {datas.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      disabled={isLoadingtransfer}
                      onClick={() => InventoryService.handleTransfer(userid, selectedid, id)}
                    >
                      {isLoadingtransfer ? <CircularProgress size={30} /> : t('user:inventory.transfer')}
                    </Button>
                  </Stack>
                </Stack>
              )}
              {url === '' && metadata.length === 0 && (
                <Stack sx={{ color: 'black' }}>
                  <Typography>{t('user:inventory.noItemSelected')}</Typography>
                </Stack>
              )}
            </Grid>
          </Grid>
        ) : (
          <Stack justifyContent="center" alignItems="center">
            <Typography className={`${styles.title} ${styles.contents}`}>{t('user:inventory.noItemsFound')}</Typography>
          </Stack>
        )}
      </Box>
    </div>
  )
}

export default InventoryContent
