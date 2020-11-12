import React from 'react';
import { List, Datagrid, TextField, NumberField } from 'react-admin';
import { BooleanNumField } from '../Fields/BoolNumField';

export const CollectionList = props => {
    return (<List {...props} sort={{ field: 'name', order: 'DESC'}}>
        <Datagrid rowClick="edit">
            <TextField source="id"/>
            <TextField source="sid" />
            <TextField source="name"/>
            <TextField source="description" />
            <NumberField source="version" />
            <BooleanNumField source="isPublic" />
        </Datagrid>
    </List>);
};