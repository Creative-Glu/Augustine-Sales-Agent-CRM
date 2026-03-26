import * as Yup from 'yup';

const noSpaces = (msg: string) =>
  Yup.string().test('no-spaces', msg, (val) => !val || !/\s/.test(val));

export const createUserSchema = Yup.object({
  email: noSpaces('Email cannot contain spaces')
    .email('Enter a valid email address')
    .required('Email is required'),
  fullName: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  password: noSpaces('Password cannot contain spaces')
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string()
    .oneOf(['Admin', 'Reviewer', 'Viewer'], 'Select a valid role')
    .required('Role is required'),
});

export const updateUserSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  password: Yup.string()
    .test('no-spaces', 'Password cannot contain spaces', (val) => !val || !/\s/.test(val))
    .test('min-if-set', 'Password must be at least 6 characters', (val) => {
      if (!val || val === '') return true;
      return val.length >= 6;
    }),
  role: Yup.string()
    .oneOf(['Admin', 'Reviewer', 'Viewer'], 'Select a valid role')
    .required('Role is required'),
  isActive: Yup.boolean(),
});
