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
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const productName = values.product_name?.trim() || 'product';
      try {
        if (isEditMode && product) {
          // NOTE: created_at intentionally omitted on update so we don't
          // overwrite the original creation timestamp every time someone
          // edits the product.
          const payload = {
            product_name: values.product_name,
            product_description: values.product_description,
            pricing_type: values.pricing_type,
            price: values?.pricing_type === 'free' ? 0 : values?.price,
          };

          await updateProductMutation({ id: product.product_id, updates: payload });
          successToast(`"${productName}" updated — changes saved.`);
        } else {
          const { data: newId, error: idError } = await supabase.rpc(
            'generate_new_product_id'
          );
          if (idError) {
            throw new Error(`Couldn't generate a product ID: ${idError.message}`);
          }

          const payload = {
            ...values,
            product_id: newId,
            price: values?.pricing_type === 'free' ? 0 : values?.price,
          };

          await createNewProductMutation(payload);
          successToast(`"${productName}" created — ready to bundle into an offer.`);
        }

        onCreated?.();
        onClose();
      } catch (err) {
        const detail = err instanceof Error ? err.message : '';
        errorToast(
          isEditMode
            ? `Couldn't update "${productName}"${detail ? ` — ${detail}` : ''}`
            : `Couldn't create "${productName}"${detail ? ` — ${detail}` : ''}`
        );
      } finally {
        resetForm();
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
