import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core'
import { ArrowBackIos, FilterList } from '@material-ui/icons'
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

const useStyles = makeStyles({
  root1: {
    width: '50%'
  },
  root: {
    width: '50%',
    // height: '100vh',
    boxShadow: '16px 16px 16px 16px #11111159',
    margin: 'auto',
    borderadius: '10px'
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
  title: {
    color: '#777777'
  },
  p10: {
    padding: '10px'
  },
  selecteditem: {
    border: '1px solid #800000'
  },
  card: {
    boxShadow: '16px 16px 16px 16px #11111159'
  },
  contents: {
    justifyContent: 'center'
  }
})

const ITEM_HEIGHT = 48

const TradingContent = ({ data, user, handleTransfer, isLoadingtransfer, type, inventory, removeiteminventory, additeminventory,addofferiteminventory, data1,removeofferinventory }: any) => {
  const history = useHistory()
  const classes = useStyles()
  const [state, setState] = useState({
    url: '',
    metadata: '',
    selectedid: '',
    userid: '',
    anchorEl: null,
    selectedtype: '',
    fortrading: [],
    offeredTrading:[]
  })
  const { url, metadata, userid, selectedid, anchorEl, selectedtype, fortrading,offeredTrading } = state
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
        selectedid: data[0].inventoryItemTypeId
      }))
    }
  }, [])

  const onDragStart = (ev, id) => {
    console.log('dragstart:', id);
    ev.dataTransfer.setData("id", id);
  }

  const onDragOver = (ev) => {
    ev.preventDefault();
  }

  const onDrop = (ev, cat) => {
    let id = ev.dataTransfer.getData("id");

    // let tasks = inventory.filter((task) => {
    //   if (task.name == id) {
    //     task.category = cat;
    //   }
    //   return task;
    // });

    // setState((prevState: any) => ({
    //   ...prevState,
    //   fortrading: [...tasks]
    // }))
  }
  const addfortrade = (value: any, index) => {
    const fortrading = [...state.fortrading, { ...value }]
    setState((prevState: any) => ({
      ...prevState,
      fortrading
    }))
    removeiteminventory(index)
  }
  const offerfortrade = (value: any, index) => {
    const offeredTrading = [...state.offeredTrading, { ...value }]
    setState((prevState: any) => ({
      ...prevState,
      offeredTrading
    }))
    removeofferinventory(index)
  }

  const inventoryback = (value: any, index) => {
    const fortradingtemp = [...state.fortrading]
    fortradingtemp.splice(index, 1)
    setState((prevState: any) => ({
      ...prevState,
      fortrading: [...fortradingtemp]
    }))
    additeminventory(value)
  }
  const offeredback = (value: any, index) => {
    const fofferedTradingtemp = [...state.offeredTrading]
    fofferedTradingtemp.splice(index, 1)
    setState((prevState: any) => ({
      ...prevState,
      offeredTrading: [...fofferedTradingtemp]
    }))
    addofferiteminventory(value)
  }

  console.log(data[0]?.toUserInventoryIds, "datas")
  return (
    <Box sx={{ p: 2 }} className={`${classes.root} ${classes.contents}`}>
      {/* <Stack sx={{ p: 2 }} className={`${classes.root} ${classes.contents}`} > */}
      <Stack direction="row" justifyContent="space-between" className={classes.title}>
        <IconButton onClick={() => history.goBack()}>
          <ArrowBackIos /> Back
        </IconButton>
        <Typography className={classes.title}>Trade</Typography>
      </Stack>
      <Divider />
     
        <Grid container spacing={2} className={`${classes.p10} ${classes.contents}`}>
          <Grid item md={2}>
            <Stack className={classes.card} onDragOver={(e) => onDragOver(e)}
              onDrop={(e) => { onDrop(e, "wip") }}>
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
                <MenuItem selected={selectedtype === ''} onClick={(e) => handletypeselect('')}>
                  All
                </MenuItem>
                {type.map((option) => (
                  <MenuItem
                    key={option.inventoryItemTypeId}
                    selected={option.inventoryItemTypeId === selectedtype}
                    onClick={(e) => handletypeselect(option.inventoryItemTypeId)}
                  >
                    {option.inventoryItemType}
                  </MenuItem>
                ))}
              </Menu>
              {inventory.length !== 0 ? (
                <Stack>
                  {inventory.map((value: any, index: number) => (
                    <Card
                      key={index}
                      onClick={() => {
                        addfortrade(value, index);
                        setState((prevState) => ({
                          ...prevState,
                          url: value.url,
                          metadata: value.metadata,
                          selectedid: value.inventoryItemTypeId
                        }))
                      }}
                    >
                      <Stack
                        justifyContent="center"
                        alignItems="center"
                        className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
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
            <Card>
              <Stack justifyContent="center" alignItems="center">
                <Typography className={classes.title}>Selected Items For Trade</Typography>
                {fortrading.length !== 0 ? (
                  <Stack direction="row" spacing={1}>
                    {fortrading.map((value: any, index: number) => (
                      <Card
                        key={index}
                        onClick={() => {
                          inventoryback(value, index)
                        }}
                      >
                        <Stack
                          justifyContent="center"
                          alignItems="center"
                        // className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
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
                {
                  fortrading.length !== 0 && <Stack justifyContent="center" alignItems="center" spacing={1} direction="row" className={classes.p10}>
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
                          <MenuItem key={index} value={datas.id}>
                            {datas.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      disabled={isLoadingtransfer}
                      onClick={() => handleTransfer(userid, fortrading)}
                    >
                      {isLoadingtransfer ? <CircularProgress size={30} /> : 'Trade'}
                    </Button>
                  </Stack>
                }

              </Stack>

              <Stack justifyContent="center" alignItems="center" marginTop="5px" >
                <Typography className={classes.title}>Trade Offer sent</Typography>
                {offeredTrading.length !== 0 ? (
                  <Stack direction="row" spacing={1}>
                    {offeredTrading.map((value: any, index: number) => (
                      <Card
                        key={index}
                        onClick={() => {
                          offeredback(value, index)
                        }}
                      >
                        <Stack
                          justifyContent="center"
                          alignItems="center"
                        // className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
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
                {
                  offeredTrading.length !== 0 && <Stack justifyContent="center" alignItems="center" spacing={1} direction="row" className={classes.p10}>
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
                          <MenuItem key={index} value={datas.id}>
                            {datas.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      disabled={isLoadingtransfer}
                      onClick={() => handleTransfer(userid, fortrading)}
                    >
                      {isLoadingtransfer ? <CircularProgress size={30} /> : 'Trade'}
                    </Button>
                  </Stack>
                }

              </Stack>
            </Card>
          </Grid>
          <Grid item md={4}>
            <Stack>
              <Card>
                <Stack justifyContent="center" alignItems="center">
                  <Typography className={classes.title}>Trade Offer Sent</Typography>
                  {data.length !== 0 ? (
                    <Stack direction="row" spacing={1}>
                      {data[0].fromUserInventoryIds.map((value: any, index: number) => (
                        <Card
                          key={index}
                          onClick={() => {
                            offerfortrade(value, index);
                            setState((prevState) => ({
                              ...prevState,
                              url: value.url,
                              metadata: value.metadata,
                              selectedid: value.inventoryItemTypeId
                            }))
                          }}
                        >
                          <Stack
                            justifyContent="center"
                            alignItems="center"
                            className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
                          >
                            <img src={value.url} height="100" width="100" alt="" />
                            <Typography>{`Name: ${value.name} --->`}  </Typography>
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
                  <Divider />
                  {data.length !== 0 ? (
                    <Stack direction="row" spacing={1}>
                      {data[0].toUserInventoryIds.map((value: any, index: number) => (
                        <Card
                          key={index}
                          onClick={() => {
                            setState((prevState) => ({
                              ...prevState,
                              url: value.url,
                              metadata: value.metadata,
                              selectedid: value.inventoryItemTypeId
                            }))
                          }}
                        >
                          <Stack
                            justifyContent="center"
                            alignItems="center"
                            className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
                          >
                            <img src={value.url} height="100" width="100" alt="" />
                            <Typography>{`Name: ${value.name} <---`}</Typography>
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
              </Card>
              <Card>
                <Stack justifyContent="center" alignItems="center">
                  <Typography className={classes.title}>Trade Offer Received</Typography>
                  {data1.length !== 0 ? (
                    <Stack direction="row" spacing={1}>
                      {data1[0].toUserInventoryIds.map((value: any, index: number) => (
                        <Card
                          key={index}
                          onClick={() => {
                            setState((prevState) => ({
                              ...prevState,
                              url: value.url,
                              metadata: value.metadata,
                              selectedid: value.inventoryItemTypeId
                            }))
                          }}
                        >
                          <Stack
                            justifyContent="center"
                            alignItems="center"
                            className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
                          >
                            <img src={value.url} height="100" width="100" alt="" />
                            <Typography>{`Name: ${value.name} --->`}</Typography>
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
                  <Divider />
                  {data1.length !== 0 ? (
                    <Stack direction="row" spacing={1}>
                      {data1[0].fromUserInventoryIds.map((value: any, index: number) => (
                        <Card
                          key={index}
                          onClick={() => {
                            setState((prevState) => ({
                              ...prevState,
                              url: value.url,
                              metadata: value.metadata,
                              selectedid: value.inventoryItemTypeId
                            }))
                          }}
                        >
                          <Stack
                            justifyContent="center"
                            alignItems="center"
                            className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
                          >
                            <img src={value.url} height="100" width="100" alt="" />
                            <Typography>{`Name: ${value.name} <---`}</Typography>
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
              </Card>
            </Stack>

          </Grid>
        </Grid>
     
      {/* </Stack> */}
    </Box>
  )
}

export default TradingContent
