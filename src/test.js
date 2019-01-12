require("babel-polyfill");
const fs = require("fs");
const path = require("path");
const util = require('util');

(async function () {
  scanFolder('./', (filename, stat) => {
    console.log(filename);
    console.log(stat);
  })
})().then(() => {
  console.log('Completed');
});

/*
// Create a async version of the fs.readdir.
// See a generic asyncify below.
function readdirAsync(path) {
  return new Promise(function (resolve, reject) {
    fs.readdir(path, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

*/
/*
* Returns an async function which can be awaited.
*/
function asyncify(fn) {
  return (...args) => {
    return new Promise(function (resolve, reject) {
      const argsWithCallback = [...args, function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }];
      fn.apply(this,argsWithCallback);
    });
  }
}

async function scanFolder(folder, cb) {
  const statAsync = asyncify(fs.stat);
  const readdirAsync = util.promisify(fs.readdir);
  const filenames = await readdirAsync(folder);
  await Promise.all(filenames.map(async _filename => {
    const filename = path.join(folder, _filename);
    const stat = await statAsync(filename);
    if (stat && stat.isDirectory()) {
      await scanFolder(filename, cb);
    } else {
      cb(filename, stat);
    }
  }));
}

