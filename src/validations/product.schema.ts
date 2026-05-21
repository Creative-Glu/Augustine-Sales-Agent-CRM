import * as Yup from 'yup';

export const productValidationSchema = Yup.object({
  product_name: Yup.string()
    .trim()
    .required('Please enter the product name')
    .min(3, 'Product name must be at least 3 characters'),

  product_description: Yup.string()
    .trim()
    .required('Please enter the product description')
    .min(10, 'Description must be at least 10 characters'),

  pricing_type: Yup.string().required('Please select a pricing type'),

  price: Yup.number()
    .nullable()
    .typeError('Price must be a valid number')
    .when('pricing_type', {
      is: (value: string) => value !== 'free',
      then: (schema) =>
        schema.required('Please enter the product price').min(1, 'Price must be greater than 0'),
      otherwise: (schema) => schema.nullable(),
    }),
});
