import * as Yup from 'yup';
import {
  getIpAddressValidationSchema,
  HostStaticNetworkConfig,
  macAddressValidationSchema,
  MacInterfaceMap,
} from '../../../../common';
import {
  StaticIpView,
  StaticIpValues,
  StaticFormData,
  ProtocolVersion,
  AddressData,
  HostConfiguration,
  StaticProtocolType,
} from '../../../services';
import { showIpv4, showIpv6 } from '../../../services/StaticIpFormHostToYaml';
import isCIDR from 'is-cidr';
import { isInSubnet } from 'is-in-subnet';
const requiredMsg = 'A value is required';
const NUMBER_REGEX = /\d+/;
export const macInterfaceMapValidationSchema = Yup.array().of(
  Yup.object<MacInterfaceMap>().shape({
    macAddress: macAddressValidationSchema.required(requiredMsg),
    logicalNicName: Yup.string().required(requiredMsg),
  }),
);

export const yamlViewValidationSchema = Yup.array<HostStaticNetworkConfig>().of(
  Yup.object().shape({
    networkYaml: Yup.string().required('YAML is a required field'),
    macInterfaceMap: macInterfaceMapValidationSchema,
  }),
);

const getAddressDataValidationSchema = (protocolVersion: ProtocolVersion) => {
  const example = protocolVersion === 'ipv4' ? '123.123.123.0/24' : '2055:d7a::/116';
  const msg = `Invalid ${protocolVersion} IP address block. Expected value is a network expressed in CIDR notation (IP/netmask). For example: ${example}`;
  return Yup.lazy<AddressData>((values) => {
    return Yup.object().shape({
      dns: getIpAddressValidationSchema('dns', protocolVersion).required(requiredMsg),
      subnet: Yup.string()
        .required(requiredMsg)
        .test('valid-cidr', msg, (value = '') => {
          console.log(
            protocolVersion,
            protocolVersion === 'ipv4' ? isCIDR.v4(value) : isCIDR.v6(value),
          );
          return protocolVersion === 'ipv4' ? isCIDR.v4(value) : isCIDR.v6(value);
        }),
      gateway: Yup.string()
        .required(requiredMsg)
        .test('is-in-subnet', `IP Address is outside of subnet ${values.subnet}`, function (value) {
          const ipValidationSchema = getIpAddressValidationSchema('gateway', protocolVersion);
          if (!value || !values.subnet) {
            return true;
          }
          try {
            ipValidationSchema.validateSync(value);
          } catch (err) {
            return this.createError({ message: err.message });
          }
          return isInSubnet(value, values.subnet);
        }),
    });
  });
};

const networkWideConfigurationSchema = Yup.object().shape({
  useVlan: Yup.boolean(),
  vlanId: Yup.string().when('useVlan', {
    is: true,
    then: Yup.string().matches(NUMBER_REGEX, { excludeEmptyString: true }).required(requiredMsg),
  }),
  protocolType: Yup.mixed().oneOf(['ipv4', 'ipv6', 'both']),
  ipv4: Yup.object<AddressData>().when('protocolType', {
    is: (protocolType) => showIpv4(protocolType),
    then: getAddressDataValidationSchema('ipv4'),
  }),
  ipv6: Yup.object<AddressData>().when('protocolType', {
    is: (protocolType) => showIpv6(protocolType),
    then: getAddressDataValidationSchema('ipv6'),
  }),
});

const getFormViewHostsValidationSchema = (protocolType: StaticProtocolType) => {
  return Yup.array<HostConfiguration>().of(
    Yup.object().shape({
      macAddress: macAddressValidationSchema.required(requiredMsg),
      ipv4Address: showIpv4(protocolType)
        ? getIpAddressValidationSchema('dns', 'ipv4').required(requiredMsg)
        : Yup.string(),
      ipv6Address: showIpv6(protocolType)
        ? getIpAddressValidationSchema('dns', 'ipv6').required(requiredMsg)
        : Yup.string(),
    }),
  );
};

const hostConfigurationSchema = Yup.array<HostConfiguration>().when(
  'networWideConfigurations.protocolType',
  {
    is: 'ipv4',
    then: getFormViewHostsValidationSchema('ipv4'),
    otherwise: Yup.array<HostConfiguration>().when('networWideConfigurations.protocolType', {
      is: 'ipv6',
      then: getFormViewHostsValidationSchema('ipv6'),
      otherwise: getFormViewHostsValidationSchema('both'),
    }),
  },
);

const getFormViewValidationSchema = (validateFormHosts: boolean) => {
  return Yup.object().shape<StaticFormData>({
    networWideConfigurations: networkWideConfigurationSchema,
    hostConfigurations: validateFormHosts
      ? hostConfigurationSchema
      : Yup.array<HostConfiguration>(),
  });
};

export const getStaticIpValidationSchema = (validateFormHosts: boolean) => {
  return Yup.object<StaticIpValues>().shape({
    yamlData: Yup.array().when('configType', {
      is: StaticIpView.YAML,
      then: yamlViewValidationSchema,
    }),
    configType: Yup.string(),
    formData: Yup.object().when('configType', {
      is: StaticIpView.FORM,
      then: getFormViewValidationSchema(validateFormHosts),
    }),
  });
};
