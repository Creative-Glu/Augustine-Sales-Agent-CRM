import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';

interface CreateButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export const CreateButton: React.FC<CreateButtonProps> = ({ label, onClick, className = '' }) => {
  return (
    <Button onClick={onClick} className={`cursor-pointer ${className}`}>
      <PlusCircleIcon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};
