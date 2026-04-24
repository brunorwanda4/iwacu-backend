import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidPhoneNumber', async: false })
export class IsValidPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    // Rwanda phone number format: +250 followed by 9 digits
    const phoneRegex = /^\+250\d{9}$/;
    return phoneRegex.test(value);
  }

  defaultMessage(): string {
    return 'Phone number must be in format +250 followed by 9 digits (e.g., +250788123456)';
  }
}

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPhoneNumberConstraint,
    });
  };
}
