import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import * as styles from './Admin.module.scss';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(0),
            minWidth: 120,
            backgroundColor: "white"
        },
        selectEmpty: {
            marginTop: theme.spacing(0),
        },
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
        }
    }),
);

export default function CroupsConsole() {
    const classes = useStyles();
    const [dense, setDense] = React.useState(false);

    const headCells = {
        groups: [
            { id: "id", numeric: false, disablePadding: true, label: "ID" },
            { id: "name", numeric: false, disablePadding: false, label: "Name"},
            { id: "description", numeric: false, disablePadding: false, label: "Description"},
            { id: "action", numeric: false, disablePadding: false, label: "Action"}
        ]
    };

    type Order = 'asc' | 'desc';

    interface EnhancedTableProps {
        numSelected?: number;
        onRequestSort?: (event: React.MouseEvent<unknown>, property) => void;
        order?: Order;
        orderBy?: string;
    }

    function  EnchancedTableHead (props: EnhancedTableProps ) {
        const { order, orderBy, onRequestSort } = props;
        const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

        return (
            <TableHead className={styles.thead}>
                <TableRow className={styles.trow}>
                    {headCells.groups.map((headCell) => (
                        <TableCell
                            className={styles.tcell}
                            key={headCell.id}
                            align='right'
                            padding={headCell.disablePadding ? 'none' : 'default'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        ); 
    }

    return (
        <div>
            <Paper className={styles.adminRoot}>
                <TableContainer className={styles.tableContainer}>
                    <Table 
                      stickyHeader
                      aria-labelledby="tableTitle"
                      size={dense ? 'small' : 'medium' }
                      aria-label="enhanced table"
                      >
                          <EnchancedTableHead
                           />
                           <TableBody className={styles.thead} />
                      </Table>
                </TableContainer>
            </Paper>
        </div>
    );
}
