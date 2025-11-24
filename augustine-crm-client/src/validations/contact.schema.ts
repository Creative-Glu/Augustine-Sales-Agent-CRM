import * as Yup from 'yup';

export const contactValidationSchema = Yup.object({
  'Parish Name': Yup.string().nullable(),
  'Formed Status': Yup.string().nullable(),
  'Parish Contact Email': Yup.string().email('Invalid email address').nullable(),
  'Parish Phone': Yup.string().nullable(),
  'Institution Type': Yup.string().nullable(),
  'Diocese/Archdiocese Name': Yup.string().nullable(),
  'Ecclesiastical Province': Yup.string().nullable(),
  'Deanery/Vicariate': Yup.string().nullable(),
  'Rite/Church Sui Juris': Yup.string().nullable(),
  'Religious Order Affiliation': Yup.string().nullable(),
  'Parish Size/School Enrollmen': Yup.string().nullable(),
  'Budget Cycle Month': Yup.string().nullable(),
  'Liturgical Language(s)': Yup.string().nullable(),
  'Technology Readiness': Yup.string().nullable(),
  Classification: Yup.string().nullable(),
  icps: Yup.mixed().nullable(),
  'Email Thread': Yup.string().nullable(),
});

