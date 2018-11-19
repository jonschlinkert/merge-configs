/**
 * @fileoverview Common helpers for naming of plugins, formatters and configs
 */
'use strict';

const paths = require('./paths');
const SCOPE_REGEX = /^@(.*)\/(?=.)/;

/**
 * Brings package name to correct format based on prefix
 * @param {string} name The name of the package.
 * @param {string} prefix Can be either "eslint-plugin", "eslint-config" or "eslint-formatter"
 * @returns {string} Normalized name of the package
 * @private
 */

function normalizePackageName(pkgName, prefix) {
  let name = paths.unixify(pkgName);
  if (name.charAt(0) === '@') {
    // it's a scoped package package pkgName is the prefix, or just a username
    const scopedShortRegex = new RegExp(`^(@[^/]+)(?:/(?:${prefix})?)?$`);

    if (scopedShortRegex.test(name)) {
      name = name.replace(scopedShortRegex, `$1/${prefix}`);
    }

    const scopedPkgRegex = new RegExp(`^${prefix}(-|$)`);
    if (!scopedPkgRegex.test(name.split('/')[1])) {
      // for scoped packages, insert the prefix after the first /
      // unless the path is already @scope/eslint or @scope/eslint-xxx-yyy
      name = name.replace(/^@([^/]+)\/(.*)$/, `@$1/${prefix}-$2`);
    }
  } else if (name.indexOf(`${prefix}-`) !== 0) {
    name = `${prefix}-${name}`;
  }
  return name;
}

/**
 * Strip the given prefix from a string.
 * @param {string} string The string from which to remove the prefix.
 * @param {string} prefix
 * @returns {string} The string without prefix.
 */

function stripPrefix(str, prefix) {
  return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}

/**
 * Add a prefix to the given string.
 * @param {string} string The string to be prefixed.
 * @param {string} prefix
 * @returns {string} The string with prefix.
 */

function addPrefix(str, prefix) {
  return str.startsWith(prefix) ? str : (prefix + str);
}

/**
 * Gets the scope (namespace) of a string.
 * @param {string} string The string which may have the namespace.
 * @returns {string} The namepace of the string if it has one.
 */

function getScope(str) {
  const match = SCOPE_REGEX.exec(str);
  return match ? match[0] : '';
}

/**
 * Removes the namespace from a string.
 * @param {string} string The string which may have the namespace.
 * @returns {string} The name of the plugin without the namespace.
 */

function removeScope(str) {
  return str.replace(SCOPE_REGEX, '');
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  normalizePackageName,
  stripPrefix,
  addPrefix,
  getScope,
  removeScope
};
