import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'PasswordsNotEqual', async: false })
export class PasswordsNotEqualConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    return object.oldPassword !== object.newPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return `New password must be different from the old password.`;
  }
}

export function PasswordsNotEqual(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'PasswordsNotEqual',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: PasswordsNotEqualConstraint,
    });
  };
}
