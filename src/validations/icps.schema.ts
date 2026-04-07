// icpValidationSchema.ts
import * as Yup from 'yup';

export const icpValidationSchema = Yup.object({
  icp_name: Yup.string()
    .required('ICP name is required')
    .min(2, 'ICP name must be at least 2 characters'),

  icp_desc: Yup.string()
    .required('ICP description is required')
    .min(5, 'Description must be at least 5 characters'),
});
