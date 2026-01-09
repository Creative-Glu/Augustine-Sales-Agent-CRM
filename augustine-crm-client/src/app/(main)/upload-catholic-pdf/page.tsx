import { Suspense } from 'react';
import UploadCatholicPDF from './_components/UploadCatholicPDF';
import { Header } from '@/components/Header';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function UploadCatholicPDFPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="Upload Catholic PDF"
        subtitle="Upload and send Catholic PDF documents to the webhook."
        icon={<DocumentArrowUpIcon className="w-6 h-6 text-white" />}
        showLive={true}
      />

      <div className="px-6 py-8">
        <Suspense fallback={<div className="text-gray-500">Loading upload form...</div>}>
          <UploadCatholicPDF />
        </Suspense>
      </div>
    </div>
  );
}

