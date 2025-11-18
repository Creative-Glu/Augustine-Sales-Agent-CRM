'use client';

import { useFormik } from 'formik';
import { useCreateICPs } from '@/services/icps/useICPs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ErrorText } from '@/components/ErrorText';
import { useToastHelpers } from '@/lib/toast';
import { supabase } from '@/lib/supabaseClient';
import { icpValidationSchema } from '@/validations/icps.schema';
import { FormFooterActions } from '@/components/FormFooterActions';

interface CreateICPsModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateICPsModal({ open, onClose, onCreated }: CreateICPsModalProps) {
  const { mutateAsync: createICPMutation } = useCreateICPs();
  const { successToast, errorToast } = useToastHelpers();

  const formik = useFormik({
    initialValues: {
      icp_name: '',
      icp_desc: '',
    },
    validationSchema: icpValidationSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data, error } = await supabase.rpc('get_new_icp_id');

        if (error) throw error;

        const payload = {
          icp_id: data,
          icp_name: values.icp_name,
          icp_desc: values.icp_desc,
        };

        await createICPMutation(payload);
        successToast('ICP created successfully');

        onCreated?.();
        onClose();
      } catch (err) {
        errorToast('Error creating ICP');
        console.error('Create ICP error:', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } = formik;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New ICP</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ICP Name */}
          <div>
            <label className="text-sm font-medium">ICP Name</label>
            <Input
              name="icp_name"
              value={values.icp_name}
              onChange={handleChange}
              placeholder="Enter ICP name"
            />
            <ErrorText touched={touched.icp_name} error={errors.icp_name} />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">ICP Description</label>
            <Textarea
              name="icp_desc"
              value={values.icp_desc}
              onChange={handleChange}
              placeholder="Write a description..."
            />
            <ErrorText touched={touched.icp_desc} error={errors.icp_desc} />
          </div>

          {/* Footer */}
          <FormFooterActions
            onCancel={onClose}
            submitLabel="Create ICP"
            isSubmitting={isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
