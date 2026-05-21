import CsvMergePage from './_components/CsvMergePage';
import { Header } from '@/components/Header';
import { FileSpreadsheet } from 'lucide-react';

export default function Page() {
  return (
    <>
      <Header
        title="Dry Run Management"
        subtitle="Upload, validate, and manage CSV data before running outreach campaigns."
        icon={<FileSpreadsheet className="w-6 h-6 text-white" />}
        showLive
      />

      <CsvMergePage />
    </>
  );
}
