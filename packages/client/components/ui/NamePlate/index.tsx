import React, { useState } from "react";

import styles from './NamePlate.module.scss';
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
  focused: boolean | false;
  userState?: any;
  autoHideDuration?: any;
}

const mapStateToProps = (state: any): any => {
  return {   
    userState: selectUserState(state),
  };
};

const NamePlate = (props: Props) =>{
  const {userId, position, focused, userState} = props;
  const user = userState.get('layerUsers').find(user => user.id === userId);

  const [openNamePlate, setOpenNamePlate] = useState(true);
  // const fadeOutTimer = setTimeout(()=>{setOpenNamePlate(false);clearTimeout(fadeOutTimer);}, 5000);

  const cardFadeInOut = () =>{
    const fadeOutTimer = setTimeout(()=>{setOpenNamePlate(false);clearTimeout(fadeOutTimer);}, 5000);
    };
    cardFadeInOut();

  const handleCloseNamePlate = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenNamePlate(false);
  };

  const snackbarProps = {
    open: openNamePlate,    
    className: styles.namePlate, 
    style: {top: position.y, left: position.x },
    // ...(isFocused === false && { autoHideDuration }),
    message: user?.name,
    onClose: handleCloseNamePlate
 };
 return <Snackbar {...snackbarProps} />;
};

export default connect(mapStateToProps)(NamePlate);
