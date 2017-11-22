class PreconditionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PreconditionError'
    this.code = 412;
  }
}

class FileTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileTypeError';
    this.code = 400;
  }
}

module.exports = {
  PreconditionError,
  FileTypeError,
};