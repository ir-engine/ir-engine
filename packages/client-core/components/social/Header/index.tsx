import React, { useEffect, useState } from "react";
import Router from "next/router";

import styles from './Header.module.scss';
import Avatar from "@material-ui/core/Avatar";
import { selectCreatorsState } from "../../../redux/creator/selector";
import { bindActionCreators, Dispatch } from "redux";
import { getLoggedCreator } from "../../../redux/creator/service";
import { connect } from "react-redux";
import { selectAuthState } from "../../../redux/auth/selector";
import { PopupLogin } from "../Popup/Popup";
import { IndexPage } from "@xr3ngine/social/pages/login";

const mapStateToProps = (state: any): any => {
  return {
    creatorState: selectCreatorsState(state),
    authState: selectAuthState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getLoggedCreator: bindActionCreators(getLoggedCreator, dispatch),
});

interface Props{
  creatorState?: any;
  getLoggedCreator? : any;
  logo?:string;
  authState?:any
}
const AppHeader = ({creatorState, getLoggedCreator, logo, authState}: Props) => {
  useEffect(()=>getLoggedCreator(),[]);  
  const creator = creatorState && creatorState.get('fetching') === false && creatorState.get('currentCreator');
  let checkGuest = null
  const [buttonPopup , setButtonPopup] = useState(false)
  const status = authState.get('authUser')?.identityProvider.type
    if(status === 'guest') {

     checkGuest = true
    }else {
     
     checkGuest = false
    }

  return (
    <nav className={styles.headerContainer}>
       <PopupLogin trigger={buttonPopup} setTrigger={setButtonPopup}>
          <IndexPage />
          </PopupLogin>
          {logo && <img onClick={()=>Router.push('/')} src={logo} className="header-logo" alt="ARC" />}
          <button type={"button"} onClick={()=>Router.push('/volumetric')} title={"volumetric"} className="header-logo">VolumetricDemo</button>
          {creator && (checkGuest? ' ' :
            <Avatar onClick={()=> Router.push({ pathname: '/creator', query:{ creatorId: creator.id}})} 
            alt={creator.username} src={creator.avatar} />
          )}
         
    </nav>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
