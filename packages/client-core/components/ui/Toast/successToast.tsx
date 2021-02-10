import React from "react";
import style from "./toast.module.scss";
import { CheckCircleOutline, ErrorOutline, GroupWork } from '@material-ui/icons';
export const Success = ({ appearance, children }) => {
return (
    <div className={style["toastContainer"]}>
            <div className="row">
              {appearance === "success" &&
                    <div className="col-lg-3" style={{ background: "#1ED700", marginLeft: "15px" }}>
                    <CheckCircleOutline style={{fontSize: "4rem"}} />
                </div>
              }
              {
                  appearance === "error" &&
                  <div className="col-lg-3" style={{ background: "#D70000", marginLeft: "15px" }}>
                  <ErrorOutline style={{fontSize: "4rem"}} />
              </div>

              }
              {
                  appearance === "warning" &&
                  <div className="col-lg-3" style={{ background: "#FFD600", marginLeft: "15px" }}>
                  <GroupWork style={{fontSize: "4rem"}} />
              </div>
              }
                <div className="col-lg-7 ">
                    {
                        appearance === "success" &&
                        <h5 className="card-title text-dark font-weight-bold mt-2"> Event was successful</h5>
                    }
                    {
                        appearance === "error" &&
                        <h5 className="card-title text-dark font-weight-bold mt-2"> An error was encountered.</h5>
                    }
                    {
                        appearance === "warning" &&
                        <h5 className="card-title text-dark font-weight-bold mt-2"> Evet in progress</h5>
                    }
                    <p className="card-text text-dark">{children}</p>
                </div>
        </div>
    </div>
)
}
