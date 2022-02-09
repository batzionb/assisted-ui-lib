import React from 'react';
import { Form, FormGroup } from '@patternfly/react-core';
import StaticIpHostsArray, { HostComponentProps } from './StaticIpHostsArray';
import { useField, useFormikContext } from 'formik';
import { HostConfiguration, StaticIpValues, StaticProtocolType } from '../../../services';
import { getFieldId, InputField } from '../../../../common';
import Address from './Address';
import HostSummary from './HostSummary';
import StaticIpDataService from '../../../services/StaticIpDataService';
import { showIpv4, showIpv6 } from '../../../services/StaticIpFormHostToYaml';

const ExpandedHost: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
  const { values, setFieldValue } = useFormikContext<StaticIpValues>();
  const protocolType = values.formData.networWideConfigurations.protocolType;
  return (
    <Form>
      <InputField
        name={`${fieldName}.macAddress`}
        label="MAC Address"
        isRequired
        data-testid={`mac-address-${hostIdx}`}
      />
      {showIpv4(protocolType) && (
        <FormGroup
          label="IP address (IPv4)"
          fieldId={getFieldId(`${fieldName}.ipv4Address`, 'input')}
        >
          <InputField
            name={`${fieldName}.ipv4Address`}
            isRequired={true}
            data-testid={`ipv4-address-${hostIdx}`}
          />{' '}
        </FormGroup>
      )}
      {showIpv6(protocolType) && (
        <FormGroup
          label="IP address (IPv6)"
          fieldId={getFieldId(`${fieldName}.ipv6Address`, 'input')}
        >
          <InputField
            name={`${fieldName}.ipv6Address`}
            isRequired={true}
            data-testid={`ipv6-address-${hostIdx}`}
          />
        </FormGroup>
      )}
    </Form>
  );
};

const CollapsedHost: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
  const [{ value }, { error }] = useField<HostConfiguration>({
    name: fieldName,
  });
  const [{ value: protocolType }] = useField<StaticProtocolType>({
    name: 'formData.networWideConfigurations.protocolType',
  });
  let mapValue = '';
  if (protocolType === 'ipv4') {
    mapValue = value.ipv4Address;
  } else if (protocolType === 'ipv6') {
    mapValue = value.ipv6Address;
  } else {
    mapValue = `${value.ipv4Address}, ${value.ipv6Address}`;
  }
  return (
    <HostSummary
      title="MAC to IP mapping"
      numInterfaces={1}
      macAddress={value.macAddress}
      mappingValue={mapValue}
      hostIdx={hostIdx}
      hasError={!!error}
    ></HostSummary>
  );
};

export const StaticIpHostSpecificConfigurations: React.FC = () => {
  const fieldName = 'formData.hostConfigurations';
  const { values, setFieldValue } = useFormikContext<StaticIpValues>();
  return (
    <StaticIpHostsArray<HostConfiguration>
      fieldName={fieldName}
      CollapsedHostComponent={CollapsedHost}
      ExpandedHostComponent={ExpandedHost}
      emptyHostData={StaticIpDataService.getNewFormHost(values.formData.networWideConfigurations)}
    />
  );
};
