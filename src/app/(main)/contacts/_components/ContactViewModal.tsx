'use client';

import { Contact } from '@/services/contacts/useContacts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/utils/format';
import { useGetICPs } from '@/services/icps/useICPs';
import { Badge } from '@/components/ui/badge';

interface ContactViewModalProps {
  open: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export default function ContactViewModal({ open, onClose, contact }: ContactViewModalProps) {
  const { data: icpsData } = useGetICPs();
  
  if (!contact) return null;

  // Get ICP names from IDs
  const getICPNames = (): string[] => {
    if (!contact.icps || !icpsData) return [];
    const icpIds = Array.isArray(contact.icps) ? contact.icps : [];
    return icpIds
      .map((id) => icpsData.find((icp) => icp.icp_id === id)?.icp_name)
      .filter((name): name is string => !!name);
  };

  const icpNames = getICPNames();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Contact</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Parish Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Parish Name</label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Parish Name'] || 'N/A'}
            </div>
          </div>

          {/* Formed Status */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Formed Status</label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Formed Status'] || 'N/A'}
            </div>
          </div>

          {/* Parish Contact Email */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Parish Contact Email
            </label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Parish Contact Email'] || 'N/A'}
            </div>
          </div>

          {/* Parish Phone */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Parish Phone</label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Parish Phone'] || 'N/A'}
            </div>
          </div>

          {/* Institution Type */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Institution Type</label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Institution Type'] || 'N/A'}
            </div>
          </div>

          {/* Diocese/Archdiocese Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Diocese/Archdiocese Name
            </label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Diocese/Archdiocese Name'] || 'N/A'}
            </div>
          </div>

          {/* Ecclesiastical Province */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Ecclesiastical Province
            </label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Ecclesiastical Province'] || 'N/A'}
            </div>
          </div>

          {/* Deanery/Vicariate */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Deanery/Vicariate</label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Deanery/Vicariate'] || 'N/A'}
            </div>
          </div>

          {/* Rite/Church Sui Juris */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Rite/Church Sui Juris
            </label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Rite/Church Sui Juris'] || 'N/A'}
            </div>
          </div>

          {/* Religious Order Affiliation */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Religious Order Affiliation
            </label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Religious Order Affiliation'] || 'N/A'}
            </div>
          </div>

          {/* Parish Size/School Enrollmen */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Parish Size/School Enrollment
            </label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Parish Size/School Enrollmen'] || 'N/A'}
            </div>
          </div>

          {/* Budget Cycle Month */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Budget Cycle Month</label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Budget Cycle Month'] || 'N/A'}
            </div>
          </div>

          {/* Liturgical Language(s) */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Liturgical Language(s)
            </label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Liturgical Language(s)'] || 'N/A'}
            </div>
          </div>

          {/* Technology Readiness */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Technology Readiness
            </label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact['Technology Readiness'] || 'N/A'}
            </div>
          </div>

          {/* Classification */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Classification</label>
            <div className="mt-1 text-sm text-card-foreground">
              {contact.Classification || 'N/A'}
            </div>
          </div>

          {/* ICPs */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              ICPs (Ideal Customer Profiles)
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {icpNames.length > 0 ? (
                icpNames.map((name, index) => (
                  <Badge key={index} variant="secondary">
                    {name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </div>
          </div>

          {/* Email Thread */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email Thread</label>
            <div className="mt-1 text-sm text-card-foreground whitespace-pre-wrap">
              {contact['Email Thread'] || 'N/A'}
            </div>
          </div>

          {/* Created At */}
          {contact.created_at && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <div className="mt-1 text-sm text-card-foreground">
                {formatDate(contact.created_at)}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

