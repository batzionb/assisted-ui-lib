// const _a = require('ip-address'),
//   Address4 = _a.Address4,
//   Address6 = _a.Address6;
// const getCommonPrefix = function (str1, str2) {
//   let prefix = '';
//   let i = 0;
//   const trimmed1 = str1.trim();
//   const trimmed2 = str2.trim();
//   while (i < trimmed1.length && i < trimmed2.length && trimmed1[i] === trimmed2[i]) {
//     if (trimmed1[i] !== '') prefix += trimmed1[i];
//     i++;
//   }
//   return prefix;
// };
// const getPrefixLength = function (subnetRange, protocolVersion) {
//   const fromAddr =
//     protocolVersion == 'ipv4' ? new Address4(subnetRange.from) : new Address6(subnetRange.from);
//   const toAddr =
//     protocolVersion == 'ipv4' ? new Address4(subnetRange.to) : new Address6(subnetRange.to);
//   const fromBits = fromAddr.binaryZeroPad();
//   const toBits = toAddr.binaryZeroPad();
//   return getCommonPrefix(fromBits, toBits).length;
// };
// console.log(getPrefixLength({ from: '192.168.0.0', to: '192.168.0.255' }, 'ipv4'));
// console.log(
//   getPrefixLength(
//     {
//       from: '2001:0db8:85a3:0000:0000:0000:0000:0000',
//       to: '2001:0db8:85a3:0000:ffff:ffff:ffff:ffff',
//     },
//     'ipv6',
//   ),
// );

// console.log(getCommonPrefix('2001:0db8:85a3::', '2001:0db8:85a3:0000:ffff:ffff:ffff:ffff'));

const cidrTools = require('cidr');
