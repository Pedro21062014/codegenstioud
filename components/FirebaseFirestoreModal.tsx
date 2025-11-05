import React, { useState, useEffect } from 'react';

interface FirebaseFirestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    id: string;
    firebase_project_id?: string;
    firebase_service_account_key?: string;
  };
  onSave: (settings: { firebase_project_id?: string; firebase_service_account_key?: string; }) => void;
}

export const FirebaseFirestoreModal: React.FC<FirebaseFirestoreModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [projectId, setProjectId] = useState('');
  const [serviceAccountKey, setServiceAccountKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProjectId(settings.firebase_project_id || '');
      setServiceAccountKey(settings.firebase_service_account_key || '');
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSave({
      firebase_project_id: projectId,
      firebase_service_account_key: serviceAccountKey
    });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Firebase Firestore Integration</h2>

        <p className="mb-4">
          Connect your Firebase project to enable Firestore database operations.
          You can find this information in your Firebase console.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="firebase-project-id" className="block text-sm font-medium text-gray-700">
              Firebase Project ID
            </label>
            <input
              type="text"
              id="firebase-project-id"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="my-firebase-project-12345"
            />
          </div>

          <div>
            <label htmlFor="firebase-sa-key" className="block text-sm font-medium text-gray-700">
              Service Account Key (JSON)
            </label>
            <textarea
              id="firebase-sa-key"
              rows={8}
              value={serviceAccountKey}
              onChange={(e) => setServiceAccountKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={`{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key_id": "...",\n  "..."\n}`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
