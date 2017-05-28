'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var merge = require('..');

var fixtures = path.join.bind(path, __dirname, 'fixtures');

describe('merge-configs', function() {
  it('should export a function', function() {
    assert.equal(typeof merge, 'function');
  });

  it('should return empty objects when no configs are resolved', function() {
    assert.deepEqual(merge('foo'), {
      pkg: {},
      cwd: {},
      local: {},
      global: {},
      home: {},
      js: []
    });
  });

  it('should get matching javascript files from the cwd', function() {
    assert.deepEqual(merge('fixture', {cwd: fixtures('js')}), {
      pkg: {},
      cwd: {},
      local: {},
      global: {},
      home: {},
      js: [fixtures('js/fixture.js')]
    });
  });

  it('should support options.home', function() {
    assert.deepEqual(merge('fixture', {home: fixtures()}), {
      pkg: {},
      cwd: {},
      local: {},
      global: {},
      home: { home: true, foo: [ 'bar', 'baz', 'qux' ] },
      js: []
    });
  });

  it('should get config from package.json', function() {
    assert.deepEqual(merge('fixture', {cwd: fixtures('package')}), {
      pkg: {'package-config': true},
      cwd: {},
      local: {},
      global: {},
      home: {},
      js: []
    });

    assert.deepEqual(merge('fixture', {cwd: fixtures('package')}, ['pkg']), {
      pkg: {'package-config': true},
      merged: {'package-config': true},
      js: []
    });

    assert.deepEqual(merge('fixture', {cwd: fixtures('package')}, ['package']), {
      pkg: {'package-config': true},
      merged: {'package-config': true},
      js: []
    });
  });

  it('should support options.cwd', function() {
    assert.deepEqual(merge('fixture', {cwd: fixtures('cwd')}), {
      pkg: {},
      cwd: { cwd: true, foo: [ 'one', 'two', 'three' ] },
      local: {},
      global: {},
      home: {},
      js: [fixtures('cwd/fixturefile.js')]
    });
  });

  it('should filter out files', function() {
    assert.deepEqual(merge('fixture', {
      cwd: fixtures('cwd'),
      filter: function(file) {
        return !/fixturefile/.test(file.path);
      }
    }), {
      pkg: {},
      cwd: { cwd: true, foo: [ 'one', 'two', 'three' ] },
      local: {},
      global: {},
      home: {},
      js: []
    });
  });

  it('should get "local" config from node_modules', function() {
    assert.deepEqual(merge('fixture', {cwd: fixtures('local')}), {
      pkg: {},
      cwd: {},
      local: {
        local: true,
        zzz: true,
        foo: [ 'one', 'two', 'three' ],
        yyy: [ 'aaa', 'bbb', 'ccc' ]
      },
      global: {},
      home: {},
      js: [fixtures('local/node_modules/fixture-config-a/fixturefile.js')]
    });
  });

  it('should get config from global npm node_modules', function() {
    assert.deepEqual(merge('fixture', {global: fixtures('global')}), {
      pkg: {},
      cwd: {},
      local: {},
      global: {
      'global': true,
       zzz: true,
       ggg: [ 'aaa', 'bbb', 'ccc' ],
       yyy: [ 'aaa', 'bbb', 'ccc' ]
      },
      home: {},
      js: [fixtures('global/fixture-config-b/fixture.config.js')]
    });
  });

  it('should merge the specified configs', function() {
    var config = merge('fixture', {cwd: fixtures('multiple/1')}, ['cwd', 'pkg', 'home']);
    assert.deepEqual(config, {
      pkg: {
        'package-config': true
      },
      cwd: {
        cwd: true,
        foo: ['one', 'two', 'three']
      },
      home: {},
      merged: {
        cwd: true,
        foo: ['one', 'two', 'three'],
        'package-config': true
      },
      js: ['/Users/jonschlinkert/dev/data-utils/merge-configs/test/fixtures/multiple/1/fixturefile.js']
    });
  });

  it('should merge ONLY the specified configs', function() {
    var one = merge('fixture', {cwd: fixtures('multiple/2')}, ['pkg']);
    assert.deepEqual(one, {
      pkg: {foo: 'last'},
      merged: {foo: 'last'},
      js: []
    });

    var two = merge('fixture', {cwd: fixtures('multiple/2')}, ['cwd']);
    assert.deepEqual(two, {
      cwd: {foo: 'first'},
      merged: {foo: 'first'},
      js: []
    });
  });

  it('should merge the specified configs in the order defined', function() {
    var one = merge('fixture', {cwd: fixtures('multiple/2')}, ['cwd', 'pkg']);
    assert.deepEqual(one, {
      pkg: {foo: 'last'},
      cwd: {foo: 'first'},
      merged: {foo: 'last'},
      js: []
    });

    var two = merge('fixture', {cwd: fixtures('multiple/2')}, ['pkg', 'cwd']);
    assert.deepEqual(two, {
      pkg: {foo: 'last'},
      cwd: {foo: 'first'},
      merged: {foo: 'first'},
      js: []
    });
  });

  it('should not merge the specified configs when disabled', function() {
    var three = merge('fixture', {cwd: fixtures('multiple/2'), merge: false}, ['pkg', 'cwd']);
    assert.deepEqual(three, {
      pkg: {foo: 'last'},
      cwd: {foo: 'first'},
      js: []
    });
  });

  it('should throw an error when invalid args are passed', function() {
    assert.throws(function() {
      merge();
    });
  });
});
