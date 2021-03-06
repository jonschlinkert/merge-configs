'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const MergeConfig = require('..');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
let config;

describe('.type', () => {
  beforeEach(() => {
    config = new MergeConfig({options: {cwd: fixtures()}});
  });

  it('should add a config type to config.types (.setType)', () => {
    config.setType('cwd', { patterns: ['.foorc.json'] });

    assert.deepEqual(config.types.cwd, {
      type: 'cwd',
      patterns: ['.foorc.json'],
      options: {
        cwd: fixtures()
      },
      files: [],
      data: {}
    });
  });

  it('should add a config type to config.types (.type)', () => {
    config.type('cwd', { patterns: ['.foorc.json'] });

    assert.deepEqual(config.types.cwd, {
      type: 'cwd',
      patterns: ['.foorc.json'],
      options: {
        cwd: fixtures()
      },
      files: [],
      data: {}
    });
  });

  it('should merge constructor options with type options', () => {
    config = new MergeConfig({
      options: {
        foo: 'bar',
        cwd: fixtures()
      },
      files: [],
      data: {}
    });

    config.type('cwd', {
      patterns: ['.foorc.json'],
      options: {
        baz: 'qux'
      },
      files: [],
      data: {}
    });

    assert.deepEqual(config.types.cwd, {
      type: 'cwd',
      patterns: ['.foorc.json'],
      options: {
        foo: 'bar',
        baz: 'qux',
        cwd: fixtures()
      },
      files: [],
      data: {}
    });
  });
});
