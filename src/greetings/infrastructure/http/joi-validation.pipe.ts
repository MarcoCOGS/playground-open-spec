import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import type { ObjectSchema } from 'joi';

export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const { error, value: validatedValue } = this.schema.validate(value, {
      abortEarly: false,
      convert: false,
    });

    if (error) {
      throw new BadRequestException({
        error: 'Bad Request',
        message: error.details.map((detail) => detail.message),
        statusCode: 400,
      });
    }

    return validatedValue;
  }
}
