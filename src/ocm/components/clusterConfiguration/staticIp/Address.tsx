import { Flex, FlexItem, TextInput, Text } from '@patternfly/react-core';
import { FieldArray, useField } from 'formik';
import React from 'react';
import { getFieldId, InputField } from '../../../../common';
import { StaticProtocolType } from '../../../services';
import './staticIp.css';

export const showAddressData = (
  protocolType: StaticProtocolType,
  protocolVersion: 'ipv4' | 'ipv6',
) => {
  if (protocolType === 'both') {
    return true;
  }
  return protocolType === protocolVersion;
};

export const Address: React.FC<{ fieldName: string }> = ({ fieldName }) => {
  return (
    <>
      <InputField name={fieldName} isRequired={true} />
    </>
  );
};

export default Address;
