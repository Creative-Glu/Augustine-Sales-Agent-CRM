import * as Yup from 'yup';

export const productOfferValidationSchema = Yup.object().shape({
  offer_name: Yup.string().required('Offer name is required'),
  icp_id: Yup.string().required('Please select an ICP'),
  offer_1: Yup.string().required('Select at least one product'),
  offer_2: Yup.string().nullable(),
  offer_3: Yup.string().nullable(),
});
