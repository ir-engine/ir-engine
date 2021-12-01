import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import makeStyles from '@mui/styles/makeStyles'
import { ArrowBackIos, FilterList } from '@mui/icons-material'
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

type itemtype = {
  addedOn: null;
  fromUserId: string;
  fromUserInventoryIds: any[];
  fromUserStatus: string;
  toUserId: string;
  toUserInventoryIds: any[];
  toUserStatus: string;
  userTradeId: string;
}

type StateType = {
  url: string;
  metadata: string;
  selectedid: string;
  userid: string;
  anchorEl: any;
  selectedtype: string;
  fortrading: itemtype[],
  offeredTrading: itemtype[],
  receivedTrading: itemtype[],
  userTradeId: string;
}

const ITEM_HEIGHT = 48

const TradingContent = ({ data, user, rejectOfferSent, rejectOfferReceived, handleTransfer, acceptOfferSent, acceptOfferReceived, isLoadingtransfer, type, inventory, removeiteminventory, additeminventory, addofferiteminventory, addreceiveiteminventory, data1, data0, removeofferinventory, removereceiveinventory }: any) => {
  const history = useHistory()
  const classes = useStyles()
  const [state, setState] = useState<StateType>({
    url: '',
    metadata: '',
    selectedid: '',
    userid: '',
    anchorEl: null,
    selectedtype: '',
    fortrading: [],
    offeredTrading: [],
    receivedTrading: [],
    userTradeId: ""
  })
  const { url, metadata, userid, selectedid, anchorEl, selectedtype, fortrading, receivedTrading, offeredTrading, userTradeId } = state
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
      console.log("DAATA ", data);

      setState((prevState: any) => ({
        ...prevState,
        url: data[0].url,
        metadata: data[0].metadata,
        selectedid: data[0].inventoryItemTypeId,
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
      offeredTrading,
      userTradeId: data0[0].userTradeId
    }))
    localStorage.setItem("tradeId", data0[0].userTradeId)

    removeofferinventory(index)
  }
  const receivefortrade = (value: any, index) => {
    const receivedTrading = [...state.receivedTrading, { ...value }]
    console.log("receivedTrading ", receivedTrading);

    setState((prevState: any) => ({
      ...prevState,
      receivedTrading,
      userTradeId: data1[0].userTradeId
    }))
    localStorage.setItem("tradeId", data1[0].userTradeId)

    removereceiveinventory(index)
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
    const offeredTradingtemp = [...state.offeredTrading]
    offeredTradingtemp.splice(index, 1)
    setState((prevState: any) => ({
      ...prevState,
      offeredTrading: [...offeredTradingtemp]
    }))
    addofferiteminventory(value)
  }
  const receivedback = (value: any, index) => {
    const receivedTradingtemp = [...state.receivedTrading]
    receivedTradingtemp.splice(index, 1)
    setState((prevState: any) => ({
      ...prevState,
      receivedTrading: [...receivedTradingtemp]
    }))
    addreceiveiteminventory(value)
  }

  const acceptOfferSentId = (id, items) => {
    console.log("OfferSent ", localStorage.getItem("tradeId"));
    //acceptOfferSent(localStorage.getItem("tradeId"), offeredTrading)
    console.log("id", id)
    console.log("items", items)
    acceptOfferSent(id, items)
  }

  const acceptOfferReceivedId = (id, items) => {
    console.log("OfferReceived ", localStorage.getItem("tradeId"));
    //acceptOfferReceived(localStorage.getItem("tradeId"), receivedTrading)
    console.log("id", id)
    console.log("items", items)
    acceptOfferReceived(id, items)
  }

  const rejectOfferSentId = (id, items) => {
    console.log("OfferSent ", localStorage.getItem("tradeId"));
    //acceptOfferSent(localStorage.getItem("tradeId"), offeredTrading)
    console.log("id", id)
    console.log("items", items)
    rejectOfferSent(id, items)
  }

  const rejectOfferReceivedId = (id, items) => {
    console.log("OfferReceived ", localStorage.getItem("tradeId"));
    //acceptOfferReceived(localStorage.getItem("tradeId"), receivedTrading)
    console.log("id", id)
    console.log("items", items)
    rejectOfferReceived(id, items)
  }

  console.log(data, "data")
  console.log(data0, "data0")
  console.log(data1, "data1")
  console.log(fortrading, "fortrading")
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
              {fortrading.length > 0 ? <Typography className={classes.title}>Selected Items For Trade</Typography> : ""}
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
                // <Stack sx={{ color: 'black' }}>
                //   <Typography>No Data Found</Typography>
                // </Stack>
                ""
              )}
              {
                fortrading.length !== 0 && data0.length === 0 && <Stack justifyContent="center" alignItems="center" spacing={1} direction="row" className={classes.p10}>
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
                        <MenuItem style={{ display: "block", marginRight: "18px" }} key={index} value={datas.id}>
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

                    {isLoadingtransfer ? <CircularProgress size={30} /> : 'Initiate Trade'}
                  </Button>
                </Stack>
              }

            </Stack>

            <Stack justifyContent="center" alignItems="center" marginTop="5px" >
              {offeredTrading.length ? <Typography className={classes.title}>Trade Offer sent</Typography> : ""}
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
                // <Stack sx={{ color: 'black' }}>
                //   <Typography>No Data Found</Typography>
                // </Stack>
                ""
              )}
              {
                fortrading.length !== 0 && data0.length !== 0 && <Stack justifyContent="center" alignItems="center" spacing={1} direction="row" className={classes.p10}>
                  {/* <FormControl fullWidth>
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
                          <MenuItem style={{display:"block"}} key={index} value={datas.id}>
                            {datas.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      disabled={isLoadingtransfer}
                      onClick={() => handleTransfer(userid, offeredTrading)}
                    > */}
                  <Button
                    variant="outlined"
                    disabled={isLoadingtransfer}
                    onClick={() => acceptOfferSentId(data0[0].userTradeId, fortrading)}
                  >
                    {isLoadingtransfer ? <CircularProgress size={30} /> : 'Accept Offer Sent'}
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={isLoadingtransfer}
                    onClick={() => rejectOfferSentId(data0[0].userTradeId, fortrading)}
                  >
                    {isLoadingtransfer ? <CircularProgress size={30} /> : 'Reject Offer Sent'}
                  </Button>
                </Stack>
              }

            </Stack>

            <Stack justifyContent="center" alignItems="center" marginTop="5px" >
              {receivedTrading.length ? <Typography className={classes.title}>Trade Offer received</Typography> : ""}
              {receivedTrading.length !== 0 ? (
                <Stack direction="row" spacing={1}>
                  {receivedTrading.map((value: any, index: number) => (
                    <Card
                      key={index}
                      onClick={() => {
                        receivedback(value, index)
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
                // <Stack sx={{ color: 'black' }}>
                //   <Typography>No Data Found</Typography>
                // </Stack>
                ""
              )}
              {
                fortrading.length !== 0 && data1.length !== 0 && <Stack justifyContent="center" alignItems="center" spacing={1} direction="row" className={classes.p10}>
                  {/* <FormControl fullWidth>
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
                          <MenuItem style={{display:"block"}} key={index} value={datas.id}>
                            {datas.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      disabled={isLoadingtransfer}
                      onClick={() => handleTransfer(userid, offeredTrading)}
                    > */}
                  <Button
                    variant="outlined"
                    disabled={isLoadingtransfer}
                    onClick={() => acceptOfferReceivedId(data1[0].userTradeId, fortrading)}
                  >
                    {isLoadingtransfer ? <CircularProgress size={30} /> : 'Accept Offer Received'}
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={isLoadingtransfer}
                    onClick={() => rejectOfferReceivedId(data1[0].userTradeId, fortrading)}
                  >
                    {isLoadingtransfer ? <CircularProgress size={30} /> : 'Reject Offer Received'}
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
                {data0.length !== 0 ? (
                  <Stack direction="row" spacing={1}>
                    {data0[0].fromUserInventoryIds.map((value: any, index: number) => (
                      <Card
                        key={index}
                        // onClick={() => {
                        //   offerfortrade(value, index);
                        //   setState((prevState) => ({
                        //     ...prevState,
                        //     url: value.url,
                        //     metadata: value.metadata,
                        //     selectedid: value.inventoryItemTypeId,
                        //     userTradeId: value.userTradeId
                        //   }))
                        // }}
                      >
                        <Stack
                          justifyContent="center"
                          alignItems="center"
                          className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
                        >
                          <img src={value.url} height="100" width="100" alt="" />
                          <Typography>{`Name: ${value.name} --->`}  </Typography>
                          <Typography>{`Type: ${value.inventory_item_type.inventoryItemType}`}</Typography>
                          <Typography>{`Status: ${data0[0].fromUserStatus}`}</Typography>
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
                {data0.length !== 0 ? (
                  <Stack direction="row" spacing={1}>
                    {data0[0].toUserInventoryIds.map((value: any, index: number) => (
                      <Card
                        key={index}
                        // onClick={() => {
                        //   setState((prevState) => ({
                        //     ...prevState,
                        //     url: value.url,
                        //     metadata: value.metadata,
                        //     selectedid: value.inventoryItemTypeId,
                        //     userTradeId: value.userTradeId

                        //   }))
                        // }}
                      >
                        <Stack
                          justifyContent="center"
                          alignItems="center"
                          className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
                        >
                          <img src={value.url} height="100" width="100" alt="" />
                          <Typography>{`Name: ${value.name} <---`}</Typography>
                          <Typography>{`Type: ${value.inventory_item_type.inventoryItemType}`}</Typography>
                          <Typography>{`Status: ${data0[0].toUserStatus}`}</Typography>
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
                        // onClick={() => {
                        //   receivefortrade(value, index)
                        //   setState((prevState) => ({
                        //     ...prevState,
                        //     url: value.url,
                        //     metadata: value.metadata,
                        //     selectedid: value.inventoryItemTypeId
                        //   }))
                        // }}
                      >
                        <Stack
                          justifyContent="center"
                          alignItems="center"
                          className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
                        >
                          <img src={value.url} height="100" width="100" alt="" />
                          <Typography>{`Name: ${value.name} --->`}</Typography>
                          <Typography>{`Type: ${value.inventory_item_type.inventoryItemType}`}</Typography>
                          <Typography>{`Status: ${data1[0].toUserStatus}`}</Typography>
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
                        // onClick={() => {

                        //   setState((prevState) => ({
                        //     ...prevState,
                        //     url: value.url,
                        //     metadata: value.metadata,
                        //     selectedid: value.inventoryItemTypeId
                        //   }))
                        // }}
                      >
                        <Stack
                          justifyContent="center"
                          alignItems="center"
                          className={`${selectedid === value.inventoryItemTypeId ? classes.selecteditem : ''}`}
                        >
                          <img src={value.url} height="100" width="100" alt="" />
                          <Typography>{`Name: ${value.name} <---`}</Typography>
                          <Typography>{`Type: ${value.inventory_item_type.inventoryItemType}`}</Typography>
                          <Typography>{`Status: ${data1[0].fromUserStatus}`}</Typography>
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