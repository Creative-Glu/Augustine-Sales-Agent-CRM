import * as Yup from 'yup';

export const productValidationSchema = Yup.object({
  product_name: Yup.string().required('Product name is required'),
  product_description: Yup.string().required('Required'),
  pricing_type: Yup.string().required('Required'),
  price: Yup.number().nullable(),
});
