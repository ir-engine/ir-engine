import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CachedIcon from '@material-ui/icons/Cached';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import React from 'react';
import extjs from '../ic/extjs';
import { clipboardCopy } from '../utils';
import Blockie from './Blockie';
import SnackbarButton from './SnackbarButton';
function useInterval(callback, delay) {
  const savedCallback = React.useRef();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      (savedCallback as any).current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
const api = extjs.connect("https://boundary.ic0.app/");
const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    zIndex: 1
  }
}));
const _showListingPrice = n => {
  n = Number(n) / 100000000;
  return n.toFixed(8).replace(/0{1,6}$/, '');
};
var intv = false;
export default function Sidebar(props) {
  const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const container = window !== undefined ? () => window().document.body : undefined;
  const [balance, setBalance] = React.useState(false);
  const [myCollections, setMyCollections] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElLogin, setAnchorElLogin] = React.useState(null);
  const refreshClick = async () => {
    props.loader(true); 
    await refresh(); 
    props.loader(false);
  };
  const login = (t) => {
   props.login(t); 
   setAnchorElLogin(null)
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const refresh = async () => {
    if (props.account){
      var b = await api.token().getBalance(props.account.address);
      setBalance(b as any);
      var collection, mcs = [];
      for(var i = 0; i < props.collections.length; i++) {
        collection = props.collections[i];
        try{
          var tokens = await api.token(collection.canister).getTokens(props.account.address);
          if (collection.canister === "bxdf4-baaaa-aaaah-qaruq-cai") {
            tokens = (tokens as any).map(a => {a.wrapped = true; return a});
            tokens = (tokens as any).concat(await api.token("qcg3w-tyaaa-aaaah-qakea-cai").getTokens(props.account.address, props.identity.getPrincipal().toText()));
          } else 
          if (collection.canister === "3db6u-aiaaa-aaaah-qbjbq-cai") {
            tokens = (tokens as any).map(a => {a.wrapped = true; return a});
            tokens = (tokens as any).concat(await api.token("d3ttm-qaaaa-aaaai-qam4a-cai").getTokens(props.account.address, props.identity.getPrincipal().toText()));
          };
        } catch(e) {continue};
        if ((tokens as any).length) {
          mcs.push({
            ...collection,
            count : (tokens as any).length
          });
        }
      };
      setMyCollections(mcs as any);
    }
  };
  useInterval(refresh, 30 *1000);
  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.account]);
  React.useEffect(() => {
    props.setBalance(balance);
  }, [balance]);
  
  const accountsList = (
    <div style={{marginTop:73, marginBottom: 100}}>
      <Button variant={"contained"} onClick={props.onClose} color={"primary"} style={{fontWeight:"bold", margin:"0 auto", position:"absolute", top:"18px", left:"15px", right:"15px", width:"270px"}}>Close Wallet</Button>
      <Divider />
      { props.account !== false ? 
      <List>
        <ListSubheader>
          Connected Wallet
        </ListSubheader>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <Blockie address={props.account ? props.account.address : ""} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primaryTypographyProps={{noWrap:true}} 
            secondaryTypographyProps={{noWrap:true}} 
            primary={<>
              {props.account.name}
              <IconButton style={{marginTop:"-5px"}} size="small" onClick={refreshClick} edge="end">
                <CachedIcon />
              </IconButton>
              {/*<Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
              </Menu>*/}
            </>}
            secondary={<>
              {props.account.address.substr(0,20)+"..."}
              <SnackbarButton
                message="Address Copied"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                onClick={() => clipboardCopy(props.account.address)}
              >
                <IconButton style={{marginTop:"-5px"}} size="small" edge="end">
                  <FileCopyIcon style={{fontSize:"1em"}} />
                </IconButton>
              </SnackbarButton>
            </>} />
        </ListItem>
        <ListItem>
          <Typography style={{width:"100%",textAlign:"center",fontWeight:"bold"}}>
          {(balance !== false ? _showListingPrice(balance)+" ICP" : "Loading...")}
          </Typography>
        </ListItem>
        <ListItem>
          <Button onClick={props.logout} fullWidth variant="contained" color="secondary" style={{fontWeight:"bold",color:"white"}}>Logout</Button>
        </ListItem>
      </List> : ""}
      { props.account === false ? 
      <List>
      <ListSubheader>
        Trade NFTS
      </ListSubheader>
        <ListItem>
          <ListItemText 
            primary={"Connect your wallet to buy and sell NFTs directly from the marketplace."}
            />
        </ListItem>
        <ListItem>
          <Button onClick={(e) => setAnchorElLogin(e.currentTarget)} fullWidth variant="contained" color="primary" style={{fontWeight:"bold",color:"black"}}> Connect your Wallet</Button>
          <Menu
            anchorEl={anchorElLogin}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            keepMounted
            open={Boolean(anchorElLogin)}
            onClose={() => setAnchorElLogin(null)}
          >
            <MenuItem onClick ={()=> login('stoic')}>
              <ListItemIcon>
                <img alt="S" src="stoic.png" style={{height:26}} />
              </ListItemIcon>
              <ListItemText primary="StoicWallet" />
            </MenuItem>
            <MenuItem onClick={() => login('plug')}>
              <ListItemIcon>
                <img alt="S" src="plug.png" style={{height:26}} />
              </ListItemIcon>
              <ListItemText primary="Plug Wallet" />
            </MenuItem>
          </Menu>
        </ListItem>
      </List> : ""}
      { props.account !== false ? 
      <>
      <Divider />
      <List>
        <ListSubheader>
          My Collections
          {props.view !== false ?
          <ListItemSecondaryAction>
            <ListItemIcon>
              <Button color={"primary"} variant={"contained"} onClick={() => props.setView(false)} style={{marginTop:"3px", marginLeft:"30px"}} size="small" edge="end">
                Back
              </Button>
            </ListItemIcon>
          </ListItemSecondaryAction> : ""}
        </ListSubheader>
        {myCollections === false ?
          <ListItem>Loading collections...</ListItem>
        :
          <>
          {(myCollections as any).length === 0 ?
            <ListItem>No collections owned</ListItem>
          :
            <>
              {(myCollections as any).map((collection: any) => {
                return (<ListItem key={collection.canister + "-" + collection.count} selected={props.view === collection.canister} button onClick={() => props.setView(collection)}>
                  <ListItemAvatar>
                    <Avatar>
                      <img alt={collection.name} src={"collections/"+collection.canister+".jpg"} style={{height:64}} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText>{collection.name}</ListItemText>
                  <ListItemSecondaryAction><Chip label={collection.count} variant="outlined" /></ListItemSecondaryAction>
                </ListItem>)
              })}
            </>
          }
          </>
        }
      </List> </>: ""}
      
      <div style={{width: drawerWidth-1, zIndex: 10, backgroundColor:'white', position:"fixed", bottom:0, textAlign:'center'}} >
        <span style={{position:'absolute', bottom:'10px', left:'0', right:'0'}}>Developed by ToniqLabs</span>
      </div>
    </div>
  );
  
  return (
    <nav aria-label="mailbox folders">
      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={props.open}
          onClose={props.onClose}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {accountsList}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open
        >
          {accountsList}
        </Drawer>
      </Hidden>
    </nav>
  );
}