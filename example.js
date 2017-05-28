'use strict';

var merge = require('./');
var config = merge('foo', ['global', 'home', 'local', 'cwd', 'pkg']);
console.log(config);
