import React from 'react';
import { BooleanField } from "react-admin";

export const BooleanNumField = ({ record = {}, source}) => {
    let theRecord = {...record};

    if (typeof theRecord[source] !== 'boolean') theRecord[source] = !!parseInt(record[source]);

    // @ts-ignore
    return (<BooleanField record={theRecord} source={source} />);
};