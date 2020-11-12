import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    SelectInput,
    ReferenceInput,
    required,
    minValue
} from 'react-admin';

const validateName = required();
const validateMaxUsers = [required(), minValue(2)];
const validateScene = required();

const collectionText = (record) => `${record.name} (${record.sid})`;

export const LocationCreate = props => {
    return (<Create {...props}>
        <SimpleForm>
            <TextInput source="name" validate={validateName}/>
            <NumberInput source="maxUsersPerInstance" initialValue={8} min={1} max={50} validate={validateMaxUsers}/>
            <ReferenceInput
                source='sceneId'
                reference='collection'
                perPage={1000}
                validate={validateScene}
            >
                <SelectInput
                    optionText={collectionText}
                />
            </ReferenceInput>
            <BooleanInput source="location_setting.videoEnabled" label="Enable video"/>
            <ReferenceInput
                source='location_setting.locationType'
                reference='location-type'
                label='Location Type'
                perPage={100}
            >
                <SelectInput
                    optionText='type'
                />
            </ReferenceInput>
            <BooleanInput source="location_setting.instanceMediaChatEnabled" label="Enable global media chat"/>
        </SimpleForm>
    </Create>);
};