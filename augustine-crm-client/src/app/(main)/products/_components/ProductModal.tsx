'use client';

import { useFormik } from 'formik';
import { useCreateProduct, useUpdateProduct, Product } from '@/services/products/useProducts';
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

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  product?: Product | null;
}

export default function ProductModal({ open, onClose, onCreated, product }: ProductModalProps) {
  const { mutateAsync: createNewProductMutation } = useCreateProduct();
  const { mutateAsync: updateProductMutation } = useUpdateProduct();
  const { successToast, errorToast } = useToastHelpers();

  const isEditMode = !!product;

  const formik = useFormik<ProductFormValues>({
    initialValues: {
      product_name: product?.product_name || '',
      product_description: product?.product_description || '',
      pricing_type: product?.pricing_type || 'free',
      price: product?.price || 0,
    },
    validationSchema: productValidationSchema,
    validateOnChange: true,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isEditMode && product) {
          const payload = {
            product_name: values.product_name,
            product_description: values.product_description,
            pricing_type: values.pricing_type,
            price: values?.pricing_type == 'free' ? 0 : values?.price,
          };

          await updateProductMutation({ id: product.product_id, updates: payload });
          successToast('Product updated successfully');
        } else {
          const { data } = await supabase.rpc('generate_new_product_id');

          const payload = {
            ...values,
            product_id: data,
            price: values?.pricing_type == 'free' ? 0 : values?.price,
          };

          await createNewProductMutation(payload);
          successToast('Product created successfully');
        }

        onCreated?.();
        onClose();
      } catch (err) {
        errorToast(isEditMode ? 'Error updating product' : 'Error creating product');
        console.error(isEditMode ? 'Update product error:' : 'Create product error:', err);
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
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Create Product'}</DialogTitle>
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
            submitLabel={isEditMode ? 'Update Product' : 'Create Product'}
            isSubmitting={isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

