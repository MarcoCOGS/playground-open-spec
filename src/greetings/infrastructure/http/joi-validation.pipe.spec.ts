import { BadRequestException } from '@nestjs/common';
import { createGreetingSchema } from './create-greeting.schema.js';
import { JoiValidationPipe } from './joi-validation.pipe.js';

const metadata = {
  data: undefined,
  metatype: Object,
  type: 'body' as const,
};

describe('JoiValidationPipe', () => {
  const pipe = new JoiValidationPipe(createGreetingSchema);

  it('returns a valid request body without converting it', () => {
    expect(pipe.transform({ name: 'José María' }, metadata)).toEqual({
      name: 'José María',
    });
  });

  it.each([
    { name: 'Mara' },
    { name: 'abcdefghijklmnopqrstu' },
    { name: 'Marco1' },
    { name: 'Marco#' },
    {},
    { name: 12345 },
  ])('maps invalid input to a BadRequestException: %o', (value) => {
    try {
      pipe.transform(value, metadata);
      fail('Expected validation to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);

      const response = (error as BadRequestException).getResponse() as {
        message: string[];
        statusCode: number;
      };

      expect(response.statusCode).toBe(400);
      expect(response.message.join(' ')).toContain('name');
    }
  });
});
