const { Address4, Address6 } = require('ip-address');

const getCommonPrefix = (str1: string, str2: string): string => {
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

const getPrefixLength = (subnet: string, protocolVersion: 'ipv4' | 'ipv6'): number => {
  const fromAddr =
    protocolVersion == 'ipv4' ? new Address4(subnetRange.from) : new Address6(subnetRange.from);
  const toAddr =
    protocolVersion == 'ipv4' ? new Address4(subnetRange.to) : new Address6(subnetRange.to);
  const fromBits = fromAddr.binaryZeroPad();
  const toBits = toAddr.binaryZeroPad();
  return getCommonPrefix(fromBits, toBits).length;
};

console.log(getPrefixLength({ from: '192.168.0.0', to: '192.168.0.255' }, 'ipv4'));
