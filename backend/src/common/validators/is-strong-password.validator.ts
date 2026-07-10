import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions ?? {
        message:
          'Password must be at least 12 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'string' && STRONG_PASSWORD_REGEX.test(value);
        },
      },
    });
  };
}
