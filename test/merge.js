'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const read = require('read-data');
const MergeConfig = require('..');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
let config;

describe('.merge', () => {
  beforeEach(() => {
    config = new MergeConfig();
    config.loader('yml', file => read.yaml.sync(file.path));
    config.loader('yaml', file => read.yaml.sync(file.path));
  });

  it('should throw an error when a config type does not exist', () => {
    assert.throws(() => config.load('foo'), /does not exist/);
  });

  it('should merge the given config type', () => {
    config.type('fixtures', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('cwd')
      }
    });

    const data = config.merge('fixtures');

    assert.deepEqual(data, {
      layout: true,
      list: ['one', 'two', 'three'],
      tags: ['a', 'b', 'c']
    });
  });

  it('should merge multiple config types', () => {
    config.type('cwd', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('cwd')
      }
    });

    config.type('other', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('other')
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

    const data = config.merge(['cwd', 'local', 'other']);

    assert.deepEqual(data, {
      layout: true,
      categories: ['x', 'y', 'z'],
      items: ['four', 'five', 'six'],
      list: ['one', 'two', 'three', 'four', 'five', 'six'],
      tags: ['a', 'b', 'c']
    });
  });

  it('should merge using the config.merge() method returned on the object', () => {
    config.type('cwd', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('cwd')
      }
    });

    config.type('other', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('other')
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

    const configs = config.load(['cwd', 'local', 'other']);
    const data = configs.merge();

    assert.deepEqual(data, {
      layout: true,
      categories: ['x', 'y', 'z'],
      items: ['four', 'five', 'six'],
      list: ['one', 'two', 'three', 'four', 'five', 'six'],
      tags: ['a', 'b', 'c']
    });
  });

  it('should merge all config types', () => {
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

    const data = config.merge();

    assert.deepEqual(data, {
      layout: true,
      categories: ['x', 'y', 'z'],
      items: ['four', 'five', 'six'],
      list: ['one', 'two', 'three'],
      tags: ['a', 'b', 'c']
    });
  });
});
