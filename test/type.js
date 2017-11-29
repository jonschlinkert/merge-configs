'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const MergeConfig = require('..');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
let config;

describe('.type', function() {
  beforeEach(function() {
    config = new MergeConfig({options: {cwd: fixtures()}});
  });

  it('should add a config type to config.types (.setType)', function() {
    config.setType('cwd', { patterns: ['.foorc.json'] });

    assert.deepEqual(config.types.cwd, {
      files: [],
      data: {}
    });
  });

  it('should add a config type to config.types (.type)', function() {
    config.type('cwd', { patterns: ['.foorc.json'] });

    assert.deepEqual(config.types.cwd, {
      files: [],
      data: {}
    });
  });

  it('should add settings for a config type to config.settings', function() {
    config.type('cwd', { patterns: ['.foorc.json'] });

    assert.deepEqual(config.settings.cwd, {
      patterns: ['.foorc.json'],
      options: {
        cwd: fixtures()
      }
    });
  });

  it('should merge constructor options with type options', function() {
    config = new MergeConfig({
      options: {
        foo: 'bar',
        cwd: fixtures()
      }
    });

    config.type('cwd', {
      patterns: ['.foorc.json'],
      options: {
        baz: 'qux'
      }
    });

    assert.deepEqual(config.settings.cwd, {
      patterns: ['.foorc.json'],
      options: {
        foo: 'bar',
        baz: 'qux',
        cwd: fixtures()
      }
    });
  });
});
