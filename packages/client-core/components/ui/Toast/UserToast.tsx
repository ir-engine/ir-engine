import React from "react";
import { connect } from 'react-redux';
import { selectUserState } from '../../../redux/user/selector';
import Toast from './Toast';
// @ts-ignore
import style from "./toast.module.scss";

type Props = {
  user?: any;
}

const mapStateToProps = (state: any): any => {
  return {
    user: selectUserState(state),
  };
};

const UserToast = (props: Props) => {
  const messages = props.user?.get('toastMessages');
  const msgs = messages
    ? Array.from(messages).map((m: any) => {
      if (m.args.userAdded) return <span><span className={style.userAdded}>{m.user.name}</span> joined</span>
      else if (m.args.userRemoved) return <span><span className={style.userRemoved}>{m.user.name}</span> left</span>
    }) : [];


  return (
    <Toast
      messages={msgs}
      customClass={style.userToastContainer}
    />
  )
};

export default connect(mapStateToProps)(UserToast);
