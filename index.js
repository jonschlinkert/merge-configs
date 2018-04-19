'use strict';

const path = require('path');
const assert = require('assert');
const Emitter = require('@sellside/emitter');
const read = require('read-data');
const merge = require('merge-deep');
const glob = require('matched');
const File = require('vinyl');

/**
 * Create an instance of `MergeConfigs` with the given `options`.
 *
 * ```js
 * const MergeConfigs = require('merge-configs');
 * const mergeConfigs = new MergeConfigs();
 * ```
 * @param {Object} `options`
 * @return {Object} Instance of `MergeConfigs`
 * @api public
 */

class MergeConfig extends Emitter {
  constructor(config) {
    super();
    this.config = Object.assign({}, config);
    this.defaults = { options: {}, files: [], data: {} };

    if (typeof this.config.patterns === 'string') {
      this.config.patterns = [this.config.patterns];
    }

    this.options = this.config.options || {};
    this.loaders = {};
    this.types = {};

    if (this.options.builtinLoaders !== false) {
      this.builtins();
    }
  }

  /**
   * Built-in loaders
   */

  builtins() {
    this.loader('yml', file => read.yaml.sync(file.path));
    this.loader('yaml', file => read.yaml.sync(file.path));
    this.loader('json', file => read.json.sync(file.path));
    this.loader('js', file => {
      const contents = require(file.path);
      delete require.cache[file.path];
      return contents;
    });
  }

  /**
   * Create a new config type with the given settings
   * @param {String} `type`
   * @param {Object} `settings` Must have a `.patterns` property with a string or array of globs.
   * @return {Object}
   */

  setType(type, config) {
    assert(typeof type === 'string', 'expected type to be a string');
    const settings = merge({ type }, this.defaults, this.config, config);

    if (typeof settings.patterns === 'string') {
      settings.patterns = [settings.patterns];
    }

    assert(settings.patterns.length > 0, 'expected glob to be a string or array');
    this.types[type] = settings;
    return this;
  }

  /**
   * Get config `type`.
   * @param {String} `type`
   * @return {Object}
   */

  getType(type) {
    assert(this.types.hasOwnProperty(type), `config type "${type}" does not exist`);
    return this.types[type];
  }

  /**
   * Set config `type` with the given `settings`, or get `type` if
   * `settings` is undefined.
   *
   * @param {String} `type`
   * @param {Object} `settings` (optional)
   * @return {Object}
   * @api public
   */

  type(type, settings) {
    assert.equal(typeof type, 'string', 'expected type to be a string');
    if (typeof settings === 'undefined') {
      return this.getType(type);
    }
    this.setType(type, settings);
    return this;
  }

  /**
   * Resolve config files for the given `type`.
   *
   * @param {String} `type`
   * @return {Object}
   * @api public
   */

  resolve(type) {
    assert.equal(typeof type, 'string', 'expected type to be a string');
    const config = this.type(type);
    const files = glob.sync(config.patterns, config.options);
    const cwd = config.options.cwd || process.cwd();
    const configFiles = [];

    for (const filename of files) {
      const filepath = path.resolve(cwd, filename);
      const file = new File({ path: filepath, cwd: cwd });
      if (typeof config.filter === 'function' && !config.filter(file)) {
        continue;
      }
      configFiles.push(file);
    }
    this.emit('resolved', type, configFiles);
    return configFiles;
  }

  /**
   * Register a loader for a type of file, by `extname`. Loaders are functions
   * that receive a [vinyl][] `file` object as the only argument and should
   * return the config object to use.
   *
   * ```js
   * // basic loader example
   * config.loader('json', file => JSON.stringify(file.contents));
   *
   * // example of loading eslint config files
   * config.loader('json', file => {
   *   const data = JSON.parse(file.contents);
   *   if (file.basename === 'package.json') {
   *     return data.eslintConfig;
   *   }
   *   if (file.basename === '.eslintrc.json') {
   *     return data;
   *   }
   *   return {};
   * });
   * ```
   * @param {String} `extname` File extension to associate with the loader
   * @param {Function} `fn` Loader function.
   * @return {Object}
   * @api public
   */

  loader(ext, fn) {
    assert.equal(typeof fn, 'function', 'expected loader to be a function');
    assert.equal(typeof ext, 'string', 'expected extname to be a string');
    if (ext[0] !== '.') ext = '.' + ext;
    this.loaders[ext] = fn;
    return this;
  }

  /**
   * Load a single config type.
   * @param {String} `type`
   * @return {Object} Returns the merged config object for the type
   */

  loadType(type) {
    const config = this.getType(type);
    const files = this.resolve(type);
    config.files = files;

    for (const file of files) {
      const data = this.loadFile(file, config);
      if (data && typeof data === 'object') {
        config.data = merge({}, config.data, data);
      }
    }
    return config;
  }

  /**
   * Load one or more config types.
   *
   * @param {String|Array} `types` Loads all types if undefined.
   * @return {Object} Returns the merged config object.
   * @api public
   */

  load(types) {
    const configs = {};
    if (!types) types = Object.keys(this.types);
    if (typeof types === 'string') types = [types];
    for (const type of types) {
      configs[type] = this.loadType(type);
    }
    configs.merge = () => {
      return types.reduce((acc, type) => merge({}, acc, configs[type].data), {});
    };
    return configs;
  }

  /**
   * Load config `file`
   * @param {Object} `file`
   * @param {Object} `config`
   * @return {Object} Returns the loaded config data.
   */

  loadFile(file, config) {
    const loader = this.loaders[file.extname];
    assert(loader, 'no loaders are registered for: ' + file.extname);
    file.data = loader.call(this, file, config);

    if (typeof config.load === 'function') {
      file.data = config.load.call(this, file, config);
    }
    return file.data;
  }

  /**
   * Merge one or more registered config types.
   *
   * @param {String|Array} `types` Merges all types if undefined.
   * @return {Object} Returns the merged config object.
   * @api public
   */

  merge(types, fn) {
    if (typeof types === 'function') return this.merge(null, types);
    if (typeof fn !== 'function') fn = obj => obj.data;
    if (!types) types = Object.keys(this.types);
    if (typeof types === 'string') types = [types];

    const config = this.load(types);
    let res = {};

    for (const type of types) {
      res = merge({}, res, fn(config[type]));
    }
    return res;
  }
}

/**
 * Expose `MergeConfig`
 */

module.exports = MergeConfig;
