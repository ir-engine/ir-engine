import React, { useEffect } from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styles from '../Admin.module.scss';
import { retrieveReceivedInvites, retrieveSentInvites, sendInvite } from "../../../../redux/invite/service"
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { selectInviteState } from "../../../../redux/invite/selector";
import { bindActionCreators, Dispatch } from "redux";
import { withRouter, Router } from "next/router";
import { connect } from "react-redux";
import { Delete } from "@material-ui/icons";

interface Props {
  router: Router,
  receivedInvites?: any,
  retrieveReceivedInvites?: any,
  sendInvite?: any,
  sentInvites?: any,
  invites: any
}

const mapStateToProps = (state: any): any => {
  return {
    receivedInvites: selectInviteState(state),
    sentInvites: selectInviteState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  retrieveReceivedInvites: bindActionCreators(retrieveReceivedInvites, dispatch),
  sendInvite: bindActionCreators(sendInvite, dispatch),
  retrieveSentInvites: bindActionCreators(retrieveSentInvites, dispatch)
});


const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(id: string, name: string, userRole: string, passcode: string, type: string) {
  return { id, name, userRole, passcode, type };
}

const RecievedInvite = (props: Props) => {
  const classes = useStyles();
  const { retrieveReceivedInvites, receivedInvites, sendInvite, sentInvite, invites } = props
  const rows = invites.map((el, index) => createData(el.id, el.user.name, el.user.userRole, el.passcode, el.inviteType));

  return (
    <TableContainer >
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Id </TableCell>
            <TableCell align="right">Name</TableCell>
            <TableCell align="right">User role</TableCell>
            <TableCell align="right">Passcode</TableCell>
            <TableCell align="right">Type</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`index_${index}`}>
              <TableCell component="th" scope="row">
                {row.id}
              </TableCell>
              <TableCell align="right">{row.name}</TableCell>
              <TableCell align="right">{row.userRole}</TableCell>
              <TableCell align="right">{row.passcode}</TableCell>
              <TableCell align="right">{row.type}</TableCell>
              <TableCell align="right"><Delete className="text-danger"/> </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RecievedInvite));