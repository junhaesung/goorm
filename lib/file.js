const fs = require('fs');
const exec = require('child_process').exec;
const _ = require('lodash');
const { FileTypeError } = require('./error');

// .tar.gz파일 user 경로에 압축 풀기
const decompressTargz = ({ filename, userFolder }) => {
  const commands = `mkdir -p ./uploads/${userFolder} && tar -zxvf ./uploads/${filename} -C ./uploads/${userFolder}/`;
  return new Promise((resolve, reject) => {
    exec(commands, (error, stdout, stderr) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

// .zip 파일 user 경로에 압축 풀기
const decompressZip = ({ filename, userFolder }) => {
  const commands = `mkdir -p ./uploads/${userFolder} && unzip ./uploads/${filename} -d ./uploads/${userFolder}/`;
  return new Promise((resolve, reject) => {
    exec(commands, (error, stdout, stderr) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

// 업로드한 압축파일 지우기
// './' 안넣어도 괜찮은듯
const deleteFile = (filepath) => {
  console.log(`deleteFile(${filepath})`)
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, (error) => {
      if (error) {
        console.log('delete failed');
        error.message = 'deleteFile'
        reject(error);
      }
      console.log(`successfully deleted ${filepath}`);
      resolve();
    });
  });
}

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

const writeFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', (err) => {
      if (err) {
        console.log(err);
        console.log('write file Error');
        err.code = 500;
        return reject(err);
      }
      console.log('File has been saved!');
      return resolve();
    });
  });
}

const execFile = async (path) => {
  const patternC = /.*\.c$/;
  const patternPython = /.*\.py$/;
  const lowerPath = path.toLowerCase();

  if (patternC.test(lowerPath)) return await execC(path);
  if (patternPython.test(lowerPath)) return await execPython(path);
  throw new FileTypeError('There is no supported file type');
}

const execC = (path) => {
  return new Promise((resolve, reject) => {
    exec(`gcc ${path} && ./a.out && rm ./a.out`, (err, stdout, stderr) => {
      if (err) return reject(err);
      const result = [stdout, stderr]
        .filter(x => !!x)
        .join('\n');
      return resolve(result);
    });
  });
}

const execPython = (path) => {
  return new Promise((resolve, reject) => {
    exec(`python ${path}`, (err, stdout, stderr) => {
      if (err) return reject(err);
      const result = [stdout, stderr]
        .filter(x => !!x)
        .join('\n');
      return resolve(result);
    });
  });
}

const testFile = async (path, testFilePath) => {
  const patternC = /.*\.c$/;
  const patternPython = /.*\.py$/;
  const lowerPath = path.toLowerCase();

  if (patternC.test(lowerPath)) return await testC(path, testFilePath);
  if (patternPython.test(lowerPath)) return await testPython(path, testFilePath);
  throw new FileTypeError('There is no supported file type');
}

const testC = (path, testFilePath) => {
  return new Promise((resolve, reject) => {
    exec(`gcc ${path} && ./a.out < ${testFilePath} && rm ./a.out`, (err, stdout, stderr) => {
      if (err) return reject(err);
      const result = [stdout, stderr]
        .filter(x => !!x)
        .join('\n');
      return resolve(result);
    });
  });
}

const testPython = (path, testFilePath) => {
  console.log('testPython', path, testFilePath);
  return new Promise((resolve, reject) => {
    exec(`python ${path} < ${testFilePath}`, (err, stdout, stderr) => {
      if (err) return reject(err);
      const result = [stdout, stderr]
        .filter(x => !!x)
        .join('\n');
      console.log(result);
      return resolve(result);
    });
  });
}

const makeUserPath = (username, filepath) => {
  return `./uploads/${username}${filepath}`;
}

const getFiles = async (userPath) => {
  const files = await listFiles(`./uploads/${userPath}`);
  return _.chain(files)
    .map(file => file.replace(`./uploads/${userPath}`, ''))
    .filter(file => !file.includes('.DS_Store'))
    .value();
};

const listFiles = (path) => {
  return new Promise(async (resolve, reject) => {
    const results = [];
    const files = await readDirectory(path);
    for (let file of files) {
      const fullPath = `${path}/${file}`;
      if (await isDirectory(fullPath)) {
        Array.prototype.push.apply(results, (await listFiles(fullPath)));
      } else {
        results.push(fullPath);
      }
    }
    return resolve(results);
  });
}

const makeDirectory = (path) => {
  if (fs.existsSync(path)) {
    console.log('Directory already exists');
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    fs.mkdir(path, err => {
      if (err) return reject(err);
      console.log('Created successfully');
      return resolve();
    });
  });
}

const readDirectory = (path) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, items) => {
      if (err) return reject(err);
      return resolve(items);
    });
  });
}

const isDirectory = (file) => {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) return reject(err);
      return resolve(stats.isDirectory());
    });
  });
}

const isFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) return reject(err);
      return resolve(stats.isFile());
    });
  });
}

const isTargz = (filename) => {
  const pattern = /.*\.tar\.gz$/;
  return pattern.test(filename.toLowerCase());
}

const isZip = (filename) => {
  const pattern = /.*\.zip$/;
  return pattern.test(filename.toLowerCase());
}


module.exports = {
  decompressTargz,
  decompressZip,
  deleteFile,
  readFile,
  writeFile,
  execFile,
  testFile,
  makeUserPath,
  readDirectory,
  makeDirectory,
  getFiles,
  execC,
  execPython,
  testC,
  testPython,
  isTargz,
  isZip,
};