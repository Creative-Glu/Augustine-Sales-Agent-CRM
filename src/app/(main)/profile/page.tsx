'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function UserProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your account details.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
              {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">{user.full_name || 'User'}</CardTitle>
              <Badge variant="outline" className="mt-1">{user.role}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 border-t border-border/60 pt-4">
          <div className="flex items-center gap-3">
            <UserIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="text-sm font-medium text-foreground">{user.full_name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium text-foreground">{user.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
