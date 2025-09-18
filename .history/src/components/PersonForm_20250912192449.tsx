"use client";
import { useEffect, useState } from "react";
import { Person, LifeEvent } from "@/types/person";

import {
  Briefcase,
  Calendar,
  Envelope,
  FileText,
  GraduationCap,
  Heart,
  MapPin,
  Phone,
  Plus,
  Shield,
  Stethoscope,
  Trash,
  User,
  UserCircle,
  Users,
  X,
} from '@phosphor-icons/react';

interface PersonFormProps {
  person: Person | null;
  onSave: (personData: Person | Omit<Person, 'id'>) => void;
  onCancel: () => void;
  title: string;
}

export default function PersonForm({ person, onSave, onCancel, title }: PersonFormProps) {
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    middleName: '',
    lastName: '',
    maidenName: '',
    suffix: '',
    gender: '',
    
    // Personal Details
    birthDate: '',
    birthPlace: '',
    deathDate: '',
    deathPlace: '',
    causeOfDeath: '',
    
    // Physical Description
    height: '',
    weight: '',
    eyeColor: '',
    hairColor: '',
    distinguishingMarks: '',
    
    // Professional & Education
    occupation: '',
    employer: '',
    education: '',
    militaryService: '',
    
    // Contact & Location
    currentAddress: '',
    phoneNumber: '',
    email: '',
    
    // Additional Details
    nationality: '',
    ethnicity: '',
    religion: '',
    politicalAffiliation: '',
    
    // Life Events
    lifeEvents: [],
    
    // Medical Information
    bloodType: '',
    medicalConditions: '',
    allergies: '',
    
    // Notes & Research
    notes: '',
    researchNotes: '',
    sources: '',
    
    // Legacy fields for backward compatibility
    name: '',
    birthYear: '',
    deathYear: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form data when person prop changes
  useEffect(() => {
    if (person) {
      setFormData({
        firstName: person.firstName || '',
        middleName: person.middleName || '',
        lastName: person.lastName || '',
        maidenName: person.maidenName || '',
        suffix: person.suffix || '',
        gender: person.gender || '',
        birthDate: person.birthDate || '',
        birthPlace: person.birthPlace || '',
        deathDate: person.deathDate || '',
        deathPlace: person.deathPlace || '',
        causeOfDeath: person.causeOfDeath || '',
        height: person.height || '',
        weight: person.weight || '',
        eyeColor: person.eyeColor || '',
        hairColor: person.hairColor || '',
        distinguishingMarks: person.distinguishingMarks || '',
        occupation: person.occupation || '',
        employer: person.employer || '',
        education: person.education || '',
        militaryService: person.militaryService || '',
        currentAddress: person.currentAddress || '',
        phoneNumber: person.phoneNumber || '',
        email: person.email || '',
        nationality: person.nationality || '',
        ethnicity: person.ethnicity || '',
        religion: person.religion || '',
        politicalAffiliation: person.politicalAffiliation || '',
        lifeEvents: person.lifeEvents || [],
        bloodType: person.bloodType || '',
        medicalConditions: person.medicalConditions?.join(', ') || '',
        allergies: person.allergies?.join(', ') || '',
        notes: person.notes || '',
        researchNotes: person.researchNotes || '',
        sources: person.sources?.join(', ') || '',
        name: person.name || '',
        birthYear: person.birthYear?.toString() || '',
        deathYear: person.deathYear?.toString() || '',
      });
    } else {
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        maidenName: '',
        suffix: '',
        gender: '',
        birthDate: '',
        birthPlace: '',
        deathDate: '',
        deathPlace: '',
        causeOfDeath: '',
        height: '',
        weight: '',
        eyeColor: '',
        hairColor: '',
        distinguishingMarks: '',
        occupation: '',
        employer: '',
        education: '',
        militaryService: '',
        currentAddress: '',
        phoneNumber: '',
        email: '',
        nationality: '',
        ethnicity: '',
        religion: '',
        politicalAffiliation: '',
        lifeEvents: [],
        bloodType: '',
        medicalConditions: '',
        allergies: '',
        notes: '',
        researchNotes: '',
        sources: '',
        name: '',
        birthYear: '',
        deathYear: '',
      });
    }
    setErrors({});
  }, [person]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phoneNumber) {
      const digits = formData.phoneNumber.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        newErrors.phoneNumber = 'Phone number must be between 7 and 15 digits';
      }
    }

    // Date validation
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      if (isNaN(birthDate.getTime())) {
        newErrors.birthDate = 'Please enter a valid birth date';
      } else {
        const year = birthDate.getFullYear();
        const currentYear = new Date().getFullYear();
        if (year < 1000 || year > currentYear) {
          newErrors.birthDate = `Birth year must be between 1000 and ${currentYear}`;
        }
      }
    }

    if (formData.deathDate) {
      const deathDate = new Date(formData.deathDate);
      if (isNaN(deathDate.getTime())) {
        newErrors.deathDate = 'Please enter a valid death date';
      } else {
        const year = deathDate.getFullYear();
        const currentYear = new Date().getFullYear();
        if (year < 1000 || year > currentYear) {
          newErrors.deathDate = `Death year must be between 1000 and ${currentYear}`;
        }
      }
    }

    // Date logic validation
    if (formData.birthDate && formData.deathDate) {
      const birthDate = new Date(formData.birthDate);
      const deathDate = new Date(formData.deathDate);
      if (deathDate <= birthDate) {
        newErrors.deathDate = 'Death date must be after birth date';
      }
    }

    // Blood type validation
    if (formData.bloodType && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(formData.bloodType)) {
      newErrors.bloodType = 'Please select a valid blood type';
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
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim() || undefined,
      lastName: formData.lastName.trim(),
      maidenName: formData.maidenName.trim() || undefined,
      suffix: formData.suffix.trim() || undefined,
      gender: formData.gender || undefined,
      birthDate: formData.birthDate || undefined,
      birthPlace: formData.birthPlace.trim() || undefined,
      deathDate: formData.deathDate || undefined,
      deathPlace: formData.deathPlace.trim() || undefined,
      causeOfDeath: formData.causeOfDeath.trim() || undefined,
      height: formData.height.trim() || undefined,
      weight: formData.weight.trim() || undefined,
      eyeColor: formData.eyeColor.trim() || undefined,
      hairColor: formData.hairColor.trim() || undefined,
      distinguishingMarks: formData.distinguishingMarks.trim() || undefined,
      occupation: formData.occupation.trim() || undefined,
      employer: formData.employer.trim() || undefined,
      education: formData.education.trim() || undefined,
      militaryService: formData.militaryService.trim() || undefined,
      currentAddress: formData.currentAddress.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      email: formData.email.trim() || undefined,
      nationality: formData.nationality.trim() || undefined,
      ethnicity: formData.ethnicity.trim() || undefined,
      religion: formData.religion.trim() || undefined,
      politicalAffiliation: formData.politicalAffiliation.trim() || undefined,
      lifeEvents: formData.lifeEvents.length > 0 ? formData.lifeEvents : undefined,
      bloodType: formData.bloodType || undefined,
      medicalConditions: formData.medicalConditions.trim() ? formData.medicalConditions.split(',').map(c => c.trim()).filter(c => c) : undefined,
      allergies: formData.allergies.trim() ? formData.allergies.split(',').map(a => a.trim()).filter(a => a) : undefined,
      notes: formData.notes.trim() || undefined,
      researchNotes: formData.researchNotes.trim() || undefined,
      sources: formData.sources.trim() ? formData.sources.split(',').map(s => s.trim()).filter(s => s) : undefined,
      
      // Legacy fields for backward compatibility
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      birthYear: formData.birthDate ? new Date(formData.birthDate).getFullYear() : (formData.birthYear ? parseInt(formData.birthYear) : undefined),
      deathYear: formData.deathDate ? new Date(formData.deathDate).getFullYear() : (formData.deathYear ? parseInt(formData.deathYear) : undefined),
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

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'personal', label: 'Personal', icon: UserCircle },
    { id: 'physical', label: 'Physical', icon: UserCircle },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'life', label: 'Life Events', icon: Heart },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

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
          {/* Tab Navigation */}
          <div className="tab-navigation">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComponent className="tab-icon" weight="regular" />
                  <span className="tab-label">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content - Basic Info */}
          {activeTab === 'basic' && (
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    <User className="label-icon" weight="regular" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter first name"
                    autoFocus
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="middleName" className="form-label">
                    <User className="label-icon" weight="regular" />
                    Middle Name
                  </label>
                  <input
                    type="text"
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    className="form-input"
                    placeholder="Enter middle name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    <User className="label-icon" weight="regular" />
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="maidenName" className="form-label">
                    <User className="label-icon" weight="regular" />
                    Maiden Name
                  </label>
                  <input
                    type="text"
                    id="maidenName"
                    value={formData.maidenName}
                    onChange={(e) => handleInputChange('maidenName', e.target.value)}
                    className="form-input"
                    placeholder="Enter maiden name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="suffix" className="form-label">
                    <User className="label-icon" weight="regular" />
                    Suffix
                  </label>
                  <input
                    type="text"
                    id="suffix"
                    value={formData.suffix}
                    onChange={(e) => handleInputChange('suffix', e.target.value)}
                    className="form-input"
                    placeholder="Jr., Sr., III, etc."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender" className="form-label">
                    <User className="label-icon" weight="regular" />
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content - Personal Details */}
          {activeTab === 'personal' && (
            <div className="form-section">
              <h3 className="section-title">Personal Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="birthDate" className="form-label">
                    <Calendar className="label-icon" weight="regular" />
                    Birth Date
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={`form-input ${errors.birthDate ? 'error' : ''}`}
                  />
                  {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="birthPlace" className="form-label">
                    <MapPin className="label-icon" weight="regular" />
                    Birth Place
                  </label>
                  <input
                    type="text"
                    id="birthPlace"
                    value={formData.birthPlace}
                    onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                    className="form-input"
                    placeholder="City, State, Country"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="deathDate" className="form-label">
                    <Calendar className="label-icon" weight="regular" />
                    Death Date
                  </label>
                  <input
                    type="date"
                    id="deathDate"
                    value={formData.deathDate}
                    onChange={(e) => handleInputChange('deathDate', e.target.value)}
                    className={`form-input ${errors.deathDate ? 'error' : ''}`}
                  />
                  {errors.deathDate && <span className="error-message">{errors.deathDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="deathPlace" className="form-label">
                    <MapPin className="label-icon" weight="regular" />
                    Death Place
                  </label>
                  <input
                    type="text"
                    id="deathPlace"
                    value={formData.deathPlace}
                    onChange={(e) => handleInputChange('deathPlace', e.target.value)}
                    className="form-input"
                    placeholder="City, State, Country"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="causeOfDeath" className="form-label">
                  <Stethoscope className="label-icon" weight="regular" />
                  Cause of Death
                </label>
                <input
                  type="text"
                  id="causeOfDeath"
                  value={formData.causeOfDeath}
                  onChange={(e) => handleInputChange('causeOfDeath', e.target.value)}
                  className="form-input"
                  placeholder="Enter cause of death"
                />
              </div>
            </div>
          )}

          {/* Tab Content - Physical Details */}
          {activeTab === 'physical' && (
            <div className="form-section">
              <h3 className="section-title">Physical Description</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="height" className="form-label">
                    <UserCircle className="label-icon" weight="regular" />
                    Height
                  </label>
                  <input
                    type="text"
                    id="height"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="form-input"
                     placeholder="e.g., 5'10&quot; or 178 cm"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weight" className="form-label">
                    <UserCircle className="label-icon" weight="regular" />
                    Weight
                  </label>
                  <input
                    type="text"
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 150 lbs or 68 kg"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="eyeColor" className="form-label">
                    <UserCircle className="label-icon" weight="regular" />
                    Eye Color
                  </label>
                  <input
                    type="text"
                    id="eyeColor"
                    value={formData.eyeColor}
                    onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Brown, Blue, Green"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hairColor" className="form-label">
                    <UserCircle className="label-icon" weight="regular" />
                    Hair Color
                  </label>
                  <input
                    type="text"
                    id="hairColor"
                    value={formData.hairColor}
                    onChange={(e) => handleInputChange('hairColor', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Brown, Blonde, Black"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="distinguishingMarks" className="form-label">
                  <UserCircle className="label-icon" weight="regular" />
                  Distinguishing Marks
                </label>
                <textarea
                  id="distinguishingMarks"
                  value={formData.distinguishingMarks}
                  onChange={(e) => handleInputChange('distinguishingMarks', e.target.value)}
                  className="form-input"
                  placeholder="Scars, tattoos, birthmarks, etc."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Tab Content - Professional Details */}
          {activeTab === 'professional' && (
            <div className="form-section">
              <h3 className="section-title">Professional & Education</h3>
              <div className="form-group">
                <label htmlFor="occupation" className="form-label">
                  <Briefcase className="label-icon" weight="regular" />
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="form-input"
                  placeholder="Enter occupation"
                />
              </div>

              <div className="form-group">
                <label htmlFor="employer" className="form-label">
                  <Briefcase className="label-icon" weight="regular" />
                  Employer
                </label>
                <input
                  type="text"
                  id="employer"
                  value={formData.employer}
                  onChange={(e) => handleInputChange('employer', e.target.value)}
                  className="form-input"
                  placeholder="Enter employer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="education" className="form-label">
                  <GraduationCap className="label-icon" weight="regular" />
                  Education
                </label>
                <input
                  type="text"
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="form-input"
                  placeholder="e.g., High School, College, University"
                />
              </div>

              <div className="form-group">
                <label htmlFor="militaryService" className="form-label">
                  <Shield className="label-icon" weight="regular" />
                  Military Service
                </label>
                <input
                  type="text"
                  id="militaryService"
                  value={formData.militaryService}
                  onChange={(e) => handleInputChange('militaryService', e.target.value)}
                  className="form-input"
                  placeholder="Branch, rank, years of service"
                />
              </div>
            </div>
          )}

          {/* Tab Content - Contact Details */}
          {activeTab === 'contact' && (
            <div className="form-section">
              <h3 className="section-title">Contact & Location</h3>
              <div className="form-group">
                <label htmlFor="currentAddress" className="form-label">
                  <MapPin className="label-icon" weight="regular" />
                  Current Address
                </label>
                <textarea
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                  className="form-input"
                  placeholder="Enter current address"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    <Phone className="label-icon" weight="regular" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <Envelope className="label-icon" weight="regular" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nationality" className="form-label">
                    <MapPin className="label-icon" weight="regular" />
                    Nationality
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="form-input"
                    placeholder="Enter nationality"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ethnicity" className="form-label">
                    <Users className="label-icon" weight="regular" />
                    Ethnicity
                  </label>
                  <input
                    type="text"
                    id="ethnicity"
                    value={formData.ethnicity}
                    onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                    className="form-input"
                    placeholder="Enter ethnicity"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="religion" className="form-label">
                    <Users className="label-icon" weight="regular" />
                    Religion
                  </label>
                  <input
                    type="text"
                    id="religion"
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    className="form-input"
                    placeholder="Enter religion"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="politicalAffiliation" className="form-label">
                    <Users className="label-icon" weight="regular" />
                    Political Affiliation
                  </label>
                  <input
                    type="text"
                    id="politicalAffiliation"
                    value={formData.politicalAffiliation}
                    onChange={(e) => handleInputChange('politicalAffiliation', e.target.value)}
                    className="form-input"
                    placeholder="Enter political affiliation"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab Content - Life Events */}
          {activeTab === 'life' && (
            <div className="form-section">
              <h3 className="section-title">Life Events</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="baptismDate" className="form-label">
                    <Calendar className="label-icon" weight="regular" />
                    Baptism Date
                  </label>
                  <input
                    type="date"
                    id="baptismDate"
                    value={formData.baptismDate}
                    onChange={(e) => handleInputChange('baptismDate', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmationDate" className="form-label">
                    <Calendar className="label-icon" weight="regular" />
                    Confirmation Date
                  </label>
                  <input
                    type="date"
                    id="confirmationDate"
                    value={formData.confirmationDate}
                    onChange={(e) => handleInputChange('confirmationDate', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="marriageDate" className="form-label">
                    <Heart className="label-icon" weight="regular" />
                    Marriage Date
                  </label>
                  <input
                    type="date"
                    id="marriageDate"
                    value={formData.marriageDate}
                    onChange={(e) => handleInputChange('marriageDate', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="marriagePlace" className="form-label">
                    <MapPin className="label-icon" weight="regular" />
                    Marriage Place
                  </label>
                  <input
                    type="text"
                    id="marriagePlace"
                    value={formData.marriagePlace}
                    onChange={(e) => handleInputChange('marriagePlace', e.target.value)}
                    className="form-input"
                    placeholder="City, State, Country"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="divorceDate" className="form-label">
                  <Heart className="label-icon" weight="regular" />
                  Divorce Date
                </label>
                <input
                  type="date"
                  id="divorceDate"
                  value={formData.divorceDate}
                  onChange={(e) => handleInputChange('divorceDate', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Tab Content - Medical Details */}
          {activeTab === 'medical' && (
            <div className="form-section">
              <h3 className="section-title">Medical Information</h3>
              <div className="form-group">
                <label htmlFor="bloodType" className="form-label">
                  <Stethoscope className="label-icon" weight="regular" />
                  Blood Type
                </label>
                <select
                  id="bloodType"
                  value={formData.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  className={`form-input ${errors.bloodType ? 'error' : ''}`}
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                {errors.bloodType && <span className="error-message">{errors.bloodType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="medicalConditions" className="form-label">
                  <Stethoscope className="label-icon" weight="regular" />
                  Medical Conditions
                </label>
                <input
                  type="text"
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  className="form-input"
                  placeholder="Separate multiple conditions with commas"
                />
              </div>

              <div className="form-group">
                <label htmlFor="allergies" className="form-label">
                  <Stethoscope className="label-icon" weight="regular" />
                  Allergies
                </label>
                <input
                  type="text"
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  className="form-input"
                  placeholder="Separate multiple allergies with commas"
                />
              </div>
            </div>
          )}

          {/* Tab Content - Notes */}
          {activeTab === 'notes' && (
            <div className="form-section">
              <h3 className="section-title">Notes & Research</h3>
              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  <FileText className="label-icon" weight="regular" />
                  General Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="form-input"
                  placeholder="Enter general notes about this person"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="researchNotes" className="form-label">
                  <FileText className="label-icon" weight="regular" />
                  Research Notes
                </label>
                <textarea
                  id="researchNotes"
                  value={formData.researchNotes}
                  onChange={(e) => handleInputChange('researchNotes', e.target.value)}
                  className="form-input"
                  placeholder="Enter research notes and findings"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sources" className="form-label">
                  <FileText className="label-icon" weight="regular" />
                  Sources
                </label>
                <input
                  type="text"
                  id="sources"
                  value={formData.sources}
                  onChange={(e) => handleInputChange('sources', e.target.value)}
                  className="form-input"
                  placeholder="Separate multiple sources with commas"
                />
              </div>
            </div>
          )}

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
          max-width: 800px;
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

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(166, 94, 58, 0.2);
          background: white;
          color: #a65e3a;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tab-button:hover {
          background: rgba(166, 94, 58, 0.05);
          border-color: #a65e3a;
        }

        .tab-button.active {
          background: #a65e3a;
          color: white;
          border-color: #a65e3a;
        }

        .tab-icon {
          width: 1rem;
          height: 1rem;
        }

        .tab-label {
          font-size: 0.875rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #a65e3a;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid rgba(166, 94, 58, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
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

          .form-row {
            grid-template-columns: 1fr;
          }

          .tab-navigation {
            flex-wrap: wrap;
          }

          .tab-button {
            flex: 1;
            min-width: 120px;
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
