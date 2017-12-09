'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const MergeConfig = require('..');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
let config;

describe('.resolve', function() {
  beforeEach(function() {
    config = new MergeConfig();
  });

  it('should throw an error when type is not a string', function() {
    assert.throws(function() {
      config.resolve();
    }, /expected type to be a string/);
  });

  it('should throw an error when a config type does not exist', function() {
    assert.throws(function() {
      config.resolve('foo');
    }, /does not exist/);
  });

  it('should resolve files for the given type', function() {
    config.type('fixtures', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('cwd')
      }
    });

    const files = config.resolve('fixtures');
    assert.equal(files.length, 3);
    assert.equal(files[0].basename, '.fixture.json');
    assert.equal(files[1].basename, '.fixture.yml');
    assert.equal(files[2].basename, 'fixturefile.js');
  });

  it('should filter files when a filter function is passed on config', function() {
    config.type('fixtures', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      filter: file => file.basename !== 'fixturefile.js',
      options: {
        cwd: fixtures('cwd')
      }
    });

    const files = config.resolve('fixtures');
    assert.equal(files.length, 2);
    assert.equal(files[0].basename, '.fixture.json');
    assert.equal(files[1].basename, '.fixture.yml');
    assert.equal(typeof files[2], 'undefined');
  });

  it('should filter files when defined on the ctor', function() {
    config = new MergeConfig({
      filter: file => file.basename !== 'fixturefile.js'
    });

    config.type('fixtures', {
      patterns: ['.fixture.{json,yml}', 'fixturefile.js'],
      options: {
        cwd: fixtures('cwd')
      }
    });

    const files = config.resolve('fixtures');
    assert.equal(files.length, 2);
    assert.equal(files[0].basename, '.fixture.json');
    assert.equal(files[1].basename, '.fixture.yml');
    assert.equal(typeof files[2], 'undefined');
  });
});
