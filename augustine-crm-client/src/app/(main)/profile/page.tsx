import { UserProfile } from '@clerk/nextjs';

const APP_NAME = 'Ausgutin Sales CRM';

const UserProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className=" ">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            User Profile & Settings
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your account details and security preferences for {APP_NAME}.
          </p>
        </div>

        {/* UserProfile Component Container */}
        <div className="flex justify-center py-8">
          {/* Clerk's UserProfile component is rendered here */}
          <UserProfile
            appearance={{
              elements: {
                rootBox: 'shadow-2xl rounded-2xl border border-slate-200/50',
                card: 'shadow-none border-none',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
