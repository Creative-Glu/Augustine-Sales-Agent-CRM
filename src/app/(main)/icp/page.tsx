import ICPs from './_components';
import { Header } from '@/components/Header';
import { Target } from 'lucide-react';

export default function ICPPage() {
  return (
    <div className="">
      <Header
        title="ICP Management"
        subtitle="Define and edit Ideal Customer Profiles used for outreach generation."
        icon={<Target className="w-6 h-6 text-white" />}
        showLive
      />

      <div className="mt-5">
        <ICPs />
      </div>
    </div>
  );
}
