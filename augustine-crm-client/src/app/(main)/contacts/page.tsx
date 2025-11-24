import { Suspense } from 'react';
import Contacts from './_components';
import ContactsLoader from './_components/ContactsLoader';
import { Header } from '@/components/Header';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export default function ContactsPage() {
  return (
    <div className="">
      <Header
        title="Contacts"
        subtitle="Manage and view all your contacts."
        icon={<UserGroupIcon className="w-6 h-6 text-white" />}
        showLive={true}
      />

      <div className="mt-5">
        <Suspense fallback={<ContactsLoader />}>
          <Contacts />
        </Suspense>
      </div>
    </div>
  );
}

