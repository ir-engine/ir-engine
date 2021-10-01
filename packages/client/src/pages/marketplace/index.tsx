import React from 'react';
import Entrepot from './containers/Entrepot';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import AlertDialog from './components/AlertDialog';
import ConfirmDialog from './components/ConfirmDialog';
const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));
const emptyAlert = {
  title : "",
  message : "",
};
export default function App() {
  const classes = useStyles();
  const [loaderOpen, setLoaderOpen] = React.useState(false);
  const [loaderText, setLoaderText] = React.useState(""); 
  const [alertData, setAlertData] = React.useState(emptyAlert); 
  const [confirmData, setConfirmData] = React.useState(emptyAlert); 
  const [showAlert, setShowAlert] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  
  const alert = (title, message, buttonLabel) => {
    return new Promise(async (resolve, reject) => {
      setAlertData({
        title : title,
        message : message,
        buttonLabel : buttonLabel,
        handler :  () => {
          setShowAlert(false);
          resolve(true);
          setTimeout(() => setAlertData(emptyAlert), 100);
        },
      });
      setShowAlert(true);
    })
  };
  const error = (e) => {
    alert("There was an error", e);
  };
  const confirm = (title, message, buttonCancel, buttonConfirm) => {
    return new Promise(async (resolve, reject) => {
      setConfirmData({
        title : title,
        message : message,
        buttonCancel : buttonCancel,
        buttonConfirm : buttonConfirm,
        handler : (v) => {
          setShowConfirm(false);
          resolve(v);
          setTimeout(() => setConfirmData(emptyAlert), 100);
        },
      });
      setShowConfirm(true);
    })
  };
  
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loader = (l, t) => {
    setLoaderText(t);
    setLoaderOpen(l);
    if (!l) {  
      setLoaderText("");
    }
  };
  
  return (
    <>
      <Entrepot error={error} alert={alert} confirm={confirm} loader={loader} />
      <Backdrop className={classes.backdrop} open={loaderOpen}>
        <CircularProgress color="inherit" />
        <h2 style={{position:"absolute", marginTop:"120px"}}>{loaderText ?? "Loading..."}</h2>
      </Backdrop>
      <AlertDialog open={showAlert} title={alertData.title} message={alertData.message} buttonLabel={alertData.buttonLabel} handler={alertData.handler} />
      <ConfirmDialog open={showConfirm} title={confirmData.title} message={confirmData.message} buttonCancel={confirmData.buttonCancel} buttonConfirm={confirmData.buttonConfirm} handler={confirmData.handler} />
    </>
  );
}