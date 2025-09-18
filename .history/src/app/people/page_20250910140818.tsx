"use client";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import PersonCard from "@/components/PersonCard";
import PersonForm from "@/components/PersonForm";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Person } from "@/types/person";

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletePerson, setDeletePerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch people from API
  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/people');
      if (!response.ok) {
        throw new Error('Failed to fetch people');
      }
      const data = await response.json();
      setPeople(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load people on component mount
  useEffect(() => {
    fetchPeople();
  }, []);

  // Handle adding a new person
  const handleAddPerson = async (personData: Omit<Person, 'id'>) => {
    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to add person');
      }

      await fetchPeople(); // Refresh the list
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person');
    }
  };

  // Handle updating a person
  const handleUpdatePerson = async (personData: Person) => {
    try {
      const response = await fetch(`/api/people/${personData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      if (!response.ok) {
        throw new Error('Failed to update person');
      }

      await fetchPeople(); // Refresh the list
      setEditingPerson(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update person');
    }
  };

  // Handle deleting a person
  const handleDeletePerson = async (personId: string) => {
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete person');
      }

      await fetchPeople(); // Refresh the list
      setDeletePerson(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete person');
    }
  };

  // Filter people based on search term
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="people-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">People Management</h1>
          <p className="page-description">
            Add, edit, and manage family members in your genealogy tree
          </p>
        </div>
        <button
          className="add-person-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus className="btn-icon" weight="bold" />
          Add Person
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <MagnifyingGlass className="search-icon" weight="regular" />
          <input
            type="text"
            placeholder="Search people by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="dismiss-btn">
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading people...</p>
        </div>
      )}

      {/* People Grid */}
      {!loading && (
        <div className="people-grid">
          {filteredPeople.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Plus className="icon" weight="regular" />
              </div>
              <h3>No people found</h3>
              <p>
                {searchTerm 
                  ? 'No people match your search criteria'
                  : 'Start by adding your first family member'
                }
              </p>
              {!searchTerm && (
                <button
                  className="add-first-person-btn"
                  onClick={() => setShowForm(true)}
                >
                  Add First Person
                </button>
              )}
            </div>
          ) : (
            filteredPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onEdit={(person) => setEditingPerson(person)}
                onDelete={(person) => setDeletePerson(person)}
              />
            ))
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <PersonForm
          person={null}
          onSave={handleAddPerson}
          onCancel={() => setShowForm(false)}
          title="Add New Person"
        />
      )}

      {/* Edit Form Modal */}
      {editingPerson && (
        <PersonForm
          person={editingPerson}
          onSave={handleUpdatePerson}
          onCancel={() => setEditingPerson(null)}
          title="Edit Person"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletePerson && (
        <DeleteConfirmation
          person={deletePerson}
          onConfirm={() => handleDeletePerson(deletePerson.id)}
          onCancel={() => setDeletePerson(null)}
        />
      )}

      <style jsx>{`
        .people-page {
          margin-left: 280px;
          padding: 2rem;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8e8b4 0%, #a5c6d5 100%);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(166, 94, 58, 0.2);
        }

        .header-content {
          flex: 1;
        }

        .page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: #a65e3a;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(166, 94, 58, 0.1);
        }

        .page-description {
          font-family: 'Inter', sans-serif;
          font-size: 1.125rem;
          color: #a65e3a;
          opacity: 0.8;
          margin: 0;
        }

        .add-person-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #a65e3a;
          color: #f8e8b4;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(166, 94, 58, 0.2);
        }

        .add-person-btn:hover {
          background: #8b4a2f;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(166, 94, 58, 0.3);
        }

        .btn-icon {
          width: 1rem;
          height: 1rem;
        }

        .search-section {
          margin-bottom: 2rem;
        }

        .search-container {
          position: relative;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: #a65e3a;
          opacity: 0.6;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid rgba(166, 94, 58, 0.2);
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          background: rgba(255, 255, 255, 0.8);
          color: #a65e3a;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #a65e3a;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 3px rgba(166, 94, 58, 0.1);
        }

        .error-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f1b3a2;
          color: #a65e3a;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          border-left: 4px solid #a65e3a;
        }

        .dismiss-btn {
          background: none;
          border: none;
          color: #a65e3a;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #a65e3a;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
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

        .people-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: #a65e3a;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: rgba(166, 94, 58, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .empty-icon .icon {
          width: 2.5rem;
          height: 2.5rem;
          opacity: 0.6;
        }

        .empty-state h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          opacity: 0.8;
          margin: 0 0 1.5rem 0;
        }

        .add-first-person-btn {
          background: #a65e3a;
          color: #f8e8b4;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-first-person-btn:hover {
          background: #8b4a2f;
          transform: translateY(-1px);
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .people-page {
            margin-left: 0;
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .people-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
