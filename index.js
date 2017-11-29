'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('matched');
const read = require('read-data');
const arrayify = require('arrayify-compact');
const merge = require('merge-deep');
const File = require('vinyl');

/**
 * Create an instance of `MergeConfig` with the given `options`.
 *
 * ```js
 * const MergeConfigs = require('merge-configs');
 * const mergeConfigs = new MergeConfigs();
 * ```
 * @param {Object} `options`
 * @return {Object} Instance of `MergeConfig`
 * @api public
 */

class MergeConfig {
  constructor(defaults) {
    this.defaults = Object.assign({}, defaults);
    this.defaults.patterns = arrayify(this.defaults.patterns);

    this.options = this.defaults.options || {};
    this.loaders = {};
    this.types = {};

    if (this.options.builtins !== false) {
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
    this.loader('js', file => require(file.path));
  }

  /**
   * Create a new config type with the given settings
   * @param {String} `type`
   * @param {Object} `settings` Must have a `.patterns` property with a string or array of globs.
   * @return {Object}
   */

  setType(type, settings) {
    if (typeof type !== 'string') {
      throw new TypeError('expected type to be a string');
    }

    settings = Object.assign({}, settings);
    settings.patterns = arrayify(settings.patterns);
    settings = merge({files: [], data: {}}, this.defaults, settings);

    if (settings.patterns.length === 0) {
      throw new TypeError('expected glob patterns to be a string or array');
    }

    this.types[type] = settings;
    return this;
  }

  /**
   * Get config `type`.
   * @param {String} `type`
   * @return {Object}
   */

  getType(type) {
    if (typeof type !== 'string') {
      throw new TypeError('expected type to be a string');
    }
    if (!this.types.hasOwnProperty(type)) {
      throw new Error(`config type "${type}" does not exist`);
    }
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
    const config = this.type(type);
    const files = glob.sync(config.patterns, config.options);
    const cwd = config.options.cwd;
    const res = [];

    for (let filename of files) {
      const filepath = path.resolve(cwd, filename);
      const file = new File({path: filepath, cwd: cwd});
      if (typeof config.filter === 'function') {
        if (config.filter(file) === false) {
          continue;
        }
      }
      res.push(file);
    }
    return res;
  }

  /**
   * Register a loader for a type of file, by `extname`. Loaders are functions
   * that receive a [vinyl][] `file` object as the only argument and should
   * return the config object to use.
   *
   * ```js
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

  loader(extname, fn) {
    if (typeof extname !== 'string') {
      throw new TypeError('expected extname to be a string');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('expected loader to be a function');
    }
    if (extname[0] !== '.') {
      extname = '.' + extname;
    }
    this.loaders[extname] = fn;
    return this;
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
    for (const type of arrayify(types)) {
      configs[type] = this.loadType(type);
    }
    return configs;
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
      config.data = merge({}, config.data, this.loadFile(file, config));
    }
    return config;
  }

  /**
   * Load config `file`
   * @param {Object} `file`
   * @param {Object} `config`
   * @return {Object} Returns the loaded config data.
   */

  loadFile(file, config) {
    const loader = this.loaders[file.extname];
    if (!loader) {
      throw new Error('no loaders exist for: ' + file.extname);
    }

    file.contents = fs.readFileSync(file.path);
    file.data = loader.call(this, file);

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
    if (typeof fn !== 'function') fn = configType => configType.data;
    if (!types) types = Object.keys(this.types);

    let config = {};
    for (const type of arrayify(types)) {
      config = merge({}, config, fn(this.getType(type), config));
    }
    return config;
  }
}

/**
 * Expose `MergeConfig`
 */

module.exports = MergeConfig;
