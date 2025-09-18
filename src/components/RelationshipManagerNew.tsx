"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Person } from "@/types/person";

import {
  Calendar,
  CaretDown,
  CaretUp,
  Heart,
  MagnifyingGlass,
  MapPin,
  Plus,
  Trash,
  User,
  UserCircle,
  Users,
  X,
} from '@phosphor-icons/react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    parents: true,
    children: true,
    siblings: true
  });
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<'father' | 'mother'>('father');
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before rendering the portal
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isClient) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isClient]);

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

  const getFilteredPeople = () => {
    const availableParents = getAvailableParents();
    if (!searchTerm) return availableParents;
    
    return availableParents.filter(p => 
      formatPersonName(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.birthDate?.includes(searchTerm) ||
      p.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatPersonName = (p: Person) => {
    return `${p.firstName} ${p.lastName}`.trim();
  };

  const formatPersonDetails = (p: Person) => {
    const details = [];
    if (p.birthDate) {
      details.push(`Born ${new Date(p.birthDate).getFullYear()}`);
    }
    if (p.occupation) {
      details.push(p.occupation);
    }
    return details.join(' • ');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAddRelationship = async () => {
    if (!selectedPerson) return;
    
    try {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          childId: person.id,
          parentId: selectedPerson,
          relationshipType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to add relationship');
      }

      await loadData();
      onUpdate();
      setSelectedPerson('');
      setSearchTerm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add relationship');
    }
  };

  if (loading) {
    const loadingModal = (
      <div className="fixed inset-0 w-screen h-screen bg-brown-rust/40 backdrop-blur-lg flex items-center justify-center z-[999999] p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-8 h-8 border-[3px] border-brown-rust/20 border-t-brown-rust rounded-full animate-spin mb-4"></div>
            <p className="font-body text-sm text-brown-rust">Loading relationships...</p>
          </div>
        </div>
      </div>
    );
    
    return isClient ? createPortal(loadingModal, document.body) : null;
  }

  const modalContent = (
    <div className="fixed inset-0 w-screen h-screen bg-brown-rust/40 backdrop-blur-lg flex items-center justify-center z-[999999] p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brown-rust/10">
          <div className="flex-1">
            <h2 className="font-heading text-2xl font-semibold text-brown-rust flex items-center gap-2 mb-1">
              <Heart className="w-6 h-6" weight="fill" />
              Family Relationships
            </h2>
            <p className="font-body text-sm text-brown-rust/70">
              Manage family connections for {formatPersonName(person)}
            </p>
          </div>
          <button
            className="p-2 hover:bg-brown-rust/10 rounded-lg transition-colors duration-200 text-brown-rust"
            onClick={onClose}
            aria-label="Close relationships"
          >
            <X className="w-5 h-5" weight="bold" />
          </button>
        </div>

        <div className="p-6">
          {/* Person Info Card */}
          <div className="flex items-center gap-4 p-4 bg-brown-rust/5 rounded-lg mb-6">
            <div className="flex-shrink-0">
              <UserCircle className="w-12 h-12 text-brown-rust/60" weight="fill" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg font-semibold text-brown-rust mb-1">
                {formatPersonName(person)}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-brown-rust/70">
                {person.birthDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" weight="regular" />
                    Born {new Date(person.birthDate).getFullYear()}
                  </span>
                )}
                {person.birthPlace && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" weight="regular" />
                    {person.birthPlace}
                  </span>
                )}
                {person.occupation && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" weight="regular" />
                    {person.occupation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-between bg-mandys-pink/20 border border-mandys-pink text-brown-rust px-4 py-3 rounded-lg mb-6">
              <span className="font-body text-sm">{error}</span>
              <button 
                className="p-1 hover:bg-brown-rust/10 rounded transition-colors duration-200"
                onClick={() => setError(null)}
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
          )}

          {/* Relationship Sections */}
          <div className="space-y-6">
            {/* Parents Section */}
            <div className="border border-brown-rust/20 rounded-lg overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-4 bg-pigeon-post/20 hover:bg-pigeon-post/30 transition-colors duration-200"
                onClick={() => toggleSection('parents')}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-brown-rust" weight="regular" />
                  <span className="font-heading text-lg font-medium text-brown-rust">Parents</span>
                  <span className="px-2 py-1 bg-brown-rust/10 text-brown-rust text-xs rounded-full">
                    {familyMembers.parents.length}
                  </span>
                </div>
                {expandedSections.parents ? 
                  <CaretUp className="w-5 h-5 text-brown-rust" weight="bold" /> : 
                  <CaretDown className="w-5 h-5 text-brown-rust" weight="bold" />
                }
              </button>
              
              {expandedSections.parents && (
                <div className="p-4 border-t border-brown-rust/10">
                  <div className="space-y-3 mb-4">
                    {familyMembers.parents.map((parent) => (
                      <div key={parent.id} className="flex items-center justify-between p-3 bg-brown-rust/5 border border-brown-rust/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <UserCircle className="w-8 h-8 text-brown-rust/60" weight="fill" />
                          <div>
                            <div className="font-body text-sm font-medium text-brown-rust">
                              {formatPersonName(parent)}
                            </div>
                            <div className="font-body text-xs text-brown-rust/60">
                              {formatPersonDetails(parent)}
                            </div>
                            <div className="font-body text-xs text-brown-rust/70 font-medium">
                              {parent.id === person.fatherId ? 'Father' : 'Mother'}
                            </div>
                          </div>
                        </div>
                        <button
                          className="p-2 text-brown-rust hover:bg-brown-rust/10 rounded-lg transition-colors duration-200"
                          onClick={() => handleRemoveRelationship(parent.id)}
                          aria-label={`Remove ${parent.id === person.fatherId ? 'father' : 'mother'}`}
                        >
                          <Trash className="w-4 h-4" weight="regular" />
                        </button>
                      </div>
                    ))}
                    
                    {familyMembers.parents.length === 0 && (
                      <div className="text-center py-8 text-brown-rust/60">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-60" weight="regular" />
                        <p className="font-body text-sm">No parents added yet</p>
                      </div>
                    )}
                  </div>

                  {/* Add Parent Form */}
                  {getAvailableParents().length > 0 && (
                    <div className="border-t border-brown-rust/10 pt-4">
                      <h4 className="font-heading text-base font-medium text-brown-rust mb-3">Add Parent</h4>
                      <div className="space-y-3">
                        <div className="relative">
                          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brown-rust/60" weight="regular" />
                          <input
                            type="text"
                            placeholder="Search people..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-brown-rust/20 rounded-lg font-body text-sm text-brown-rust bg-white/80 focus:outline-none focus:border-brown-rust focus:bg-white focus:ring-4 focus:ring-brown-rust/10 transition-all duration-200"
                          />
                        </div>
                        
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="relationshipType"
                              value="father"
                              checked={relationshipType === 'father'}
                              onChange={(e) => setRelationshipType(e.target.value as 'father' | 'mother')}
                              className="w-4 h-4 text-brown-rust focus:ring-brown-rust/20"
                            />
                            <span className="font-body text-sm text-brown-rust">Father</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="relationshipType"
                              value="mother"
                              checked={relationshipType === 'mother'}
                              onChange={(e) => setRelationshipType(e.target.value as 'father' | 'mother')}
                              className="w-4 h-4 text-brown-rust focus:ring-brown-rust/20"
                            />
                            <span className="font-body text-sm text-brown-rust">Mother</span>
                          </label>
                        </div>

                        <select
                          className="w-full p-3 border-2 border-brown-rust/20 rounded-lg font-body text-sm text-brown-rust bg-white/80 focus:outline-none focus:border-brown-rust focus:bg-white focus:ring-4 focus:ring-brown-rust/10 transition-all duration-200"
                          value={selectedPerson}
                          onChange={(e) => setSelectedPerson(e.target.value)}
                        >
                          <option value="">Select a person...</option>
                          {getFilteredPeople().map((p) => (
                            <option key={p.id} value={p.id}>
                              {formatPersonName(p)} {formatPersonDetails(p) && `- ${formatPersonDetails(p)}`}
                            </option>
                          ))}
                        </select>

                        <button
                          className="flex items-center gap-2 w-full justify-center bg-brown-rust text-dairy-cream border-none rounded-lg px-4 py-2 font-body text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-brown-rust/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleAddRelationship}
                          disabled={!selectedPerson}
                        >
                          <Plus className="w-4 h-4" weight="regular" />
                          Add {relationshipType === 'father' ? 'Father' : 'Mother'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Children Section */}
            <div className="border border-brown-rust/20 rounded-lg overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-4 bg-pigeon-post/20 hover:bg-pigeon-post/30 transition-colors duration-200"
                onClick={() => toggleSection('children')}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-brown-rust" weight="regular" />
                  <span className="font-heading text-lg font-medium text-brown-rust">Children</span>
                  <span className="px-2 py-1 bg-brown-rust/10 text-brown-rust text-xs rounded-full">
                    {familyMembers.children.length}
                  </span>
                </div>
                {expandedSections.children ? 
                  <CaretUp className="w-5 h-5 text-brown-rust" weight="bold" /> : 
                  <CaretDown className="w-5 h-5 text-brown-rust" weight="bold" />
                }
              </button>
              
              {expandedSections.children && (
                <div className="p-4 border-t border-brown-rust/10">
                  <div className="space-y-3">
                    {familyMembers.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-3 p-3 bg-brown-rust/5 border border-brown-rust/20 rounded-lg">
                        <UserCircle className="w-8 h-8 text-brown-rust/60" weight="fill" />
                        <div>
                          <div className="font-body text-sm font-medium text-brown-rust">
                            {formatPersonName(child)}
                          </div>
                          <div className="font-body text-xs text-brown-rust/60">
                            {formatPersonDetails(child)}
                          </div>
                          <div className="font-body text-xs text-brown-rust/70 font-medium">
                            Child
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {familyMembers.children.length === 0 && (
                      <div className="text-center py-8 text-brown-rust/60">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-60" weight="regular" />
                        <p className="font-body text-sm">No children added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Siblings Section */}
            <div className="border border-brown-rust/20 rounded-lg overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-4 bg-pigeon-post/20 hover:bg-pigeon-post/30 transition-colors duration-200"
                onClick={() => toggleSection('siblings')}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-brown-rust" weight="regular" />
                  <span className="font-heading text-lg font-medium text-brown-rust">Siblings</span>
                  <span className="px-2 py-1 bg-brown-rust/10 text-brown-rust text-xs rounded-full">
                    {familyMembers.siblings.length}
                  </span>
                </div>
                {expandedSections.siblings ? 
                  <CaretUp className="w-5 h-5 text-brown-rust" weight="bold" /> : 
                  <CaretDown className="w-5 h-5 text-brown-rust" weight="bold" />
                }
              </button>
              
              {expandedSections.siblings && (
                <div className="p-4 border-t border-brown-rust/10">
                  <div className="space-y-3">
                    {familyMembers.siblings.map((sibling) => (
                      <div key={sibling.id} className="flex items-center gap-3 p-3 bg-brown-rust/5 border border-brown-rust/20 rounded-lg">
                        <UserCircle className="w-8 h-8 text-brown-rust/60" weight="fill" />
                        <div>
                          <div className="font-body text-sm font-medium text-brown-rust">
                            {formatPersonName(sibling)}
                          </div>
                          <div className="font-body text-xs text-brown-rust/60">
                            {formatPersonDetails(sibling)}
                          </div>
                          <div className="font-body text-xs text-brown-rust/70 font-medium">
                            Sibling
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {familyMembers.siblings.length === 0 && (
                      <div className="text-center py-8 text-brown-rust/60">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-60" weight="regular" />
                        <p className="font-body text-sm">No siblings found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isClient) return null;
  
  return createPortal(modalContent, document.body);
}
