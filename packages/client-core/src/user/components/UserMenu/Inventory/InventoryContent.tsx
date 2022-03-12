import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import makeStyles from '@mui/styles/makeStyles'
import { ArrowBackIos, ArrowForwardIos, FilterList } from '@mui/icons-material'
import React, { useEffect, useState } from 'react'
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

import ItemSlot from './Slot'
import DragAndDropAPI from './DragAndDropAPI'

const useStyles = makeStyles({
  root1: {
    width: '50%'
  },
  root: {
    width: '100%',
    height: '100%',
    color: 'white'
  },
  item: {
    border: 'solid 1px',
    borderRadius: '5px',
    borderColor: '#d9d7d78c',
    cursor: 'pointer'
  },
  modalBody: {
    backgroundColor: '#FFF'
  },
  modalBoxShadow: {
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
    backgroundColor: 'white'
  },
  itemscroll: {
    // maxHeight: '500px',
    overflow: 'scroll'
  },
  backButton: {
    opacity: 0.8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&:hover': {
      background: 'none',
      opacity: 1
    }
  },
  title: {
    color: 'white'
  },
  p10: {
    padding: '10px'
  },
  selecteditem: {
    border: '2px solid white'
  },
  card: {
    margin: '10px'
  },
  contents: {
    justifyContent: 'center'
  },
  titlesize: {
    fontSize: '30px'
  },
  inventoryWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  inventoryItem: {
    margin: 15,
    filter: 'drop-shadow(0px 11.2376px 11.2376px rgba(0, 0, 0, 0.25))',
    borderRadius: '6.74257px',
    border: '2px solid rgba(137, 137, 242, 0.53)',
    boxShadow: '0px 11.23762321472168px 11.23762321472168px 0px #00000040',
    width: '25%',
    height: '100px',
    '&:hover': {
      cursor: 'pointer',
    }
  },
  inventoryItemEmpty: {
    margin: 15,
    borderRadius: '8px',
    border: '2px solid #ffffff61',
    background: 'linear-gradient(180deg, rgba(137, 137, 242, 0.5) 0%, rgba(92, 92, 92, 0.5) 100%)',
    boxShadow: '0px 11.23762321472168px 11.23762321472168px 0px #00000040',
    backdropFilter: 'blur(50px)',
    width: '25%',
    height: '100px',
  },
  invenPaginationBtn: {
    '&:hover': {
      cursor: 'pointer',
    },
    '&.disable': {
      opacity: '0.3'
    },
  }
})

const ITEM_HEIGHT = 48

