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
    border: '2px solid #800000'
  },
  card: {
    boxShadow: '16px 16px 16px 16px #11111159'
  },
  contents: {
    justifyContent: 'center'
  },
  titlesize: {
    fontSize: '30px'
  },
  wordsize: {
    fontSize: '15px'
  }
})

const ITEM_HEIGHT = 48

const WalletContent = ({ data }: any) => {
  const history = useHistory()
  const classes = useStyles()
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

  return (
    <Box sx={{ p: 2 }} className={`${classes.root} ${classes.contents}`}>
      {/* <Stack sx={{ p: 2 }} className={`${classes.root} ${classes.contents}`} > */}
      <Stack direction="row" justifyContent="space-between" className={classes.title}>
        <IconButton onClick={() => history.goBack()}>
          <ArrowBackIos /> Back
        </IconButton>
        <Typography className={`${classes.title} ${classes.titlesize}`}>My Wallet</Typography>
      </Stack>
      <Divider />
      {data.length !== 0 ? (
        // <Grid container spacing={2} className={`${classes.p10} ${classes.contents}`}>
        //     <Grid item md={4} mx={2}>
        <Stack>
          {data.map((val, index) => (
            <Stack key={index} className={classes.title}>
              <Typography className={classes.wordsize}>User Address:{val.userAddress}</Typography>
              <Typography className={classes.wordsize}>User Id:{val.userId}</Typography>
              <Typography className={classes.wordsize}>User Mnemonic:{val.userMnemonic}</Typography>
            </Stack>
          ))}
        </Stack>
      ) : (
        //     </Grid>
        // </Grid>
        'No Data Found'
      )}
    </Box>
  )
}

export default WalletContent
