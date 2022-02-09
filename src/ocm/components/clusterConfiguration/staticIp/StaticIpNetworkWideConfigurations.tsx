import React from 'react';
import { Form, Text, TextVariants, FormSelectOptionProps } from '@patternfly/react-core';
import { CheckboxField, InputField, SelectField } from '../../../../common';
import { useField } from 'formik';
import {
  AddressData,
  StaticNetworkWideConfigurations,
  StaticProtocolType,
} from '../../../services';
import StaticIpDataService from '../../../services/StaticIpDataService';
import { showIpv4, showIpv6 } from '../../../services/StaticIpFormHostToYaml';

const AddressDataFields: React.FC<{
  fieldName: string;
  protocolVersionLabel: string;
}> = ({ protocolVersionLabel, fieldName }) => {
  const dataTestIdPrefix = protocolVersionLabel.toLowerCase();
  return (
    <>
      <Text component={TextVariants.h4}>{protocolVersionLabel}</Text>
      <InputField
        name={`${fieldName}.subnet`}
        isRequired={true}
        data-testid={`${dataTestIdPrefix}-subnet`}
      />
      <InputField
        isRequired
        label="Gateway"
        name={`${fieldName}.gateway`}
        data-testid={`${dataTestIdPrefix}-gateway`}
      />
      <InputField
        isRequired
        label="DNS"
        name={`${fieldName}.dns`}
        data-testid={`${dataTestIdPrefix}-dns`}
      />
    </>
  );
};

const protocolVersionOptions: FormSelectOptionProps[] = [
  {
    label: 'IPv4',
    value: 'ipv4',
  },
  {
    label: 'IPv6',
    value: 'ipv6',
  },
];

export const ProtocolTypeSelect: React.FC<{ parentFieldName: string }> = ({ parentFieldName }) => {
  const selectFieldName = `${parentFieldName}.protocolType`;
  const [{ value: protocolType }, , { setValue: setProtocolType }] = useField<StaticProtocolType>(
    selectFieldName,
  );
  const [, , { setValue: setIpv4 }] = useField<AddressData>(`${parentFieldName}.ipv4`);
  const [, , { setValue: setIpv6 }] = useField<AddressData>(`${parentFieldName}.ipv6`);
  const onChange = (e: React.FormEvent<HTMLSelectElement>) => {
    const newProtocolType = e.currentTarget.value as StaticProtocolType;
    if (newProtocolType === protocolType) {
      return;
    }
    if (newProtocolType === 'both') {
      //keep previous values
      if (protocolType === 'ipv4') {
        setIpv6(StaticIpDataService.getEmptyAddressData());
      } else {
        setIpv4(StaticIpDataService.getEmptyAddressData());
      }
    } else {
      setIpv4(StaticIpDataService.getEmptyAddressData());
      setIpv6(StaticIpDataService.getEmptyAddressData());
    }
    setProtocolType(newProtocolType);
  };
  return (
    <SelectField
      label="Internet protocol version"
      options={protocolVersionOptions}
      name={selectFieldName}
      callFormikOnChange={false}
      onChange={onChange}
      data-testid="select-protocol-version"
    />
  );
};

export const StaticIpNetworkWideConfigurations: React.FC = () => {
  const fieldName = 'formData.networWideConfigurations';
  const [{ value }] = useField<StaticNetworkWideConfigurations>(fieldName);
  const protocolType = value.protocolType;
  return (
    <Form>
      <Text component={TextVariants.h3}>Network-wide configurations</Text>
      <Text component={TextVariants.small}>
        The following configurations are applicable to all the hosts.
      </Text>
      <ProtocolTypeSelect parentFieldName={fieldName} />
      <CheckboxField label="Use VLAN" name={`${fieldName}.useVlan`} data-testid="use-vlan" />
      {value.useVlan && (
        <InputField label="VLAN ID" name={`${fieldName}.vlanId`} isRequired data-testid="vlan-id" />
      )}
      {showIpv4(protocolType) && (
        <AddressDataFields
          fieldName={`${fieldName}.ipv4`}
          protocolVersionLabel="IPv4"
        ></AddressDataFields>
      )}
      {showIpv6(protocolType) && (
        <AddressDataFields
          fieldName={`${fieldName}.ipv6`}
          protocolVersionLabel="IPv6"
        ></AddressDataFields>
      )}
    </Form>
  );
};