const inventoryLimit = 9

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
  const history = useHistory()
  const classes = useStyles()
  const [state, setState] = useState({
    url: '',
    metadata: '',
    selectedid: '',
    userid: '',
    anchorEl: null,
    selectedtype: '',
    inventory: [],
    currentPage: 1,
  })
  const { url, metadata, userid, selectedid, anchorEl, selectedtype, inventory } = state
  const prevState = usePrevious({ selectedtype })
  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl)

  const totalPage = Math.ceil( coinData.length / inventoryLimit )

  // Regarding dragging inventory action.
  const [items, setItems] = useState([ ...coinData ])
  const [ draggingSlotId, setDraggingSlot ] = useState(null)
  const getItemDataInSlot = (slot) => items.find((item) => item.slot === slot);

  const swapItemSlots = (oldSlot, newSlot) => {
    setItems((currentState) => {
      let newInventory = [...currentState];
      let oldIndex: any, newIndex: any;
      
      // Finding the old ones..

      newInventory.forEach((item, index) => {
        if(item.slot === oldSlot) {
          oldIndex = index;
        } else if (item.slot === newSlot) {
          newIndex = index;
        }
      })

      // Replacing them

      newInventory[oldIndex] = { ...newInventory[oldIndex], slot: newSlot }
      newInventory[newIndex] = { ...newInventory[newIndex], slot: oldSlot }

      return [...newInventory]
    })
  }


  const moveItemToSlot = (oldSlot, newSlot) => {
    console.log(`move slot`, oldSlot, newSlot);

    setItems((currentState) => {
      let newInventory = [...currentState];
      let targetIndex: any;
      newInventory.forEach((item, index) => {
        if (item.slot === oldSlot) {
          targetIndex = index;
        }
      });
      console.error('targetIndex', targetIndex);
      newInventory[targetIndex] = { ...newInventory[targetIndex], slot: newSlot };
      return [...newInventory]
    })
  }

  const onInventoryItemDragged = ({ detail: eventData }: any) => {
    const oldSlot = parseInt(eventData.slot), newSlot = parseInt(eventData.destination.slot);

    if (eventData.destination.type === "empty-slot") {
      moveItemToSlot(oldSlot, newSlot);
    } else if (eventData.destination.type === "item") {
      swapItemSlots(oldSlot, newSlot);
    }
  }

  // ***********************************

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

  const goToNextPage = () => {
    setState((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage + 1
    }))
  }
  const goToPrevPage = () => {
    setState((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage - 1
    }))
  }
  const getCurrentSlots = () => {
    const res: any = [];
    const startIndex = (state.currentPage - 1) * inventoryLimit;
    const endIndex = state.currentPage * inventoryLimit;
    for( let i = startIndex; i < endIndex; i++ )
      res.push(i);

    return res;
  }

  useEffect(() => {
    document.addEventListener("inventoryItemDragged", onInventoryItemDragged)

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
      document.removeEventListener("inventoryItemDragged", onInventoryItemDragged);

      setState({
        url: '',
        metadata: '',
        selectedid: '',
        userid: '',
        anchorEl: null,
        selectedtype: '',
        inventory: [],
        currentPage: 1,
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
    <Box sx={{ p: 2 }} className={`${classes.root} ${classes.contents} invenContentPanel`}>
      {/* <Stack sx={{ p: 2 }} className={`${classes.root} ${classes.contents}`} > */}
      <Stack direction="row" justifyContent="space-between" className={classes.title}>
        <IconButton
          sx={{ svg: { color: 'white' } }}
          className={classes.backButton}
          onClick={() => changeActiveMenu(null)}
        >
          <ArrowBackIos />
        </IconButton>
        <Stack justifyContent="center" sx={{ width: '90%' }}>
          <Typography className={`${classes.title} ${classes.titlesize}`}>Inventory</Typography>
          <Stack direction="row" justifyContent="center" className={`${classes.inventoryWrapper}`}>
            <Stack sx={{ marginTop: '15px' }}>
              {items.length !== 0 ? (
                <Stack>
                  {/* drag & drop API integration */}
                  <DragAndDropAPI
                    activeDraggedSlot={draggingSlotId}
                    setActiveDraggedSlot={setDraggingSlot}
                  />

                  {/* inventory grid */}
                  <Stack direction="row" justifyContent="center" flexWrap={'wrap'} sx={{ position: 'relative' }} className={`inventory`}>
                    {
                      getCurrentSlots().map((slot) => (
                        <ItemSlot
                          slot={slot}
                          value={ getItemDataInSlot(slot) || null }
                          key={slot}
                        />
                      ))
                    }
                  </Stack>
                  {/* pagination */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <IconButton
                      sx={{ svg: { color: 'white' } }}
                      className={`${classes.invenPaginationBtn} ${ state.currentPage <= 1 ? 'disable' : '' }`}
                      onClick={() => goToPrevPage()}
                      disabled={ state.currentPage <= 1 ? true : false }
                    >
                      <ArrowBackIos />
                    </IconButton>
                    <Typography>
                      Page {`${state.currentPage} / ${ totalPage }`}
                    </Typography>
                    <IconButton
                      sx={{ svg: { color: 'white' } }}
                      className={`${classes.invenPaginationBtn} ${ state.currentPage >= totalPage ? 'disable' : '' }`}
                      onClick={() => goToNextPage()}
                      disabled={ state.currentPage >= totalPage ? true : false }
                    >
                      <ArrowForwardIos />
                    </IconButton>
                  </Stack>
                </Stack>
              ) : (
                <Stack>
                  <Typography>No Data Found</Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <Divider />
      {data.length !== 0 ? (
        <Grid container spacing={2} className={`${classes.p10} ${classes.contents}`}>
          <Grid item md={4} mx={2}>
            <Stack className={classes.card}>
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
                        className={`${selectedid === value.user_inventory.userInventoryId ? classes.selecteditem : ''}`}
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
                  <Typography>No Data Found</Typography>
                </Stack>
              )}
            </Stack>
          </Grid>
          <Grid item md={6}>
            {url !== '' && metadata.length !== 0 && (
              <Stack justifyContent="center" alignItems="center">
                <Stack spacing={3} justifyContent="center" alignItems="center">
                  <img src={url} height="200" width="200" alt="" />
                </Stack>
                {/* <Stack spacing={3} justifyContent="center" alignItems="center">
                  <Grid container spacing={3}>
                    {metadata.length !== 0 && (
                      <>
                        {JSON.parse(metadata).map((val, index) => (
                          <Grid item key={index} xs={6} md={6}>
                            <Typography variant="h6" className={classes.title}>{`${val.trait_type}:`}</Typography>
                            <Stack>
                              {val.trait_type !== 'personality' && val.trait_type !== 'age' ? (
                                <LinearProgress variant="determinate" value={parseFloat(val.value)} />
                              ) : (
                                <Typography className={classes.title}>{val.value}</Typography>
                              )}
                            </Stack>
                          </Grid>
                        ))}
                      </>
                    )}
                  </Grid>
                </Stack> */}
                <Stack justifyContent="center" alignItems="center" spacing={3} direction="row" className={classes.p10}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">User</InputLabel>
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
                    {isLoadingtransfer ? <CircularProgress size={30} /> : 'Transfer'}
                  </Button>
                </Stack>
              </Stack>
            )}
            {url === '' && metadata.length === 0 && (
              <Stack sx={{ color: 'black' }}>
                <Typography>No item selected</Typography>
              </Stack>
            )}
          </Grid>
        </Grid>
      ) : (
        <Stack justifyContent="center" alignItems="center">
          <Typography className={classes.title}>NO ITEMS FOUND</Typography>
        </Stack>
      )}
      {/* </Stack> */}
    </Box>
  )
}

export default InventoryContent
