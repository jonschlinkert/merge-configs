'use strict';

var path = require('path');
var camelcase = require('camel-case');
var gm = require('global-modules');
var glob = require('matched');
var home = require('homedir-polyfill');
var isObject = require('isobject');
var merge = require('merge-deep');
var read = require('read-data');

function configs(name, types, options) {
  if (typeof name !== 'string') {
    throw new TypeError('expected name to be a string');
  }

  if (isObject(types)) {
    var temp = options;
    options = types;
    types = temp;
  }

  var opts = Object.assign({}, options);
  var key = camelcase(name);
  types = arrayify(types || opts.types).map(function(name) {
    return name === 'package' ? 'pkg' : name;
  });

  var defaults = createPatterns(name, opts);
  var config = {};
  var js = [];

  for (var i = 0; i < defaults.length; i++) {
    var location = defaults[i];
    if (types.length && types.indexOf(location.type) === -1) {
      continue;
    }

    var typeOpts = merge({dot: true}, location, opts.config);
    var files = glob.sync(typeOpts.patterns, typeOpts);

    config[typeOpts.type] = files.reduce(function(acc, basename) {
      var fp = path.join(typeOpts.cwd, basename);
      var ext = path.extname(basename);
      var file = {type: location, path: fp, basename: basename, extname: ext};

      if (typeof opts.filter === 'function' && opts.filter(file) === false) {
        return acc;
      }

      if (ext === '.js') {
        js.push(fp);
        return acc;
      }

      if (!/\.(ya?ml|json)$/.test(ext)) {
        return acc;
      }

      var data = read.sync(fp);
      if (basename === 'package.json') {
        data = data[key] || data[name] || {};
      }

      acc = merge({}, acc, data);
      return acc;
    }, {});
  }

  if (types.length && opts.merge !== false) {
    config.merged = mergeConfigs(types, config);
  }

  config.js = js;
  return config;
}

function createPatterns(name, options) {
  var opts = Object.assign({cwd: process.cwd(), dot: true}, options);
  var files = opts.files || [
    `.${name}*.{json,yaml,yml}`,
    `${name}*.js`
  ];

  return [
    {
      type: 'pkg',
      cwd: opts.cwd,
      patterns: ['package.json']
    },
    {
      type: 'cwd',
      cwd: opts.cwd,
      patterns: files
    },
    {
      type: 'local',
      cwd: path.join(opts.cwd, 'node_modules'),
      patterns: prepend({
        dir: `${name}-config-*`,
        files: files
      })
    },
    {
      type: 'global',
      cwd: opts.global || gm,
      patterns: prepend({
        dir: `${name}-config-*`,
        files: files
      })
    },
    {
      type: 'home',
      cwd: opts.home || home(),
      patterns: prepend({
        dir: `.${name}`,
        files: files
      })
    }
  ];
}

function prepend(options) {
  var patterns = arrayify(options.files).slice();
  var prefix = options.dir;
  if (!prefix) return patterns;
  for (var i = 0; i < patterns.length; i++) {
    patterns[i] = prefix + '/' + patterns[i];
  }
  return patterns;
}

function mergeConfigs(keys, configs) {
  var config = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var obj = configs[key];
    if (obj.only === true) {
      return obj;
    }
    if (!isObject(obj) || obj.merge === false) {
      continue;
    }
    config = merge({}, config, obj);
  }
  return config;
}

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

/**
 * Expose `configs`
 */

module.exports = configs;
