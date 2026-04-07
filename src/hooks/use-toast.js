'use client';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/** ✅ Success Toast Hook */
export const useSuccessToast = () => {
  return (message) =>
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
};

export const useErrorToast = () => {
  return (message, description) =>
    toast.error(
      <div>
        <strong>{message}</strong>
        {description && (
          <div style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.9 }}>{description}</div>
        )}
      </div>,
      {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      }
    );
};

/** ✅ Info Toast Hook */
export const useInfoToast = () => {
  return (message) =>
    toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
};

/** ✅ Global Toast Provider */
export const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      pauseOnHover
      draggable
      theme="colored"
    />
  );
};
