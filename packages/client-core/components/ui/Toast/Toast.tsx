import React, { useEffect, useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { CheckCircleOutline, ErrorOutline, WarningOutlined } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    backgroundColor: "#ffffff",
    minWidth: "20%",
    padding: "1px",
    display: "unset",
    borderRadius: "5px"
  },
  filledWarning: {
    backgroundColor: "#FFD600",
  },
  anchorOriginTopRight: {
    justifyContent: "flex-start"
  }
});

export const Toast = (props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);


  useEffect(() => {
    setOpen(true);
  }, []);

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      {
        <Snackbar
          className={`${classes.root} ${classes.anchorOriginTopRight}`}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={open}
          autoHideDuration={8000} 
          onClose={handleClose}
        >


          <div className="row">
            {props.status === "success" &&
              <div className="col-lg-3" style={{ background: "#1ED700", marginLeft: "15px" }}>
                <CheckCircleOutline style={{ fontSize: "4rem" }} />
              </div>
            }
            {
              props.status === "error" &&
              <div className="col-lg-3" style={{ background: "#D70000", marginLeft: "15px" }}>
                <ErrorOutline style={{ fontSize: "4rem" }} />
              </div>

            }
            {
              props.status === "warning" &&
              <div className="col-lg-3" style={{ background: "#FFD600",  marginLeft: "15px" }}>
                <WarningOutlined style={{ fontSize: "4rem" }} />
              </div>
            }
            <div className="col-lg-8" style={{ background: "#ffffff", padding: "5px", paddingLeft: "10px"}}>
              {
                props.status === "success" &&
                <h5 className="card-title text-dark font-weight-bold mt-2"> Event was successful</h5>
              }
              {
                props.status === "error" &&
                <h5 className="card-title text-dark font-weight-bold mt-2"> An error was encountered.</h5>
              }
              {
                props.status === "warning" &&
                <h5 className="card-title text-dark font-weight-bold mt-2"> Evet in progress</h5>
              }
              <p className="card-text text-dark">{props.message}</p>
            </div>
          </div>
        </Snackbar>
      }
    </>
  )
}
