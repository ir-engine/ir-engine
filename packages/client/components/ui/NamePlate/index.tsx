import React from "react";

import styles from './TooltipContainer.module.scss';
import Snackbar from '@material-ui/core/Snackbar';
import { connect } from "react-redux";
import { selectUserState } from "../../../redux/user/selector";

interface Position{
  x: number;
  y: number;
}
interface Props {
  userId: string;
  position: Position;
  isFocused: boolean | false;
  userState: any;
}

const mapStateToProps = (state: any): any => {
  return {   
    userState: selectUserState(state),
  };
};


const NamePlate = (props: Props) =>{
  const {userId, position, isFocused, userState} = props;
  const user = userState.get('layerUsers').find(user => user.id === userId);
  return <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'center'}} 
            className={styles.TooltipSnackBar} open={true} style={{top: position.y, left: position.x }}
            autoHideDuration={10000} 
            message={user.name} />;
};

export default connect(mapStateToProps)(NamePlate);
