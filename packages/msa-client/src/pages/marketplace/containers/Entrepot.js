import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Marketplace from '../views/Marketplace';
import Create from '../views/Create';
import Home from '../views/Home';
import Contact from '../views/Contact';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  toolbarButtons: {
    marginLeft: 'auto',
  },
  content: {
    flexGrow: 1,
  },
  button: {
    marginLeft:40, 
    fontSize:"1.2em", 
    fontWeight:"bold",
    borderBottom: '3px solid transparent',
    borderRadius: 0,
    height:73,
    '&:hover': {
      color: '#00d092',
      backgroundColor: '#fff',
      borderBottom: '3px solid #00d092',
    },
    '&.selected': {
      color: '#00d092',
      borderBottom: '3px solid #00d092',
    },
    [theme.breakpoints.down('xs')]: {
      display: "none",
    },
  }

}));


  const routes = {
    'home' : {
      title : "Home",
      view : Home
    },
    'marketplace' : {
      title : "Marketplace",
      view : Marketplace
    },
    'create' : {
      title : "Create",
      view : Create
    },
    'contact' : {
      title : "Contact",
      view : Contact
    },
  };
//Helpers
var current = 'home';
var path = "";
var root = window.location.href.split("#", 2);
if (root.length > 1) {
  var paths = root[1].split("/", 2);
  if (routes.hasOwnProperty(paths[0])) current = paths[0];
  path = paths[1] ?? "";
};
var np = root[0] + (current !== "home" ? "#" + current : "");
if (window.location.href !== np) window.location.href = np;
export default function Entrepot(props) {
  const classes = useStyles();
  const [route, setRoute] = React.useState(current);

  const renderView = (r) => {
    switch(r){
      default:
      case "marketplace":
        return React.createElement(routes[r].view, {...props, changeRoute : changeRoute, collection : path})
    }
  }
  const changeRoute = (r) => {
    var np = root[0] + (r !== "home" ? "#" + r : "");
    if (window.location.href !== np) window.location.href = np;
    setRoute(r);
  };
  
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" style={{ background: 'white' }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            <img onClick={() => changeRoute('home')} alt="Entrepot" src="logo.jpg" style={{height:64, cursor: "pointer"}} />
          </Typography>
          <div className={classes.grow} />
          <Button startIcon={<img alt="marketplace" style={{width:20}}src="/icon/marketplace.png" />} onClick={() => changeRoute('marketplace')} className={classes.button + (route === 'marketplace' ? " selected" : "")} color="inherit">Marketplace</Button>
          <Button startIcon={<img alt="create" style={{width:20}}src="/icon/create.png" />} onClick={() => changeRoute('create')} className={classes.button + (route === 'create' ? " selected" : "")} color="inherit">Create</Button>
          <Button startIcon={<img alt="contact" style={{width:20}}src="/icon/support.png" />} onClick={() => changeRoute('contact')} className={classes.button + (route === 'contact' ? " selected" : "")} color="inherit">Support</Button>
        </Toolbar>
      </AppBar>
      {renderView(route)}
    </div>
  );
}
