'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const MergeConfig = require('..');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
let config;

describe('.loader', function() {
  beforeEach(function() {
    config = new MergeConfig();
  });

  it('should throw an error when type is not a string', function() {
    assert.throws(function() {
      config.loader();
    }, /expected/);
  });

  it('should throw an error when loader is not a function', function() {
    assert.throws(function() {
      config.loader('foo');
    }, /expected/);
  });

  it('should register a custom loader type', function() {
    config.loader('foo', file => JSON.parse(file.contents));
    assert.equal(typeof config.loaders['.foo'], 'function');
  });

  it('should use a custom loader type', function() {
    config.loader('foo', file => JSON.parse(file.contents));
    config.type('custom', {
      patterns: ['*.foo'],
      options: {
        cwd: fixtures('loaders')
      }
    });

    const res = config.load('custom');

    assert(res.custom);
    assert.equal(res.custom.files.length, 1);
    assert.equal(res.custom.files[0].basename, 'custom.foo');
    assert.deepEqual(res.custom.data, {
      worked: true
    });
  });
});
