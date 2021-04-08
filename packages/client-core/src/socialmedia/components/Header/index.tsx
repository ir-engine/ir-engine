import React, { useEffect } from "react";
import Router from "next/router";

import * as styles from './Header.module.scss';
import Avatar from "@material-ui/core/Avatar";
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { selectCreatorsState } from "../../reducers/creator/selector";
import { getLoggedCreator } from "../../reducers/creator/service";

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
