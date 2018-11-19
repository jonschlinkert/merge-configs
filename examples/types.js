'use strict';

const os = require('os');
const path = require('path');
const gm = require('global-modules');
const MergeConfigs = require('..');

module.exports = function(name, options) {
  const config = new MergeConfigs(options);

  // globally installed NPM packages
  config.type('global', {
    patterns: [`${name}-config-*/*.{json,yaml,yml}`],
    options: { cwd: gm }
  });

  // locally installed NPM packages (in "node_modules")
  config.type('local', {
    patterns: [`${name}-config-*/.${name}rc.{json,yaml,yml}`],
    options: {
      cwd: path.join(process.cwd(), 'node_modules')
    }
  });

  // in user home
  config.type('home', {
    patterns: [`.${name}rc.{json,yaml,yml}`],
    options: { cwd: os.homedir() }
  });

  // in the current working directory
  config.type('cwd', {
    patterns: [`.${name}rc.{json,yaml,yml}`]
  });

  // in package.json
  config.type('package', {
    patterns: ['package.json'],
    load: file => file.data[name]
  });

  return config;
};
