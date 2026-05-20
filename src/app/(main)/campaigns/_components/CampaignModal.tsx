'use client';

import { useFormik } from 'formik';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomeSelect } from '@/components/CustomeSelect';
import { FormFooterActions } from '@/components/FormFooterActions';
import { ErrorText } from '@/components/ErrorText';
import { useToastHelpers } from '@/lib/toast';
import { useProductOffers } from '@/services/product-offers/useProductOffers';
import { useCreateCompaign, useUpdateCampaign } from '@/services/campaign/useCampaign';
import { campaignValidationSchema } from '@/validations/campaign.schema';
import { mapToSelectOptions } from '@/utils/mapToSelectOptions';
import { CAMPAIGN_STATUS_OPTIONS } from '@/constants';
import type { Campaign, CampaignStatus, CampaignValues } from '@/types/compaign';

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  campaign?: Campaign | null;
}

type CampaignFormValues = Omit<CampaignValues, 'campaign_id'>;

export default function CampaignModal({
  open,
  onClose,
  onCreated,
  campaign,
}: CampaignModalProps) {
  const { successToast, errorToast } = useToastHelpers();
  const { mutateAsync: createCampaign } = useCreateCompaign();
  const { mutateAsync: updateCampaign } = useUpdateCampaign();

  const { data: offersData, isLoading: isOffersLoading } = useProductOffers();
  const offerOptions = mapToSelectOptions(offersData, 'offer_name', 'offer_id');
  const statusOptions = CAMPAIGN_STATUS_OPTIONS.map((s) => ({ label: s, value: s }));

  const isEditMode = !!campaign;

  const formik = useFormik<CampaignFormValues>({
    initialValues: {
      campaign_name: campaign?.campaign_name || '',
      offer_id: campaign?.offer_id || '',
      instructions: campaign?.instructions || '',
      campaign_status: (campaign?.campaign_status as CampaignStatus) || 'Draft',
    },
    validationSchema: campaignValidationSchema,
    validateOnChange: true,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (isEditMode && campaign) {
          await updateCampaign({ id: campaign.campaign_id, updates: values });
          successToast('Campaign updated successfully!');
        } else {
          await createCampaign(values);
          successToast('Campaign created successfully!');
        }
        onCreated?.();
        onClose();
        resetForm();
      } catch {
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
              placeholder="e.g. Spring outreach to parish leads"
            />
            <ErrorText touched={touched.campaign_name} error={errors.campaign_name} />
          </div>

          <div>
            <CustomeSelect
              label="Offer"
              value={values.offer_id}
              onChange={(val: string) => setFieldValue('offer_id', val)}
              optionsData={offerOptions}
              loading={isOffersLoading}
              placeholder="Select Offer"
            />
            <ErrorText touched={touched.offer_id} error={errors.offer_id} />
          </div>

          <div>
            <CustomeSelect
              label="Status"
              value={values.campaign_status}
              onChange={(val: string) => setFieldValue('campaign_status', val)}
              optionsData={statusOptions}
              placeholder="Select status"
            />
            <ErrorText touched={touched.campaign_status} error={errors.campaign_status} />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="instructions" className="text-sm font-medium">
                Instructions
              </label>
              <span className="text-[11px] text-muted-foreground">
                {values.instructions.length} chars
              </span>
            </div>
            <p className="mt-0.5 mb-1.5 text-xs text-muted-foreground leading-relaxed">
              Tell the agent how to write — tone, audience, what to emphasise, and any alerts on
              replies. The more specific, the better the outreach.
            </p>
            <Textarea
              id="instructions"
              name="instructions"
              value={values.instructions}
              onChange={handleChange}
              placeholder={`Example:
Executive tone, focused on ROI and impact across multiple parishes.
Mention volume pricing benefits.
Slack alerts immediately on any reply.

Tips:
• Audience — who you're writing to (e.g. parish leaders, diocesan staff)
• Tone — formal, warm, executive, conversational
• Emphasis — pricing, outcomes, case studies, urgency
• Reply handling — Slack alerts, escalation, follow-up cadence`}
              className="min-h-45 font-normal leading-relaxed"
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
