"use client";
import { Calendar, PencilSimple, Trash, User } from "@phosphor-icons/react";
import { Person } from "@/types/person";

interface PersonCardProps {
  person: Person;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

export default function PersonCard({ person, onEdit, onDelete }: PersonCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatYear = (year?: number) => {
    if (!year) return 'Unknown';
    return year.toString();
  };

  const getAgeText = () => {
    if (person.birthDate) {
      const birthDate = new Date(person.birthDate);
      if (person.deathDate) {
        const deathDate = new Date(person.deathDate);
        const years = deathDate.getFullYear() - birthDate.getFullYear();
        return `Lived ${years} years`;
      } else {
        const currentDate = new Date();
        const years = currentDate.getFullYear() - birthDate.getFullYear();
        return `${years} years old`;
      }
    } else if (person.birthYear) {
      if (person.deathYear) {
        return `Lived ${person.deathYear - person.birthYear} years`;
      }
      const currentYear = new Date().getFullYear();
      const age = currentYear - person.birthYear;
      return `${age} years old`;
    }
    return 'Age unknown';
  };

  const getDisplayName = () => {
    if (person.name) return person.name;
    
    const parts = [];
    if (person.firstName) parts.push(person.firstName);
    if (person.middleName) parts.push(person.middleName);
    if (person.lastName) parts.push(person.lastName);
    if (person.suffix) parts.push(person.suffix);
    
    return parts.join(' ') || 'Unknown Name';
  };

  return (
    <div className="person-card">
      <div className="card-header">
        <div className="person-avatar">
          <User className="avatar-icon" weight="fill" />
        </div>
        <div className="person-info">
          <h3 className="person-name">{person.name}</h3>
          <p className="person-age">{getAgeText()}</p>
        </div>
        <div className="card-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(person)}
            title="Edit person"
          >
            <PencilSimple className="action-icon" weight="regular" />
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(person)}
            title="Delete person"
          >
            <Trash className="action-icon" weight="regular" />
          </button>
        </div>
      </div>

      <div className="card-details">
        <div className="detail-item">
          <Calendar className="detail-icon" weight="regular" />
          <div className="detail-content">
            <span className="detail-label">Born:</span>
            <span className="detail-value">{formatYear(person.birthYear)}</span>
          </div>
        </div>
        
        {person.deathYear && (
          <div className="detail-item">
            <Calendar className="detail-icon" weight="regular" />
            <div className="detail-content">
              <span className="detail-label">Died:</span>
              <span className="detail-value">{formatYear(person.deathYear)}</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .person-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(166, 94, 58, 0.1);
          border: 1px solid rgba(166, 94, 58, 0.1);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .person-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #a65e3a, #d6ba5c);
        }

        .person-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(166, 94, 58, 0.15);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .person-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #a65e3a, #d6ba5c);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(166, 94, 58, 0.2);
        }

        .avatar-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #f8e8b4;
        }

        .person-info {
          flex: 1;
          min-width: 0;
        }

        .person-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #a65e3a;
          margin: 0 0 0.25rem 0;
          line-height: 1.3;
          word-wrap: break-word;
        }

        .person-age {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #a65e3a;
          opacity: 0.7;
          margin: 0;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: rgba(166, 94, 58, 0.1);
          color: #a65e3a;
        }

        .edit-btn:hover {
          background: rgba(166, 94, 58, 0.2);
          transform: scale(1.05);
        }

        .delete-btn {
          background: rgba(241, 179, 162, 0.3);
          color: #a65e3a;
        }

        .delete-btn:hover {
          background: rgba(241, 179, 162, 0.5);
          transform: scale(1.05);
        }

        .action-icon {
          width: 1rem;
          height: 1rem;
        }

        .card-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .detail-icon {
          width: 1rem;
          height: 1rem;
          color: #a65e3a;
          opacity: 0.6;
          flex-shrink: 0;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .detail-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #a65e3a;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #a65e3a;
          font-weight: 500;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .person-card {
            padding: 1rem;
          }

          .card-header {
            gap: 0.75rem;
          }

          .person-avatar {
            width: 40px;
            height: 40px;
          }

          .avatar-icon {
            width: 1.25rem;
            height: 1.25rem;
          }

          .person-name {
            font-size: 1.125rem;
          }

          .card-actions {
            gap: 0.25rem;
          }

          .action-btn {
            width: 28px;
            height: 28px;
          }

          .action-icon {
            width: 0.875rem;
            height: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}
