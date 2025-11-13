import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-6xl w-full rounded-2xl bg-white shadow-xl border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                {title && (
                  <Dialog.Title className="text-lg font-semibold text-card-foreground pr-4">
                    {title}
                  </Dialog.Title>
                )}
                <button
                  onClick={onClose}
                  className="ml-auto p-1.5 text-muted-foreground hover:text-card-foreground hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">{children}</div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
