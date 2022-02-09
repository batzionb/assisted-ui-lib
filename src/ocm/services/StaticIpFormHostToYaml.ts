import { dump } from 'js-yaml';
import { toInteger } from 'lodash';
import {
  StaticProtocolType,
  ProtocolVersion,
  HostConfiguration,
  StaticNetworkWideConfigurations,
} from './types';

export const addressToString = (address: string[], protocolVersion: ProtocolVersion) => {
  const separator = protocolVersion === 'ipv4' ? '.' : ':';
  return address.join(separator);
};

export const getCommonPrefix = (str1: string, str2: string): string => {
  let prefix = '';
  let i = 0;
  const trimmed1 = str1.trim();
  const trimmed2 = str2.trim();
  while (i < trimmed1.length && i < trimmed2.length && trimmed1[i] === trimmed2[i]) {
    if (trimmed1[i] !== '') prefix += trimmed1[i];
    i++;
  }
  return prefix;
};

export const showIpv4 = (protocolType: StaticProtocolType) => {
  return ['ipv4', 'both'].includes(protocolType);
};

export const showIpv6 = (protocolType: StaticProtocolType) => {
  return ['ipv6', 'both'].includes(protocolType);
};

const getPrefixLength = (subnet: string): number => {
  const split = subnet.split('/');
  if (split.length < 2) {
    throw `${subnet} isn't a valid cidr`;
  }
  return toInteger(split[1]);
};

const getDnsSection = (
  ipv4Dns: string,
  ipv6Dns: string,
  protocolType: StaticProtocolType,
): object => {
  const servers: string[] = [];
  if (showIpv4(protocolType)) {
    servers.push(ipv4Dns);
  }
  if (showIpv6(protocolType)) {
    servers.push(ipv6Dns);
  }
  return { config: { server: servers } };
};

const getVlanInterface = (nicName: string, vlanId: string): object => {
  return {
    name: `${nicName}.${vlanId}`,
    type: 'vlan',
    state: 'up',
    vlan: { 'base-iface': nicName, id: parseInt(vlanId) },
  };
};

const getEthernetInterface = (
  nicName: string,
  address: string,
  prefixLength: number,
  protocol: ProtocolVersion,
): object => {
  return {
    name: nicName,
    type: 'ethernet',
    state: 'up',
    [protocol]: {
      address: [
        {
          ip: address,
          'prefix-length': prefixLength,
        },
      ],
      enabled: true,
      dhcp: false,
    },
  };
};

const getInterfaces = (
  networkWideConfiguration: StaticNetworkWideConfigurations,
  formHostData: HostConfiguration,
  nicName: string,
): object[] => {
  const interfaces = [];
  if (showIpv4(networkWideConfiguration.protocolType)) {
    interfaces.push(
      getEthernetInterface(
        nicName,
        formHostData.ipv4Address,
        getPrefixLength(networkWideConfiguration.ipv4.subnet),
        'ipv4',
      ),
    );
  }
  if (showIpv6(networkWideConfiguration.protocolType)) {
    interfaces.push(
      getEthernetInterface(
        nicName,
        formHostData.ipv6Address,
        getPrefixLength(networkWideConfiguration.ipv6.subnet),
        'ipv6',
      ),
    );
  }
  if (networkWideConfiguration.useVlan) {
    interfaces.push(getVlanInterface(nicName, networkWideConfiguration.vlanId));
  }
  return interfaces;
};

const getRoutesSection = (
  nicName: string,
  networkWideConfiguration: StaticNetworkWideConfigurations,
): object => {
  const gatewayAddress =
    networkWideConfiguration.protocolType == 'ipv6'
      ? networkWideConfiguration.ipv6.gateway
      : networkWideConfiguration.ipv4.gateway;
  return {
    config: [
      {
        destination: networkWideConfiguration.protocolType === 'ipv4' ? '0.0.0.0/0' : '::/0',
        'next-hop-address': gatewayAddress,
        'next-hop-interface': nicName,
        'table-id': 254,
      },
    ],
  };
};

export const formHostDataToYamlStr = (
  networkWideConfiguration: StaticNetworkWideConfigurations,
  formHostData: HostConfiguration,
  nicName: string,
): string => {
  const interfaces = getInterfaces(networkWideConfiguration, formHostData, nicName);
  const dns = getDnsSection(
    networkWideConfiguration.ipv4.dns,
    networkWideConfiguration.ipv6.dns,
    networkWideConfiguration.protocolType,
  );
  const routes = getRoutesSection(nicName, networkWideConfiguration);
  const json = {
    interfaces: interfaces,
    'dns-resolver': dns,
    routes: routes,
  };
  return dump(json);
};
