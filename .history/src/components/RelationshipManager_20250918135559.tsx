"use client";
import { Plus, Trash, User, Users, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Person } from "@/types/person";

interface RelationshipManagerProps {
  person: Person;
  onClose: () => void;
  onUpdate: () => void;
}

export default function RelationshipManager({ person, onClose, onUpdate }: RelationshipManagerProps) {
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [familyMembers, setFamilyMembers] = useState<{
    parents: Person[];
    children: Person[];
    siblings: Person[];
  }>({ parents: [], children: [], siblings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [person.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [peopleResponse, familyResponse] = await Promise.all([
        fetch('/api/people'),
        fetch(`/api/relationships?personId=${person.id}`)
      ]);
      
      if (!peopleResponse.ok) {
        throw new Error('Failed to fetch people');
      }
      if (!familyResponse.ok) {
        throw new Error('Failed to fetch family members');
      }
      
      const people = await peopleResponse.json();
      const family = await familyResponse.json();
      
      setAllPeople(people.filter((p: Person) => p.id !== person.id));
      setFamilyMembers(family);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelationship = async (parentId: string, relationshipType: 'father' | 'mother') => {
    try {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          childId: person.id,
          parentId,
          relationshipType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to add relationship');
      }

      await loadData();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add relationship');
    }
  };

  const handleRemoveRelationship = async (parentId: string) => {
    try {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove',
          childId: person.id,
          parentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to remove relationship');
      }

      await loadData();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove relationship');
    }
  };

  const getAvailableParents = () => {
    const currentParentIds = familyMembers.parents.map(p => p.id);
    return allPeople.filter(p => !currentParentIds.includes(p.id));
  };

  const formatPersonName = (p: Person) => {
    return `${p.firstName} ${p.lastName}`.trim();
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading relationships...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Family Relationships</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close relationships"
          >
            <X className="close-icon" weight="bold" />
          </button>
        </div>

        <div className="relationship-content">
          <div className="person-info">
            <h3 className="person-name">{formatPersonName(person)}</h3>
            <p className="person-details">
              {person.birthDate && `Born: ${new Date(person.birthDate).getFullYear()}`}
              {person.deathDate && ` - Died: ${new Date(person.deathDate).getFullYear()}`}
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Parents Section */}
          <div className="relationship-section">
            <h4 className="section-title">
              <User className="section-icon" weight="regular" />
              Parents
            </h4>
            
            <div className="relationship-list">
              {familyMembers.parents.map((parent) => (
                <div key={parent.id} className="relationship-item">
                  <div className="person-info">
                    <span className="person-name">{formatPersonName(parent)}</span>
                    <span className="relationship-type">
                      {parent.id === person.fatherId ? 'Father' : 'Mother'}
                    </span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveRelationship(parent.id)}
                    aria-label={`Remove ${parent.id === person.fatherId ? 'father' : 'mother'}`}
                  >
                    <Trash className="remove-icon" weight="regular" />
                  </button>
                </div>
              ))}
              
              {familyMembers.parents.length === 0 && (
                <p className="no-relationships">No parents added</p>
              )}
            </div>

            {/* Add Parent */}
            {getAvailableParents().length > 0 && (
              <div className="add-relationship">
                <select
                  className="person-select"
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (selectedId) {
                      const relationshipType = familyMembers.parents.some(p => p.id === person.fatherId) ? 'mother' : 'father';
                      handleAddRelationship(selectedId, relationshipType);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Add {familyMembers.parents.length === 0 ? 'Parent' : familyMembers.parents.length === 1 ? 'Other Parent' : 'Parent'}</option>
                  {getAvailableParents().map((p) => (
                    <option key={p.id} value={p.id}>
                      {formatPersonName(p)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Children Section */}
          <div className="relationship-section">
            <h4 className="section-title">
              <Users className="section-icon" weight="regular" />
              Children
            </h4>
            
            <div className="relationship-list">
              {familyMembers.children.map((child) => (
                <div key={child.id} className="relationship-item">
                  <div className="person-info">
                    <span className="person-name">{formatPersonName(child)}</span>
                    <span className="relationship-type">Child</span>
                  </div>
                </div>
              ))}
              
              {familyMembers.children.length === 0 && (
                <p className="no-relationships">No children added</p>
              )}
            </div>
          </div>

          {/* Siblings Section */}
          <div className="relationship-section">
            <h4 className="section-title">
              <Users className="section-icon" weight="regular" />
              Siblings
            </h4>
            
            <div className="relationship-list">
              {familyMembers.siblings.map((sibling) => (
                <div key={sibling.id} className="relationship-item">
                  <div className="person-info">
                    <span className="person-name">{formatPersonName(sibling)}</span>
                    <span className="relationship-type">Sibling</span>
                  </div>
                </div>
              ))}
              
              {familyMembers.siblings.length === 0 && (
                <p className="no-relationships">No siblings found</p>
              )}
            </div>
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
            max-width: 600px;
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

          .relationship-content {
            padding: 0 1.5rem 1.5rem 1.5rem;
          }

          .person-info {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: rgba(166, 94, 58, 0.05);
            border-radius: 8px;
            text-align: center;
          }

          .person-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.25rem;
            font-weight: 600;
            color: #a65e3a;
            display: block;
            margin-bottom: 0.5rem;
          }

          .person-details {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            color: #a65e3a;
            opacity: 0.7;
            margin: 0;
          }

          .relationship-section {
            margin-bottom: 2rem;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.125rem;
            font-weight: 600;
            color: #a65e3a;
            margin: 0 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid rgba(166, 94, 58, 0.1);
          }

          .section-icon {
            width: 1.25rem;
            height: 1.25rem;
          }

          .relationship-list {
            margin-bottom: 1rem;
          }

          .relationship-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            background: rgba(166, 94, 58, 0.05);
            border: 1px solid rgba(166, 94, 58, 0.2);
            border-radius: 8px;
            margin-bottom: 0.5rem;
          }

          .relationship-item .person-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin: 0;
            padding: 0;
            background: none;
            text-align: left;
          }

          .relationship-item .person-name {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            font-weight: 500;
            color: #a65e3a;
            margin: 0 0 0.25rem 0;
          }

          .relationship-type {
            font-family: 'Inter', sans-serif;
            font-size: 0.75rem;
            color: #a65e3a;
            opacity: 0.7;
            margin: 0;
          }

          .remove-btn {
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

          .remove-btn:hover {
            background: rgba(166, 94, 58, 0.1);
          }

          .remove-icon {
            width: 1rem;
            height: 1rem;
          }

          .add-relationship {
            margin-top: 1rem;
          }

          .person-select {
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

          .person-select:focus {
            outline: none;
            border-color: #a65e3a;
            background: white;
            box-shadow: 0 0 0 3px rgba(166, 94, 58, 0.1);
          }

          .no-relationships {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            color: #a65e3a;
            opacity: 0.7;
            font-style: italic;
            text-align: center;
            padding: 1rem;
            margin: 0;
          }

          .error-message {
            background: rgba(241, 179, 162, 0.1);
            border: 1px solid #f1b3a2;
            color: #a65e3a;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            margin-bottom: 1rem;
          }

          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            text-align: center;
          }

          .loading-spinner {
            width: 2rem;
            height: 2rem;
            border: 3px solid rgba(166, 94, 58, 0.2);
            border-top: 3px solid #a65e3a;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-container p {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            color: #a65e3a;
            margin: 0;
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

            .relationship-content {
              padding: 0 1rem 1rem 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
