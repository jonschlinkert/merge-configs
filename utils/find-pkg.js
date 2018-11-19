
const fs = require('fs');
const path = require('path');

function findPackageJson(cwd) {
  let dir = path.resolve(cwd || process.cwd());
  let prev = dir;

  do {
    const pkgFile = path.join(dir, 'package.json');

    if (fs.existsSync(pkgFile) && fs.statSync(pkgFile).isFile()) {
      return pkgFile;
    }

    prev = dir;
  } while (prev !== (dir = path.join(dir, '..')));

  return null;
}

console.log(findPackageJson(path.join(__dirname, 'foo/bar')));
