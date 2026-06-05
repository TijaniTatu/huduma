// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase JS SDK ships CommonJS builds and relies on Metro's legacy module
// resolution. Expo SDK 53+ enables package.json "exports" resolution by
// default, which makes `firebase/auth` resolve to a build that never registers
// the auth component ("Component auth has not been registered yet"). Disabling
// package exports and adding the `cjs` source extension restores correct
// Firebase resolution.
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
