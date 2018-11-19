'use strict';

const path = require('path');

/**
 * Normalize slashes in paths to posix style forward slashes
 * @param {string} filepath Path to convert
 * @returns {string} Converted filepath
 */

function unixify(filepath) {
  return path.normalize(filepath).replace(/\\/g, '/');
}

/**
 * Converts an absolute filepath to a relative path from the given `base` path.
 */

function relative(filepath, base) {
  const abs = path.isAbsolute(filepath) ? filepath : path.resolve(filepath);

  if (base) {
    assert(path.isAbsolute(base), 'expected base to be an absolute path');
    return path.relative(base, abs);
  }

  if (abs[0] === '/') {
    return abs.slice(1);
  }
  return abs;
}

module.exports = { unixify, relative };
