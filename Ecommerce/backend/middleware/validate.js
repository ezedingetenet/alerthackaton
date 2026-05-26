const { HttpError } = require('./error');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new HttpError(400, 'Validation failed', result.error.flatten()));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
