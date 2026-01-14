'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useToastHelpers } from '@/lib/toast';
import { useQueryClient } from '@tanstack/react-query';
import FileNameCounts from './FileNameCounts';

const API_URL = '/api/upload-catholic-pdf';

export default function UploadCatholicPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { successToast, errorToast } = useToastHelpers();
  const queryClient = useQueryClient();

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setUploadSuccess(false);
    } else {
      errorToast('Invalid file type', 'Please upload a PDF file.');
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadSuccess(false);
    } else {
      errorToast('Invalid file type', 'Please upload a PDF file.');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      errorToast('No file selected', 'Please select a PDF file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Upload failed: ${response.statusText}`;
        
        // If it's a duplicate file error (409), show a more specific message
        if (response.status === 409) {
          errorToast('PDF Already Processed', errorMessage);
          return;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setUploadSuccess(true);
      successToast(result.message || 'PDF has been successfully sent to the webhook.');

      // Invalidate file counts cache to refresh the list (both paginated and non-paginated)
      queryClient.invalidateQueries({ queryKey: ['institution', 'file-name-counts'] });

      // Reset after successful upload
      setTimeout(() => {
        setFile(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      errorToast(
        'Upload failed',
        error instanceof Error ? error.message : 'An error occurred while uploading the file.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 transition-all duration-300 ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />

          {!file ? (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <DocumentArrowUpIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
              </motion.div>
              <p className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Drag and drop your PDF here
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">or</p>
              <label htmlFor="pdf-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </label>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-4">
                Only PDF files are accepted
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {uploadSuccess ? (
                <div>
                  <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                    Upload Successful!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    File: {file.name}
                  </p>
                </div>
              ) : (
                <div>
                  <DocumentArrowUpIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                  <p className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUploading ? 'Uploading...' : 'Upload PDF'}
                    </Button>
                    <Button
                      onClick={handleRemoveFile}
                      variant="outline"
                      disabled={isUploading}
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          </div>
        </div>
      </div>

      {/* File Name Counts Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="p-6">
          <FileNameCounts />
        </div>
      </div>
    </div>
  );
}

