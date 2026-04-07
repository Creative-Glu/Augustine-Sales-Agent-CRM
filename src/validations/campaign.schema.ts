import * as Yup from 'yup';

export const campaignValidationSchema = Yup.object().shape({
  campaign_name: Yup.string()
    .required('Campaign name is required')
    .min(3, 'Campaign name must be at least 3 characters'),

  offer_id: Yup.string().required('Please select an Offer'),

  instructions: Yup.string()
    .required('Instructions are required')
    .min(10, 'Instructions must be at least 10 characters'),

  campaign_status: Yup.string()
    .oneOf(['Running', 'Draft'], 'Invalid campaign status')
    .required('Campaign status is required'),
});
