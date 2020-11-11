import React from 'react';
import { List, Datagrid, TextField, NumberField, BooleanField } from 'react-admin';

export const LocationList = props => {
    return (<List {...props} sort={{ field: 'name', order: 'DESC'}}>
        <Datagrid rowClick="edit">
            <TextField source="id"/>
            <TextField source="name"/>
            <NumberField source="maxUsersPerInstance"/>
            <TextField source="sceneId"/>
            <BooleanField source="location_setting.videoEnabled" title="Enable video"/>
            <TextField source="location_setting.locationType" title="Location Type" />
            <TextField source="location_setting.instanceMediaChatEnabled" title="Enable global media chat"/>
        </Datagrid>
    </List>);
};