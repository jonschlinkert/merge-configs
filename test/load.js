'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const MergeConfig = require('..');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
let config;

describe('.load', function() {
  beforeEach(function() {
    config = new MergeConfig();
  });

  it('should throw an error when a config type does not exist', function() {
    assert.throws(function() {
      config.load('foo');
    }, /does not exist/);
  });

  it('should load the given config type', function() {
    config.type('fixtures', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('cwd')
      }
    });

    const configs = config.load('fixtures');

    assert.deepEqual(configs.fixtures.data, {
      layout: true,
      list: ['one', 'two', 'three'],
      tags: ['a', 'b', 'c']
    });
  });

  it('should load multiple config types', function() {
    config.type('cwd', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('cwd')
      }
    });

    config.type('local', {
      patterns: [
        'fixture-config-*/.fixture.{json,yml}',
        'fixture-config-*/fixturefile.js'
      ],
      options: {
        cwd: fixtures('local/node_modules')
      }
    });

    const configs = config.load(['cwd', 'local']);

    assert.deepEqual(configs.cwd.data, {
      layout: true,
      list: ['one', 'two', 'three'],
      tags: ['a', 'b', 'c']
    });

    assert.deepEqual(configs.local.data, {
      layout: true,
      categories: ['x', 'y', 'z'],
      items: ['four', 'five', 'six'],
      list: ['one', 'two', 'three'],
      tags: ['a', 'b', 'c']
    });
  });

  it('should load all config types', function() {
    config.type('cwd', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('cwd')
      }
    });

    config.type('local', {
      patterns: [
        'fixture-config-*/.fixture.{json,yml}',
        'fixture-config-*/fixturefile.js'
      ],
      options: {
        cwd: fixtures('local/node_modules')
      }
    });

    const configs = config.load();

    assert.deepEqual(configs.cwd.data, {
      layout: true,
      list: ['one', 'two', 'three'],
      tags: ['a', 'b', 'c']
    });

    assert.deepEqual(configs.local.data, {
      layout: true,
      categories: ['x', 'y', 'z'],
      items: ['four', 'five', 'six'],
      list: ['one', 'two', 'three'],
      tags: ['a', 'b', 'c']
    });
  });

  it('should call a load function on each file in a config type', function() {
    let count = 0;

    config.type('fixtures', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      load: (file, configs) => {
        file.data[count] = count++;
        return file.data;
      },
      options: {
        cwd: fixtures('cwd')
      }
    });

    const configs = config.load('fixtures');

    assert.deepEqual(configs.fixtures.data, {
      '0': 0,
      '1': 1,
      '2': 2,
      layout: true,
      list: ['one', 'two', 'three'],
      tags: ['a', 'b', 'c']
    });
  });
});
