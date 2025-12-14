'use client';
import { TrashIcon, WarningIcon, XIcon } from '@phosphor-icons/react';
import { Person } from '@/types/person';

interface DeleteConfirmationProps {
  person: Person;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({
  person,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <div className='modal-header'>
          <div className='warning-icon'>
            <WarningIcon className='warning-icon-svg' weight='fill' />
          </div>
          <h2 className='modal-title'>Delete Person</h2>
          <button
            className='close-btn'
            onClick={onCancel}
            aria-label='Close confirmation'
          >
            <XIcon className='close-icon' weight='bold' />
          </button>
        </div>

        <div className='modal-body'>
          <p className='confirmation-text'>
            Are you sure you want to delete <strong>{person.name}</strong> from
            your family tree?
          </p>

          <div className='person-details'>
            <div className='detail-item'>
              <span className='detail-label'>Name:</span>
              <span className='detail-value'>{person.name}</span>
            </div>
            {person.birthYear && (
              <div className='detail-item'>
                <span className='detail-label'>Born:</span>
                <span className='detail-value'>{person.birthYear}</span>
              </div>
            )}
            {person.deathYear && (
              <div className='detail-item'>
                <span className='detail-label'>Died:</span>
                <span className='detail-value'>{person.deathYear}</span>
              </div>
            )}
          </div>

          <div className='warning-box'>
            <WarningIcon className='warning-icon-small' weight='regular' />
            <div className='warning-content'>
              <p className='warning-title'>This action cannot be undone</p>
              <p className='warning-description'>
                This will permanently remove the person and all their
                relationships from your family tree.
              </p>
            </div>
          </div>
        </div>

        <div className='modal-actions'>
          <button className='cancel-btn' onClick={onCancel}>
            Cancel
          </button>
          <button className='delete-btn' onClick={handleConfirm}>
            <TrashIcon className='delete-icon' weight='regular' />
            Delete Person
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.2s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 1.5rem 0 1.5rem;
          border-bottom: 1px solid rgba(166, 94, 58, 0.1);
          margin-bottom: 1.5rem;
        }

        .warning-icon {
          width: 48px;
          height: 48px;
          background: rgba(241, 179, 162, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .warning-icon-svg {
          width: 1.5rem;
          height: 1.5rem;
          color: #a65e3a;
        }

        .modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #a65e3a;
          margin: 0;
          flex: 1;
        }

        .close-btn {
          background: none;
          border: none;
          color: #a65e3a;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(166, 94, 58, 0.1);
        }

        .close-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .modal-body {
          padding: 0 1.5rem;
        }

        .confirmation-text {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #a65e3a;
          margin: 0 0 1.5rem 0;
          line-height: 1.5;
        }

        .person-details {
          background: rgba(166, 94, 58, 0.05);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #a65e3a;
          opacity: 0.7;
          font-weight: 500;
        }

        .detail-value {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #a65e3a;
          font-weight: 600;
        }

        .warning-box {
          display: flex;
          gap: 0.75rem;
          background: rgba(241, 179, 162, 0.1);
          border: 1px solid rgba(241, 179, 162, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .warning-icon-small {
          width: 1.25rem;
          height: 1.25rem;
          color: #a65e3a;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .warning-content {
          flex: 1;
        }

        .warning-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: #a65e3a;
          margin: 0 0 0.25rem 0;
        }

        .warning-description {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #a65e3a;
          opacity: 0.8;
          margin: 0;
          line-height: 1.4;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid rgba(166, 94, 58, 0.1);
        }

        .cancel-btn {
          background: none;
          border: 2px solid rgba(166, 94, 58, 0.3);
          color: #a65e3a;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          border-color: #a65e3a;
          background: rgba(166, 94, 58, 0.05);
        }

        .delete-btn {
          background: #f1b3a2;
          border: none;
          color: #a65e3a;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 4px rgba(241, 179, 162, 0.3);
        }

        .delete-btn:hover {
          background: #e8a088;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(241, 179, 162, 0.4);
        }

        .delete-btn:active {
          transform: translateY(0);
        }

        .delete-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .modal-header {
            padding: 1rem 1rem 0 1rem;
            margin-bottom: 1rem;
          }

          .modal-body {
            padding: 0 1rem;
          }

          .modal-actions {
            flex-direction: column;
            gap: 0.75rem;
            padding: 1rem;
          }

          .cancel-btn,
          .delete-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
