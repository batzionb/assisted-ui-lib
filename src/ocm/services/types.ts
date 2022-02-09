import { ClusterCreateParams, ClusterDetailsValues, HostStaticNetworkConfig } from '../../common';

export type CreateParams = ClusterCreateParams & {
  staticNetworkConfig?: HostStaticNetworkConfig[];
};

export enum HostsNetworkConfigurationType {
  STATIC = 'static',
  DHCP = 'dhcp',
}

export type OcmClusterDetailsValues = ClusterDetailsValues & {
  cpuArchitecture: string;
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
};

export enum StaticIpView {
  YAML = 'yaml',
  FORM = 'form',
}

export type ProtocolVersion = 'ipv4' | 'ipv6';
export type StaticProtocolType = ProtocolVersion | 'both';

export type AddressData = {
  subnet: string;
  gateway: string;
  dns: string;
};

export type StaticNetworkWideConfigurations = {
  protocolType: StaticProtocolType;
  useVlan: boolean;
  vlanId: string;
  ipv4: AddressData;
  ipv6: AddressData;
};

export type HostConfiguration = {
  macAddress: string;
  ipv4Address: string;
  ipv6Address: string;
};

export type StaticFormData = {
  networWideConfigurations: StaticNetworkWideConfigurations;
  hostConfigurations: HostConfiguration[];
};

export type StaticIpValues = {
  configType: StaticIpView;
  yamlData: HostStaticNetworkConfig[];
  formData: StaticFormData;
};

export type MacIpMap = {
  mac: string;
  ip: string;
}[];

export type StaticIpInfo = {
  isDataComplete: boolean;
  view: StaticIpView;
};
