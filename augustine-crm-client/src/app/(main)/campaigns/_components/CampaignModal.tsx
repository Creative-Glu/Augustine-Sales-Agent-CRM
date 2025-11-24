'use client';

import { useFormik } from 'formik';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomeSelect } from '@/components/CustomeSelect';
import { ErrorText } from '@/components/ErrorText';
import { useToastHelpers } from '@/lib/toast';
import { FormFooterActions } from '@/components/FormFooterActions';
import { supabase } from '@/lib/supabaseClient';
import { useProductOffers } from '@/services/product-offers/useProductOffers';
import { mapToSelectOptions } from '@/utils/mapToSelectOptions';
import { campaignValidationSchema } from '@/validations/campaign.schema';
import { CAMPAIGN_STATUS_OPTIONS } from '@/constants';
import { CampaignValues, Campaign } from '@/types/compaign';
import { useCreateCompaign, useUpdateCampaign } from '@/services/campaign/useCampaign';

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  campaign?: Campaign | null;
}

export default function CampaignModal({
  open,
  onClose,
  onCreated,
  campaign,
}: CampaignModalProps) {
  const { successToast, errorToast } = useToastHelpers();
  const { mutateAsync: createCompaign } = useCreateCompaign();
  const { mutateAsync: updateCampaignMutation } = useUpdateCampaign();
  const { data: offersData, isLoading: isOffersLoading } = useProductOffers();
  const offerOptions = mapToSelectOptions(offersData, 'offer_name', 'offer_id');

  const isEditMode = !!campaign;

  const formik = useFormik<Omit<CampaignValues, 'campaign_id'>>({
    initialValues: {
      campaign_name: campaign?.campaign_name || '',
      offer_id: campaign?.offer_id || '',
      instructions: campaign?.instructions || '',
      campaign_status: (campaign?.campaign_status as 'Running' | 'Draft') || 'Draft',
    },
    validateOnChange: true,
    validateOnMount: true,
    enableReinitialize: true,
    validationSchema: campaignValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isEditMode && campaign) {
          const payload = {
            campaign_name: values.campaign_name,
            offer_id: values.offer_id,
            instructions: values.instructions,
            campaign_status: values.campaign_status,
          };

          await updateCampaignMutation({ id: campaign.campaign_id, updates: payload });
          successToast('Campaign updated successfully');
        } else {
          const { data: newId } = await supabase.rpc('generate_new_campaign_id');

          const payload = {
            ...values,
            campaign_id: newId,
          };
          await createCompaign(payload);
          successToast('Campaign created successfully');
        }

        onCreated?.();
        onClose();
      } catch (err) {
        console.error(isEditMode ? 'Update campaign error:' : 'Create campaign error:', err);
        errorToast(isEditMode ? 'Error updating campaign' : 'Error creating campaign');
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
          <DialogTitle>{isEditMode ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Campaign Name</label>
            <Input
              name="campaign_name"
              value={values.campaign_name}
              onChange={handleChange}
              placeholder="Enter campaign name"
            />
            <ErrorText touched={touched.campaign_name} error={errors.campaign_name} />
          </div>

          <CustomeSelect
            label="Offer"
            value={values.offer_id}
            onChange={(val: string) => setFieldValue('offer_id', val)}
            optionsData={offerOptions}
            loading={isOffersLoading}
            placeholder="Select Offer"
          />
          <ErrorText touched={touched.offer_id} error={errors.offer_id} />

          <CustomeSelect
            label="Campaign Status"
            value={values.campaign_status}
            onChange={(val: string) => setFieldValue('campaign_status', val)}
            optionsData={CAMPAIGN_STATUS_OPTIONS}
            placeholder="Select Status"
          />
          <ErrorText touched={touched.campaign_status} error={errors.campaign_status} />

          <div>
            <label className="text-sm font-medium">Instructions</label>
            <Textarea
              name="instructions"
              value={values.instructions}
              onChange={handleChange}
              placeholder="Write instructions..."
            />
            <ErrorText touched={touched.instructions} error={errors.instructions} />
          </div>

          <FormFooterActions
            onCancel={onClose}
            submitLabel={isEditMode ? 'Update Campaign' : 'Create Campaign'}
            isSubmitting={isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

