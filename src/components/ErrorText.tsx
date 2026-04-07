import React from 'react';

interface ErrorTextProps {
  touched?: boolean;
  error?: string;
}

export const ErrorText: React.FC<ErrorTextProps> = ({ touched, error }) => {
  if (!touched || !error) return null;

  return <p className="text-xs text-red-500 mt-1">{error}</p>;
};
