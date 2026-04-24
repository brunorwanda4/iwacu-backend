import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidNationalId', async: false })
export class IsValidNationalIdConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    // Rwanda National ID format: 1 followed by 19 digits
    const nationalIdRegex = /^1\d{19}$/;
    return nationalIdRegex.test(value);
  }

  defaultMessage(): string {
    return 'National ID must be 1 followed by 19 digits (format: 1XXXXXXXXXXXXXXXXXX)';
  }
}

export function IsValidNationalId(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidNationalIdConstraint,
    });
  };
}
