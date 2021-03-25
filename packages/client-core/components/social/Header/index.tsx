import React, { useEffect } from "react";
import Router from "next/router";

import styles from './Header.module.scss';
import Avatar from "@material-ui/core/Avatar";
import { selectCreatorsState } from "../../../redux/creator/selector";
import { bindActionCreators, Dispatch } from "redux";
import { getLoggedCreator } from "../../../redux/creator/service";
import { connect } from "react-redux";

const mapStateToProps = (state: any): any => {
  return {
    creatorState: selectCreatorsState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getLoggedCreator: bindActionCreators(getLoggedCreator, dispatch),
});

interface Props{
  creatorState?: any;
  getLoggedCreator? : any;
  logo?:string;
}
const AppHeader = ({creatorState, getLoggedCreator, logo}: Props) => {
  useEffect(()=>getLoggedCreator(),[]);  
  const creator = creatorState && creatorState.get('fetching') === false && creatorState.get('currentCreator');
  return (
    <nav className={styles.headerContainer}>
          {logo && <img onClick={()=>Router.push('/')} src={logo} className="header-logo" alt="ARC" />}
          <button type={"button"} onClick={()=>Router.push('/volumetric')} title={"volumetric"} className="header-logo">VolumetricDemo</button>
          {creator && (
            <Avatar onClick={()=>Router.push({ pathname: '/creator', query:{ creatorId: creator.id}})} 
            alt={creator.username} src={creator.avatar} />
          )}
    </nav>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
