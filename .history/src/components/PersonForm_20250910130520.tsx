"use client";
import { useState, useEffect } from 'react';
import { Person } from '@/types/person';
import { X, User, Calendar } from '@phosphor-icons/react';

interface PersonFormProps {
  person: Person | null;
  onSave: (personData: Person | Omit<Person, 'id'>) => void;
  onCancel: () => void;
  title: string;
}

export default function PersonForm({ person, onSave, onCancel, title }: PersonFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    deathYear: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when person prop changes
  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name,
        birthYear: person.birthYear?.toString() || '',
        deathYear: person.deathYear?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        birthYear: '',
        deathYear: '',
      });
    }
    setErrors({});
  }, [person]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Birth year validation
    if (formData.birthYear) {
      const birthYear = parseInt(formData.birthYear);
      const currentYear = new Date().getFullYear();
      
      if (isNaN(birthYear)) {
        newErrors.birthYear = 'Birth year must be a valid number';
      } else if (birthYear < 1000 || birthYear > currentYear) {
        newErrors.birthYear = `Birth year must be between 1000 and ${currentYear}`;
      }
    }

    // Death year validation
    if (formData.deathYear) {
      const deathYear = parseInt(formData.deathYear);
      const birthYear = formData.birthYear ? parseInt(formData.birthYear) : null;
      const currentYear = new Date().getFullYear();
      
      if (isNaN(deathYear)) {
        newErrors.deathYear = 'Death year must be a valid number';
      } else if (deathYear < 1000 || deathYear > currentYear) {
        newErrors.deathYear = `Death year must be between 1000 and ${currentYear}`;
      } else if (birthYear && deathYear < birthYear) {
        newErrors.deathYear = 'Death year cannot be before birth year';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const personData = {
      ...(person && { id: person.id }),
      name: formData.name.trim(),
      birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
      deathYear: formData.deathYear ? parseInt(formData.deathYear) : undefined,
    };

    onSave(personData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="close-btn"
            onClick={onCancel}
            aria-label="Close form"
          >
            <X className="close-icon" weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="person-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User className="label-icon" weight="regular" />
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter full name"
              autoFocus
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="birthYear" className="form-label">
              <Calendar className="label-icon" weight="regular" />
              Birth Year
            </label>
            <input
              type="number"
              id="birthYear"
              value={formData.birthYear}
              onChange={(e) => handleInputChange('birthYear', e.target.value)}
              className={`form-input ${errors.birthYear ? 'error' : ''}`}
              placeholder="e.g., 1950"
              min="1000"
              max={new Date().getFullYear()}
            />
            {errors.birthYear && <span className="error-message">{errors.birthYear}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="deathYear" className="form-label">
              <Calendar className="label-icon" weight="regular" />
              Death Year
            </label>
            <input
              type="number"
              id="deathYear"
              value={formData.deathYear}
              onChange={(e) => handleInputChange('deathYear', e.target.value)}
              className={`form-input ${errors.deathYear ? 'error' : ''}`}
              placeholder="e.g., 2020 (leave blank if alive)"
              min="1000"
              max={new Date().getFullYear()}
            />
            {errors.deathYear && <span className="error-message">{errors.deathYear}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
            >
              {person ? 'Update Person' : 'Add Person'}
            </button>
          </div>
        </form>
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
          justify-content: space-between;
          padding: 1.5rem 1.5rem 0 1.5rem;
          border-bottom: 1px solid rgba(166, 94, 58, 0.1);
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #a65e3a;
          margin: 0;
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

        .person-form {
          padding: 0 1.5rem 1.5rem 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: #a65e3a;
          margin-bottom: 0.5rem;
        }

        .label-icon {
          width: 1rem;
          height: 1rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid rgba(166, 94, 58, 0.2);
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #a65e3a;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #a65e3a;
          background: white;
          box-shadow: 0 0 0 3px rgba(166, 94, 58, 0.1);
        }

        .form-input.error {
          border-color: #f1b3a2;
          background: rgba(241, 179, 162, 0.1);
        }

        .form-input::placeholder {
          color: #a65e3a;
          opacity: 0.5;
        }

        .error-message {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #a65e3a;
          margin-top: 0.25rem;
          padding-left: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
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

        .save-btn {
          background: #a65e3a;
          border: none;
          color: #f8e8b4;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(166, 94, 58, 0.2);
        }

        .save-btn:hover {
          background: #8b4a2f;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(166, 94, 58, 0.3);
        }

        .save-btn:active {
          transform: translateY(0);
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

          .person-form {
            padding: 0 1rem 1rem 1rem;
          }

          .form-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .cancel-btn,
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
