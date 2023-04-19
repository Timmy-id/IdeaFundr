import { object, string, type TypeOf } from 'zod';

export const registerSchema = object({
  body: object({
    firstName: string({
      required_error: 'First Name is required'
    }).nonempty({ message: 'First Name is required' }),
    lastName: string({
      required_error: 'Last Name is required'
    }).nonempty({ message: 'Last Name is required' }),
    email: string({
      required_error: 'Email is required'
    }).email('Invalid email format'),
    password: string({
      required_error: 'Password is required'
    }).min(8, 'Password length must be at least 8 characters'),
    passwordConfirm: string({
      required_error: 'Password confirm is required'
    })
  }).refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords are not the same'
  })
});

export const loginSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required'
    }).email('Invalid email or password'),
    password: string({
      required_error: 'Password is required'
    })
  })
});

export type RegisterInput = TypeOf<typeof registerSchema>['body'];
export type LoginInput = TypeOf<typeof loginSchema>['body'];
