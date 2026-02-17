import { ValidationError } from "../errors/index.js";

export const validate = (validatorFn, source = "body") => {
  return (req, _res, next) => {
    const data = req[source];
    const { isValid, errors } = validatorFn(data);

    if (!isValid) {
      return next(new ValidationError(errors.join(". ")));
    }

    next();
  };
};
