'use client';

import { useFormik } from 'formik';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ErrorText } from '@/components/ErrorText';
import { useToastHelpers } from '@/lib/toast';
import { supabase } from '@/lib/supabaseClient';
import { CustomeSelect } from '@/components/CustomeSelect';
import { productOfferValidationSchema } from '@/validations/product-offer.schema';
import { useGetICPs } from '@/services/icps/useICPs';
import { useProducts } from '@/services/products/useProducts';
import {
  ProductOffer,
  useCreateProductOffer,
  useUpdateProductOffer,
} from '@/services/product-offers/useProductOffers';
import { mapToSelectOptions } from '@/utils/mapToSelectOptions';
import { FormFooterActions } from '@/components/FormFooterActions';
import { Info } from 'lucide-react';

interface ProductOfferModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  offer?: ProductOffer | null;
}

export default function ProductOfferModal({
  open,
  onClose,
  onCreated,
  offer,
}: ProductOfferModalProps) {
  const { successToast, errorToast } = useToastHelpers();
  const { mutateAsync: createProductOffer } = useCreateProductOffer();
  const { mutateAsync: updateProductOffer } = useUpdateProductOffer();

  const { data: icpsData, isLoading: isICPLoading } = useGetICPs();
  const { data: productsData, isLoading: isProductsLoading } = useProducts();
  const icpOptions = mapToSelectOptions(icpsData, 'icp_name', 'icp_id');
  const productOptions = mapToSelectOptions(productsData, 'product_name', 'product_id');

  const isEditMode = !!offer;

  const formik = useFormik<Omit<ProductOffer, 'offer_id'>>({
    initialValues: {
      offer_name: offer?.offer_name || '',
      icp_id: offer?.icp_id || '',
      offer_1: offer?.offer_1 || '',
      offer_2: offer?.offer_2 || '',
      offer_3: offer?.offer_3 || '',
    },
    validationSchema: productOfferValidationSchema,
    validateOnChange: true,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const normalized = {
          ...values,
          offer_2: values.offer_2 ? values.offer_2 : null,
          offer_3: values.offer_3 ? values.offer_3 : null,
        };

        if (isEditMode && offer) {
          await updateProductOffer({ id: offer.offer_id, updates: normalized });
          successToast('Offer updated successfully!');
        } else {
          const { data: offerId } = await supabase.rpc('generate_new_offer_id');

          const payload = {
            ...normalized,
            offer_id: offerId,
          };

          await createProductOffer(payload);
          successToast('Offer created successfully!');
        }

        onCreated?.();
        onClose();
        resetForm();
      } catch {
        errorToast(isEditMode ? 'Error updating offer' : 'Error creating offer');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue, isSubmitting } =
    formik;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Product Offer' : 'Create Product Offer'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
            <span>
              Product 1 is the primary pitch and is required. Products 2 and 3 are optional
              upsell / cross-sell slots — leave them blank if you only want a single-product
              offer.
            </span>
          </div>

          <div>
            <label className="text-sm font-medium">Offer Name</label>
            <Input
              name="offer_name"
              value={values.offer_name}
              onChange={handleChange}
              placeholder="Enter offer name"
            />
            <ErrorText touched={touched.offer_name} error={errors.offer_name} />
          </div>

          <CustomeSelect
            label="ICP"
            value={values.icp_id}
            onChange={(val: string) => setFieldValue('icp_id', val)}
            optionsData={icpOptions}
            loading={isICPLoading}
            placeholder="Select ICP"
          />
          <ErrorText touched={touched.icp_id} error={errors.icp_id} />

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Offer Product 1</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
                Required · Primary pitch
              </span>
            </div>
            <CustomeSelect
              label=""
              value={values.offer_1 || ''}
              onChange={(val: string) => setFieldValue('offer_1', val)}
              optionsData={productOptions}
              loading={isProductsLoading}
              placeholder="Select product"
            />
            <ErrorText touched={touched.offer_1} error={errors.offer_1} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Offer Product 2</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Optional · Upsell
              </span>
            </div>
            <CustomeSelect
              label=""
              value={values.offer_2 || ''}
              onChange={(val: string) => setFieldValue('offer_2', val)}
              optionsData={productOptions}
              loading={isProductsLoading}
              placeholder="Leave blank if not needed"
            />
            <ErrorText touched={touched.offer_2} error={errors.offer_2} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Offer Product 3</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Optional · Cross-sell
              </span>
            </div>
            <CustomeSelect
              label=""
              value={values.offer_3 || ''}
              onChange={(val: string) => setFieldValue('offer_3', val)}
              optionsData={productOptions}
              loading={isProductsLoading}
              placeholder="Leave blank if not needed"
            />
            <ErrorText touched={touched.offer_3} error={errors.offer_3} />
          </div>

          <FormFooterActions
            onCancel={onClose}
            submitLabel={isEditMode ? 'Update Offer' : 'Create Offer'}
            isSubmitting={isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

