import Joi from 'joi';
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_PATTERN,
} from '../../domain/name.js';

const nameComponentSchema = Joi.string()
  .min(NAME_MIN_LENGTH)
  .max(NAME_MAX_LENGTH)
  .pattern(NAME_PATTERN);

export const createFullNameGreetingSchema = Joi.object({
  name: nameComponentSchema.required(),
  lastName: nameComponentSchema.required(),
});
