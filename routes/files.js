const express = require('express');
const router = express.Router();
const exec = require('child_process').exec;
const fs = require('fs');
const multer  = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
const { auth, authForAPI } = require('./../lib/auth');
const { PreconditionError, FileTypeError } = require('./../lib/error');
const {
  decompressTargz,
  decompressZip,
  deleteFile,
  makeUserPath,
  getFiles,
  readFile,
  writeFile,
  execFile,
  testFile,
  isTargz,
  isZip
} = require('./../lib/file');

/**
 * 파일 읽기 (api)
 */
router.get('/', authForAPI, async (req, res, next) => {
  try {
    const { path } = req.query;
    if (path === undefined) throw new PreconditionError('path required');

    const content = await readFile(`./uploads/${req.session.path}${req.query.path}`);
    res.status(200).send(content);
  } catch (err) {
    res.status(err.code || 500).send(err.message);
  }
});

/**
 * 파일 목록 읽기 (api)
 */
router.get('/list',/*authForAPI, */async (req, res, next) => {
  try {
    const userFolder = req.session.path;
    const result = await getFiles(userFolder);
    res.status(200).json(result);
  } catch(err) {
    res.status(err.code || 500).send(err.message);
  }
});

/**
 * 압축파일 업로드 (api)
 */
router.post('/', authForAPI, upload.single('file'), async (req, res, next) => {
  try {
    const userFolder = req.session.path;
    const { filename } = req.file;
    // 필드가 비어있으면 에러처리
    if (filename === undefined) throw new PreconditionError('File field must be filled');
    // 파일 형식이 맞지 않으면, 삭제하고나서 에러처리
    if (!isTargz(filename) && !isZip(filename)) {
      await deleteFile(req.file.path);
      throw new FileTypeError('Unsupported File. File type must be .tar.gz or .zip');
    }

    // 받은 파일에 대해서 압축풀고, 압축 해제한 파일 경로 이동
    if (isTargz(filename)) await decompressTargz({ filename, userFolder });
    if (isZip(filename)) await decompressZip({ filename, userFolder });
    // 원래 압축 파일은 삭제
    await deleteFile(req.file.path);
    res.sendStatus(200);
  } catch(err) {
    console.log(err);
    res.status(err.code || 500).send(err.message);
  }
});

/**
 * 파일 저장 (api)
 */
router.put('/', authForAPI, async (req, res, next) => {
  try {
    const { path, data } = req.body;
    const userFolder = req.session.path;
    if (data === undefined) throw new PreconditionError('Data, Path field required');
    await writeFile(`./uploads/${userFolder}${path}`, data);
    res.sendStatus(200);
  } catch (err) {
    res.status(err.code || 500).send(err.message);
  }
});

/**
 * 파일 실행 (api)
 */
router.get('/exec', authForAPI, async (req, res, next) => {
  try {
    const userFolder = req.session.path;
    const path = makeUserPath(userFolder, req.query.path);
    const result = await execFile(path);
    res.status(200).send(result);
  } catch (err) {
    res.status(err.code || 500).send(err.message);
  }
});

/**
 * 테스트케이스 실행 (api)
 */
router.get('/test', /*authForAPI, */async (req, res, next) => {
  try {
    const { input, output } = req.query;
    const userFolder = req.session.path;
    // TODO: validateion

    const path = makeUserPath(userFolder, req.query.path);
    const testFilePath = `./uploads/${userFolder}/test.txt`;
    // 테스트 인풋 파일 만들기
    await writeFile(testFilePath, input);
    // 테스트 실행
    const result = (await testFile(path, testFilePath)).trim();
    // 테스트 인풋 파일 삭제
    await deleteFile(testFilePath);

    // 테스트 결과 만들기
    let test = '';
    if (result === output) {
      text = 'test#1 passed'
    } else {
      text = `test#1 failed. expect ${output} but ${result}`
    }

    res.status(200).send(text);
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;
