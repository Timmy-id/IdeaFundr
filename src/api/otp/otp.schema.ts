import { object, string, type TypeOf } from 'zod';

export const verifySchema = object({
  body: object({
    userId: string({
      required_error: 'User ID is required'
    }),
    otp: string({
      required_error: 'OTP is required'
    }).length(4, 'OTP should be four characters')
  })
});

export const resendOTPSchema = object({
  body: object({
    userId: string({
      required_error: 'User ID is required'
    }),
    email: string({
      required_error: 'Email is required'
    }).email('Invalid email format')
  })
});

export type OtpInput = TypeOf<typeof verifySchema>['body'];
export type ResendOTPInput = TypeOf<typeof resendOTPSchema>['body'];
