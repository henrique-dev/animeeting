import { z } from 'zod';

const customErrorMap: z.ZodErrorMap = (_issue, ctx) => {
  return { message: `errors.validations.${ctx.defaultError.toLocaleLowerCase().split(' ').join('_')}` };
};

z.setErrorMap(customErrorMap);

const i18n_objectToString = (key: string, obj: {}) => {
  return `${key};${JSON.stringify(obj)}`;
};

export { i18n_objectToString, z as zod };
