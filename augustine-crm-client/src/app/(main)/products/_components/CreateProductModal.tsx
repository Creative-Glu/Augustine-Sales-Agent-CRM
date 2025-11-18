'use client';

import { useFormik } from 'formik';
import { useCreateProduct } from '@/services/products/useProducts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomeSelect } from '@/components/CustomeSelect';
import { PRODUCT_PRICING_TYPE } from '@/constants/pricing-types';
import { supabase } from '@/lib/supabaseClient';
import { ProductFormValues } from '@/types/product';
import { productValidationSchema } from '@/validations/product.schema';
import { ErrorText } from '@/components/ErrorText';
import { useToastHelpers } from '@/lib/toast';
import { FormFooterActions } from '@/components/FormFooterActions';

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateProductModal({ open, onClose, onCreated }: CreateProductModalProps) {
  const { mutateAsync: createNewProductMutation } = useCreateProduct();
  const { successToast, errorToast } = useToastHelpers();

  const formik = useFormik<ProductFormValues>({
    initialValues: {
      product_name: '',
      product_description: '',
      pricing_type: 'free',
      price: 0,
    },
    validationSchema: productValidationSchema,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data } = await supabase.rpc('generate_new_product_id');

        const payload = {
          ...values,
          product_id: data,
          price: values?.pricing_type == 'free' ? 0 : values?.price,
        };

        await createNewProductMutation(payload);
        successToast('Product created successfully');

        onCreated?.();
        onClose();
      } catch (err) {
        errorToast('Error creating product');
        console.error('Create product error:', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue, isSubmitting } =
    formik;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="text-sm font-medium">Product Name</label>
            <Input
              name="product_name"
              value={values.product_name}
              onChange={handleChange}
              placeholder="Enter product name"
            />
            <ErrorText touched={touched.product_name} error={errors.product_name} />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="product_description"
              value={values.product_description || ''}
              onChange={handleChange}
              placeholder="Write a description..."
            />
            <ErrorText touched={touched.product_description} error={errors.product_description} />
          </div>

          {/* Pricing Type */}
          <CustomeSelect
            label="Pricing Type"
            value={values.pricing_type}
            onChange={(val: string) => {
              setFieldValue('pricing_type', val);
              if (val === 'free') setFieldValue('price', '');
            }}
            optionsData={PRODUCT_PRICING_TYPE}
            placeholder="Select Product Pricing Type"
          />
          <ErrorText touched={touched.pricing_type} error={errors.pricing_type} />

          {/* Price Field (only if not free) */}
          {values.pricing_type !== 'free' && (
            <div>
              <label className="text-sm font-medium">Price</label>
              <Input
                name="price"
                value={values.price || ''}
                onChange={handleChange}
                placeholder="Enter price"
              />
              <ErrorText touched={touched.price} error={errors.price} />
            </div>
          )}

          <FormFooterActions
            onCancel={onClose}
            submitLabel="Create Product"
            isSubmitting={isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
