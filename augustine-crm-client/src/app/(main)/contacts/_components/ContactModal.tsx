'use client';

import { useFormik } from 'formik';
import { useCreateContact, useUpdateContact, Contact } from '@/services/contacts/useContacts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ContactFormValues } from '@/types/contact';
import { contactValidationSchema } from '@/validations/contact.schema';
import { ErrorText } from '@/components/ErrorText';
import { useToastHelpers } from '@/lib/toast';
import { FormFooterActions } from '@/components/FormFooterActions';
import { supabase } from '@/lib/supabaseClient';
import { useGetICPs } from '@/services/icps/useICPs';
import { MultiSelect } from '@/components/MultiSelect';
import { useEffect, useState } from 'react';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  contact?: Contact | null;
}

export default function ContactModal({ open, onClose, onCreated, contact }: ContactModalProps) {
  const { mutateAsync: createNewContactMutation } = useCreateContact();
  const { mutateAsync: updateContactMutation } = useUpdateContact();
  const { successToast, errorToast } = useToastHelpers();
  const { data: icpsData, isLoading: isICPLoading } = useGetICPs();

  const isEditMode = !!contact;
  
  // Parse ICPs from contact - handle both array and other formats
  const getInitialICPs = (): string[] => {
    if (!contact?.icps) return [];
    if (Array.isArray(contact.icps)) return contact.icps;
    return [];
  };

  const [selectedICPs, setSelectedICPs] = useState<string[]>(getInitialICPs());

  // Update selected ICPs when contact changes
  useEffect(() => {
    if (contact) {
      setSelectedICPs(getInitialICPs());
    } else {
      setSelectedICPs([]);
    }
  }, [contact]);

  const formik = useFormik<ContactFormValues>({
    initialValues: {
      'Parish Name': contact?.['Parish Name'] || '',
      'Formed Status': contact?.['Formed Status'] || '',
      'Parish Contact Email': contact?.['Parish Contact Email'] || '',
      'Parish Phone': contact?.['Parish Phone'] || '',
      'Institution Type': contact?.['Institution Type'] || '',
      'Diocese/Archdiocese Name': contact?.['Diocese/Archdiocese Name'] || '',
      'Ecclesiastical Province': contact?.['Ecclesiastical Province'] || '',
      'Deanery/Vicariate': contact?.['Deanery/Vicariate'] || '',
      'Rite/Church Sui Juris': contact?.['Rite/Church Sui Juris'] || '',
      'Religious Order Affiliation': contact?.['Religious Order Affiliation'] || '',
      'Parish Size/School Enrollmen': contact?.['Parish Size/School Enrollmen'] || '',
      'Budget Cycle Month': contact?.['Budget Cycle Month'] || '',
      'Liturgical Language(s)': contact?.['Liturgical Language(s)'] || '',
      'Technology Readiness': contact?.['Technology Readiness'] || '',
      Classification: contact?.Classification || '',
      icps: contact?.icps || null,
      'Email Thread': contact?.['Email Thread'] || '',
    },
    validationSchema: contactValidationSchema,
    validateOnChange: true,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Clean up empty strings to null
        const cleanedValues = Object.fromEntries(
          Object.entries(values).map(([key, value]) => [key, value === '' ? null : value])
        );

        // Add selected ICPs to the values
        const valuesWithICPs = {
          ...cleanedValues,
          icps: selectedICPs.length > 0 ? selectedICPs : null,
        };

        if (isEditMode && contact) {
          await updateContactMutation({ id: contact.id, updates: valuesWithICPs });
          successToast('Contact updated successfully');
        } else {
          const { data: newId, error: idGenerationError } = await supabase.rpc(
            'generate_new_contact_id'
          );

          if (idGenerationError || !newId) {
            throw new Error(idGenerationError?.message || 'Failed to generate contact id');
          }

          await createNewContactMutation({ ...valuesWithICPs, id: newId });
          successToast('Contact created successfully');
        }

        onCreated?.();
        onClose();
      } catch (err) {
        errorToast(isEditMode ? 'Error updating contact' : 'Error creating contact');
        console.error(isEditMode ? 'Update contact error:' : 'Create contact error:', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } = formik;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Contact' : 'Create Contact'}</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parish Name */}
          <div>
            <label className="text-sm font-medium">Parish Name</label>
            <Input
              name="Parish Name"
              value={values['Parish Name'] || ''}
              onChange={handleChange}
              placeholder="Enter parish name"
            />
            <ErrorText touched={touched['Parish Name']} error={errors['Parish Name']} />
          </div>

          {/* Formed Status */}
          <div>
            <label className="text-sm font-medium">Formed Status</label>
            <Input
              name="Formed Status"
              value={values['Formed Status'] || ''}
              onChange={handleChange}
              placeholder="Enter formed status"
            />
            <ErrorText touched={touched['Formed Status']} error={errors['Formed Status']} />
          </div>

          {/* Parish Contact Email */}
          <div>
            <label className="text-sm font-medium">Parish Contact Email</label>
            <Input
              name="Parish Contact Email"
              type="email"
              value={values['Parish Contact Email'] || ''}
              onChange={handleChange}
              placeholder="Enter email address"
            />
            <ErrorText
              touched={touched['Parish Contact Email']}
              error={errors['Parish Contact Email']}
            />
          </div>

          {/* Parish Phone */}
          <div>
            <label className="text-sm font-medium">Parish Phone</label>
            <Input
              name="Parish Phone"
              value={values['Parish Phone'] || ''}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
            <ErrorText touched={touched['Parish Phone']} error={errors['Parish Phone']} />
          </div>

          {/* Institution Type */}
          <div>
            <label className="text-sm font-medium">Institution Type</label>
            <Input
              name="Institution Type"
              value={values['Institution Type'] || ''}
              onChange={handleChange}
              placeholder="Enter institution type"
            />
            <ErrorText
              touched={touched['Institution Type']}
              error={errors['Institution Type']}
            />
          </div>

          {/* Diocese/Archdiocese Name */}
          <div>
            <label className="text-sm font-medium">Diocese/Archdiocese Name</label>
            <Input
              name="Diocese/Archdiocese Name"
              value={values['Diocese/Archdiocese Name'] || ''}
              onChange={handleChange}
              placeholder="Enter diocese/archdiocese name"
            />
            <ErrorText
              touched={touched['Diocese/Archdiocese Name']}
              error={errors['Diocese/Archdiocese Name']}
            />
          </div>

          {/* Ecclesiastical Province */}
          <div>
            <label className="text-sm font-medium">Ecclesiastical Province</label>
            <Input
              name="Ecclesiastical Province"
              value={values['Ecclesiastical Province'] || ''}
              onChange={handleChange}
              placeholder="Enter ecclesiastical province"
            />
            <ErrorText
              touched={touched['Ecclesiastical Province']}
              error={errors['Ecclesiastical Province']}
            />
          </div>

          {/* Deanery/Vicariate */}
          <div>
            <label className="text-sm font-medium">Deanery/Vicariate</label>
            <Input
              name="Deanery/Vicariate"
              value={values['Deanery/Vicariate'] || ''}
              onChange={handleChange}
              placeholder="Enter deanery/vicariate"
            />
            <ErrorText
              touched={touched['Deanery/Vicariate']}
              error={errors['Deanery/Vicariate']}
            />
          </div>

          {/* Rite/Church Sui Juris */}
          <div>
            <label className="text-sm font-medium">Rite/Church Sui Juris</label>
            <Input
              name="Rite/Church Sui Juris"
              value={values['Rite/Church Sui Juris'] || ''}
              onChange={handleChange}
              placeholder="Enter rite/church sui juris"
            />
            <ErrorText
              touched={touched['Rite/Church Sui Juris']}
              error={errors['Rite/Church Sui Juris']}
            />
          </div>

          {/* Religious Order Affiliation */}
          <div>
            <label className="text-sm font-medium">Religious Order Affiliation</label>
            <Input
              name="Religious Order Affiliation"
              value={values['Religious Order Affiliation'] || ''}
              onChange={handleChange}
              placeholder="Enter religious order affiliation"
            />
            <ErrorText
              touched={touched['Religious Order Affiliation']}
              error={errors['Religious Order Affiliation']}
            />
          </div>

          {/* Parish Size/School Enrollmen */}
          <div>
            <label className="text-sm font-medium">Parish Size/School Enrollment</label>
            <Input
              name="Parish Size/School Enrollmen"
              value={values['Parish Size/School Enrollmen'] || ''}
              onChange={handleChange}
              placeholder="Enter parish size/school enrollment"
            />
            <ErrorText
              touched={touched['Parish Size/School Enrollmen']}
              error={errors['Parish Size/School Enrollmen']}
            />
          </div>

          {/* Budget Cycle Month */}
          <div>
            <label className="text-sm font-medium">Budget Cycle Month</label>
            <Input
              name="Budget Cycle Month"
              value={values['Budget Cycle Month'] || ''}
              onChange={handleChange}
              placeholder="Enter budget cycle month"
            />
            <ErrorText
              touched={touched['Budget Cycle Month']}
              error={errors['Budget Cycle Month']}
            />
          </div>

          {/* Liturgical Language(s) */}
          <div>
            <label className="text-sm font-medium">Liturgical Language(s)</label>
            <Input
              name="Liturgical Language(s)"
              value={values['Liturgical Language(s)'] || ''}
              onChange={handleChange}
              placeholder="Enter liturgical language(s)"
            />
            <ErrorText
              touched={touched['Liturgical Language(s)']}
              error={errors['Liturgical Language(s)']}
            />
          </div>

          {/* Technology Readiness */}
          <div>
            <label className="text-sm font-medium">Technology Readiness</label>
            <Input
              name="Technology Readiness"
              value={values['Technology Readiness'] || ''}
              onChange={handleChange}
              placeholder="Enter technology readiness"
            />
            <ErrorText
              touched={touched['Technology Readiness']}
              error={errors['Technology Readiness']}
            />
          </div>

          {/* Classification */}
          <div>
            <label className="text-sm font-medium">Classification</label>
            <Input
              name="Classification"
              value={values.Classification || ''}
              onChange={handleChange}
              placeholder="Enter classification"
            />
            <ErrorText touched={touched.Classification} error={errors.Classification} />
          </div>

          {/* ICPs Selection */}
          <div>
            <MultiSelect
              label="ICPs (Ideal Customer Profiles)"
              options={
                icpsData?.map((icp) => ({
                  label: icp.icp_name,
                  value: icp.icp_id,
                  description: icp.icp_desc || undefined,
                })) || []
              }
              selected={selectedICPs}
              onChange={setSelectedICPs}
              placeholder="Select ICPs..."
              loading={isICPLoading}
            />
          </div>

          {/* Email Thread */}
          <div>
            <label className="text-sm font-medium">Email Thread</label>
            <Textarea
              name="Email Thread"
              value={values['Email Thread'] || ''}
              onChange={handleChange}
              placeholder="Enter email thread"
            />
            <ErrorText touched={touched['Email Thread']} error={errors['Email Thread']} />
          </div>

          <FormFooterActions
            onCancel={onClose}
            submitLabel={isEditMode ? 'Update Contact' : 'Create Contact'}
            isSubmitting={isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

