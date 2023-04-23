import { object, string, type TypeOf, any } from 'zod';

const payload = {
  body: object({
    productName: string({
      required_error: 'Product name is required'
    }),
    productCategory: string({
      required_error: 'Product category is required'
    }),
    keyFeatures: string({
      required_error: 'Key features of the invention is required'
    }),
    keyBenefit: string({
      required_error: 'Key benefits of the inventionis required'
    }),
    description: string({
      required_error: 'Description is required'
    }),
    size: string().optional(),
    weight: string().optional(),
    materialsUsed: string().optional(),
    productPicture: any().optional(),
    productVideo: any().optional(),
    productDemo: string().optional()
  })
};

export const createInventionSchema = object({
  ...payload
});

export type CreateInventionInput = TypeOf<typeof createInventionSchema>['body'];
