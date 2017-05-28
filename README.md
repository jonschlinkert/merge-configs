# merge-configs [![NPM version](https://img.shields.io/npm/v/merge-configs.svg?style=flat)](https://www.npmjs.com/package/merge-configs) [![NPM monthly downloads](https://img.shields.io/npm/dm/merge-configs.svg?style=flat)](https://npmjs.org/package/merge-configs) [![NPM total downloads](https://img.shields.io/npm/dt/merge-configs.svg?style=flat)](https://npmjs.org/package/merge-configs) [![Linux Build Status](https://img.shields.io/travis/jonschlinkert/merge-configs.svg?style=flat&label=Travis)](https://travis-ci.org/jonschlinkert/merge-configs)

> Find, load and merge JSON and YAML config settings from one or more files, in the specified order.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save merge-configs
```

## Usage

```js
var merge = require('merge-configs');
merge(name[, locations, options]);
```

### Params

* `name` **{String}** - (required) The module name (example: `eslint`, `babel`, `travis` etc)
* `types` **{Array}** - (optional) The [config locations](#config-locations) or "types" to search. If specified, only the given locations will be searched. If undefined, all locations are searched.
* `options` **{Object}** - see all [available options](#options)

### What does this do?

This library makes it easy for your application to support config files similar to `.eslintrc.json`, `.travis.yml`, etc.

**How does it work?**

We start with an empty config object that looks something like this:

```js
{ 
  // config "locations"
  pkg: {},     // namespaced object in "package.json"
  cwd: {},     // config from files in "process.cwd()"
  local: {},   // config from installed packages in local "node_modules"
  global: {},  // config from installed packages in global "node_modules"
  home: {},    // config from files in user home

  // if a list of locations is passed, the "merged" object is created 
  // by merging the config from each location, left-to-right. 
  merged: {},

  // array of absolute paths to any matching javascript 
  // files. Useful for gulpfile.js, Gruntfile.js, etc.
  js: [] 
}
```

When `merge(name)` is called:

1. [glob patterns](#glob-patterns) are created by combining your application's `name` with a list of directories that corresponds to the pre-defined locations, along with some minimal `*` wildcard magic.
2. glob patterns are used to match files
3. config is loaded onto the property for the respective "location" of matching files

### Limit the search

Pass a list of location names to limit the search _and merge config for those locations_:

**Example**

The following will limit the search to only the `pkg` and `cwd` patterns:

```js
console.log(merge('foo', ['pkg', 'cwd']));
```

## Options

### options.locations

**Type**: `array`

**Default**: `undefined`

Specify the locations to load onto the returned object.

```js
var config = merge('foo', {locations: ['cwd', 'home']});
// locations can also be passed directly to the main export
var config = merge('foo', ['cwd', 'home']);
```

### options.merge

**Type**: `boolean`

**Default**: `undefined`

merge onto the `config.merged` object. No config objects will be merged onto `config.merged` unless specified.
If one or more [locations](#optionstypes) are specified locations are merged onto the returned `config.merged` object.

```js
var config = merge('foo', {merge: false});
```

### options.filter

**Type**: `function`

**Default**: `undefined`

Filter files before they're added or merged onto the config.

```js
var config = merge('foo', {
  filter: function(file) {
    return !/whatever/.test(file.path);
  }
});
```

### options.files

**Type**: `Array<string>`

**Default**: `['.name*.{json,yaml,yml}', 'name*.js']` _(Note the leading `.` on the first string)_

Specify the glob pattern to use for matching basenames.

```js
var config = merge('amazing', {
  files: ['amazing.json']
});
```

## Glob patterns

In case it helps to visualize what this does, assuming no options are defined, the default list of glob patterns created by `merge-configs` looks something like this:

```js
[
  {
    type: 'pkg',
    cwd: process.cwd(),
    patterns: ['package.json']
  },
  {
    type: 'cwd',
    cwd: process.cwd(),
    patterns: ['.foo*.{json,yaml,yml}', 'foo*.js']
  },
  {
    type: 'local',
    cwd: process.cwd() + '/node_modules',
    patterns: ['foo-config-*/.foo*.{json,yaml,yml}', 'foo-config-*/foo*.js']
  },
  {
    type: 'global',
    cwd: '/usr/local/lib/node_modules', // depends on platform and custom settings
    patterns: ['foo-config-*/.foo*.{json,yaml,yml}', 'foo-config-*/foo*.js']
  },
  {
    type: 'home',
    cwd: '/Users/jonschlinkert', // depends on platform and custom settings
    patterns: ['.foo/.foo*.{json,yaml,yml}', '.foo/foo*.js']
  }
]
```

merge-configs then loops over each "location" and loads any config files/settings found in that location.

## About

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on May 28, 2017._