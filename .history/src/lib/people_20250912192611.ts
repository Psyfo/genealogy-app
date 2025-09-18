import { v4 as uuidv4 } from "uuid";
import { runQuery } from "./neo4";
import { Person, LifeEvent } from "@/types/person";

// Helper functions
function formatPersonName(person: Partial<Person>): string {
  const parts = [];
  if (person.firstName) parts.push(person.firstName);
  if (person.middleName) parts.push(person.middleName);
  if (person.lastName) parts.push(person.lastName);
  if (person.suffix) parts.push(person.suffix);
  return parts.join(' ');
}

function extractYearFromDate(dateString?: string): number | undefined {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date.getFullYear();
}

function validateDate(dateString?: string, fieldName: string): string | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date (YYYY-MM-DD format)`;
  }
  
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  
  if (year < 1000 || year > currentYear) {
    return `${fieldName} year must be between 1000 and ${currentYear}`;
  }
  
  return null;
}

function validateEmail(email?: string): string | null {
  if (!email) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email must be a valid email address';
  }
  
  return null;
}

function validatePhoneNumber(phone?: string): string | null {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number (7-15 digits)
  if (digits.length < 7 || digits.length > 15) {
    return 'Phone number must be between 7 and 15 digits';
  }
  
  return null;
}

// Validation functions
function validatePersonData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length < 1) {
    errors.push('First name is required');
  }

  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length < 1) {
    errors.push('Last name is required');
  }

  // Name length validation
  if (data.firstName && data.firstName.trim().length > 50) {
    errors.push('First name must be 50 characters or less');
  }

  if (data.lastName && data.lastName.trim().length > 50) {
    errors.push('Last name must be 50 characters or less');
  }

  if (data.middleName && data.middleName.trim().length > 50) {
    errors.push('Middle name must be 50 characters or less');
  }

  // Gender validation
  if (data.gender && !['male', 'female', 'other', 'unknown'].includes(data.gender)) {
    errors.push('Gender must be one of: male, female, other, unknown');
  }

  // Date validation
  const birthDateError = validateDate(data.birthDate, 'Birth date');
  if (birthDateError) errors.push(birthDateError);

  const deathDateError = validateDate(data.deathDate, 'Death date');
  if (deathDateError) errors.push(deathDateError);

  // Date logic validation
  if (data.birthDate && data.deathDate) {
    const birthDate = new Date(data.birthDate);
    const deathDate = new Date(data.deathDate);
    if (deathDate <= birthDate) {
      errors.push('Death date must be after birth date');
    }
  }

  // Email validation
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  // Phone validation
  const phoneError = validatePhoneNumber(data.phoneNumber);
  if (phoneError) errors.push(phoneError);

  // Blood type validation
  if (data.bloodType && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(data.bloodType)) {
    errors.push('Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-');
  }

  // Life events validation
  if (data.lifeEvents) {
    if (!Array.isArray(data.lifeEvents)) {
      errors.push('Life events must be an array');
    } else {
      data.lifeEvents.forEach((event: any, index: number) => {
        if (!event.event || typeof event.event !== 'string' || event.event.trim().length < 1) {
          errors.push(`Life event ${index + 1}: Event description is required`);
        }
        if (!event.date || typeof event.date !== 'string') {
          errors.push(`Life event ${index + 1}: Date is required`);
        } else {
          const eventDateError = validateDate(event.date, `Life event ${index + 1} date`);
          if (eventDateError) errors.push(eventDateError);
        }
        if (event.event && event.event.trim().length > 100) {
          errors.push(`Life event ${index + 1}: Event description must be 100 characters or less`);
        }
        if (event.place && event.place.trim().length > 100) {
          errors.push(`Life event ${index + 1}: Place must be 100 characters or less`);
        }
        if (event.notes && event.notes.trim().length > 500) {
          errors.push(`Life event ${index + 1}: Notes must be 500 characters or less`);
        }
      });
    }
  }

  // Legacy field validation (for backward compatibility)
  if (data.birthYear !== undefined && data.birthYear !== null) {
    if (typeof data.birthYear !== 'number' || data.birthYear < 1000 || data.birthYear > new Date().getFullYear()) {
      errors.push('Birth year must be a valid number between 1000 and current year');
    }
  }

  if (data.deathYear !== undefined && data.deathYear !== null) {
    if (typeof data.deathYear !== 'number' || data.deathYear < 1000 || data.deathYear > new Date().getFullYear()) {
      errors.push('Death year must be a valid number between 1000 and current year');
    }
    
    if (data.birthYear && data.deathYear < data.birthYear) {
      errors.push('Death year cannot be before birth year');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateId(id: string): { isValid: boolean; error?: string } {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return { isValid: false, error: 'ID is required' };
  }
  
  // Check if ID is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { isValid: false, error: 'ID must be a valid UUID' };
  }
  
  return { isValid: true };
}

export async function createPerson(personData: Omit<Person, 'id'>): Promise<Person> {
  // Validate input data
  const validation = validatePersonData(personData);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Generate unique ID
  const id = uuidv4();
  
  // Prepare data for database with computed fields
  const person: Person = {
    id,
    firstName: personData.firstName.trim(),
    middleName: personData.middleName?.trim() || null,
    lastName: personData.lastName.trim(),
    maidenName: personData.maidenName?.trim() || null,
    suffix: personData.suffix?.trim() || null,
    gender: personData.gender || null,
    birthDate: personData.birthDate || null,
    birthPlace: personData.birthPlace?.trim() || null,
    deathDate: personData.deathDate || null,
    deathPlace: personData.deathPlace?.trim() || null,
    causeOfDeath: personData.causeOfDeath?.trim() || null,
    height: personData.height?.trim() || null,
    weight: personData.weight?.trim() || null,
    eyeColor: personData.eyeColor?.trim() || null,
    hairColor: personData.hairColor?.trim() || null,
    distinguishingMarks: personData.distinguishingMarks?.trim() || null,
    fatherId: personData.fatherId || null,
    motherId: personData.motherId || null,
    spouseIds: personData.spouseIds || [],
    childrenIds: personData.childrenIds || [],
    siblingIds: personData.siblingIds || [],
    occupation: personData.occupation?.trim() || null,
    employer: personData.employer?.trim() || null,
    education: personData.education?.trim() || null,
    militaryService: personData.militaryService?.trim() || null,
    currentAddress: personData.currentAddress?.trim() || null,
    phoneNumber: personData.phoneNumber?.trim() || null,
    email: personData.email?.trim() || null,
    nationality: personData.nationality?.trim() || null,
    ethnicity: personData.ethnicity?.trim() || null,
    religion: personData.religion?.trim() || null,
    politicalAffiliation: personData.politicalAffiliation?.trim() || null,
    lifeEvents: personData.lifeEvents || [],
    bloodType: personData.bloodType || null,
    medicalConditions: personData.medicalConditions || [],
    allergies: personData.allergies || [],
    notes: personData.notes?.trim() || null,
    researchNotes: personData.researchNotes?.trim() || null,
    sources: personData.sources || [],
    lastUpdated: new Date().toISOString(),
    createdBy: personData.createdBy?.trim() || null,
    
    // Computed fields
    name: formatPersonName(personData),
    birthYear: extractYearFromDate(personData.birthDate) || personData.birthYear || null,
    deathYear: extractYearFromDate(personData.deathDate) || personData.deathYear || null
  };

  try {
  await runQuery(
      `CREATE (:Person {
        id: $id, 
        firstName: $firstName, 
        middleName: $middleName, 
        lastName: $lastName, 
        maidenName: $maidenName, 
        suffix: $suffix,
        gender: $gender,
        birthDate: $birthDate, 
        birthPlace: $birthPlace,
        deathDate: $deathDate, 
        deathPlace: $deathPlace,
        causeOfDeath: $causeOfDeath,
        height: $height,
        weight: $weight,
        eyeColor: $eyeColor,
        hairColor: $hairColor,
        distinguishingMarks: $distinguishingMarks,
        fatherId: $fatherId,
        motherId: $motherId,
        spouseIds: $spouseIds,
        childrenIds: $childrenIds,
        siblingIds: $siblingIds,
        occupation: $occupation,
        employer: $employer,
        education: $education,
        militaryService: $militaryService,
        currentAddress: $currentAddress,
        phoneNumber: $phoneNumber,
        email: $email,
        nationality: $nationality,
        ethnicity: $ethnicity,
        religion: $religion,
        politicalAffiliation: $politicalAffiliation,
        lifeEvents: $lifeEvents,
        bloodType: $bloodType,
        medicalConditions: $medicalConditions,
        allergies: $allergies,
        notes: $notes,
        researchNotes: $researchNotes,
        sources: $sources,
        lastUpdated: $lastUpdated,
        createdBy: $createdBy,
        name: $name,
        birthYear: $birthYear,
        deathYear: $deathYear
      })`,
      person
    );
    
    return person;
  } catch (error) {
    console.error('Error creating person:', error);
    throw new Error(`Failed to create person: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getAllPeople(): Promise<Person[]> {
  try {
    const results = await runQuery<Person>(
      `MATCH (p:Person) 
       RETURN p.id AS id, 
              p.firstName AS firstName, 
              p.middleName AS middleName, 
              p.lastName AS lastName, 
              p.maidenName AS maidenName, 
              p.suffix AS suffix,
              p.gender AS gender,
              p.birthDate AS birthDate, 
              p.birthPlace AS birthPlace,
              p.deathDate AS deathDate, 
              p.deathPlace AS deathPlace,
              p.causeOfDeath AS causeOfDeath,
              p.height AS height,
              p.weight AS weight,
              p.eyeColor AS eyeColor,
              p.hairColor AS hairColor,
              p.distinguishingMarks AS distinguishingMarks,
              p.fatherId AS fatherId,
              p.motherId AS motherId,
              p.spouseIds AS spouseIds,
              p.childrenIds AS childrenIds,
              p.siblingIds AS siblingIds,
              p.occupation AS occupation,
              p.employer AS employer,
              p.education AS education,
              p.militaryService AS militaryService,
              p.currentAddress AS currentAddress,
              p.phoneNumber AS phoneNumber,
              p.email AS email,
              p.nationality AS nationality,
              p.ethnicity AS ethnicity,
              p.religion AS religion,
              p.politicalAffiliation AS politicalAffiliation,
              p.lifeEvents AS lifeEvents,
              p.bloodType AS bloodType,
              p.medicalConditions AS medicalConditions,
              p.allergies AS allergies,
              p.notes AS notes,
              p.researchNotes AS researchNotes,
              p.sources AS sources,
              p.lastUpdated AS lastUpdated,
              p.createdBy AS createdBy,
              p.name AS name,
              p.birthYear AS birthYear,
              p.deathYear AS deathYear
       ORDER BY p.lastName, p.firstName`
    );
    return results;
  } catch (error) {
    console.error('Error fetching all people:', error);
    throw new Error(`Failed to fetch people: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getPersonById(id: string): Promise<Person | null> {
  // Validate ID
  const idValidation = validateId(id);
  if (!idValidation.isValid) {
    throw new Error(`Invalid ID: ${idValidation.error}`);
  }

  try {
    const results = await runQuery<Person>(
      `MATCH (p:Person {id: $id}) 
       RETURN p.id AS id, 
              p.firstName AS firstName, 
              p.middleName AS middleName, 
              p.lastName AS lastName, 
              p.maidenName AS maidenName, 
              p.suffix AS suffix,
              p.gender AS gender,
              p.birthDate AS birthDate, 
              p.birthPlace AS birthPlace,
              p.deathDate AS deathDate, 
              p.deathPlace AS deathPlace,
              p.causeOfDeath AS causeOfDeath,
              p.height AS height,
              p.weight AS weight,
              p.eyeColor AS eyeColor,
              p.hairColor AS hairColor,
              p.distinguishingMarks AS distinguishingMarks,
              p.fatherId AS fatherId,
              p.motherId AS motherId,
              p.spouseIds AS spouseIds,
              p.childrenIds AS childrenIds,
              p.siblingIds AS siblingIds,
              p.occupation AS occupation,
              p.employer AS employer,
              p.education AS education,
              p.militaryService AS militaryService,
              p.currentAddress AS currentAddress,
              p.phoneNumber AS phoneNumber,
              p.email AS email,
              p.nationality AS nationality,
              p.ethnicity AS ethnicity,
              p.religion AS religion,
              p.politicalAffiliation AS politicalAffiliation,
              p.lifeEvents AS lifeEvents,
              p.bloodType AS bloodType,
              p.medicalConditions AS medicalConditions,
              p.allergies AS allergies,
              p.notes AS notes,
              p.researchNotes AS researchNotes,
              p.sources AS sources,
              p.lastUpdated AS lastUpdated,
              p.createdBy AS createdBy,
              p.name AS name,
              p.birthYear AS birthYear,
              p.deathYear AS deathYear`,
      { id }
    );
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching person by ID:', error);
    throw new Error(`Failed to fetch person: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updatePerson(id: string, personData: Partial<Omit<Person, 'id'>>): Promise<Person> {
  // Validate ID
  const idValidation = validateId(id);
  if (!idValidation.isValid) {
    throw new Error(`Invalid ID: ${idValidation.error}`);
  }

  // Validate update data
  const validation = validatePersonData(personData);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Check if person exists
  const existingPerson = await getPersonById(id);
  if (!existingPerson) {
    throw new Error('Person not found');
  }

  const setClauses = [];
  const params: Record<string, any> = { id };

  // Build dynamic SET clause for all possible fields
  const fieldsToUpdate = [
    'firstName', 'middleName', 'lastName', 'maidenName', 'suffix', 'gender',
    'birthDate', 'birthPlace', 'deathDate', 'deathPlace', 'causeOfDeath',
    'height', 'weight', 'eyeColor', 'hairColor', 'distinguishingMarks',
    'fatherId', 'motherId', 'spouseIds', 'childrenIds', 'siblingIds',
    'occupation', 'employer', 'education', 'militaryService',
    'currentAddress', 'phoneNumber', 'email',
    'nationality', 'ethnicity', 'religion', 'politicalAffiliation',
    'baptismDate', 'confirmationDate', 'marriageDate', 'marriagePlace', 'divorceDate',
    'bloodType', 'medicalConditions', 'allergies',
    'notes', 'researchNotes', 'sources', 'createdBy'
  ];

  fieldsToUpdate.forEach(field => {
    if (personData[field as keyof typeof personData] !== undefined) {
      setClauses.push(`p.${field} = $${field}`);
      params[field] = personData[field as keyof typeof personData];
    }
  });

  // Handle computed fields
  if (personData.firstName !== undefined || personData.middleName !== undefined || 
      personData.lastName !== undefined || personData.suffix !== undefined) {
    const updatedName = formatPersonName({
      firstName: personData.firstName ?? existingPerson.firstName,
      middleName: personData.middleName ?? existingPerson.middleName,
      lastName: personData.lastName ?? existingPerson.lastName,
      suffix: personData.suffix ?? existingPerson.suffix
    });
    setClauses.push('p.name = $name');
    params.name = updatedName;
  }

  if (personData.birthDate !== undefined) {
    const birthYear = extractYearFromDate(personData.birthDate);
    if (birthYear) {
      setClauses.push('p.birthYear = $birthYear');
      params.birthYear = birthYear;
    }
  }

  if (personData.deathDate !== undefined) {
    const deathYear = extractYearFromDate(personData.deathDate);
    if (deathYear) {
      setClauses.push('p.deathYear = $deathYear');
      params.deathYear = deathYear;
    }
  }

  // Always update lastUpdated timestamp
  setClauses.push('p.lastUpdated = $lastUpdated');
  params.lastUpdated = new Date().toISOString();

  if (setClauses.length === 0) {
    throw new Error('No fields to update');
  }

  try {
    await runQuery(
      `MATCH (p:Person {id: $id}) SET ${setClauses.join(', ')}`,
      params
    );
    
    // Return updated person
    const updatedPerson = await getPersonById(id);
    if (!updatedPerson) {
      throw new Error('Failed to retrieve updated person');
    }
    
    return updatedPerson;
  } catch (error) {
    console.error('Error updating person:', error);
    throw new Error(`Failed to update person: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deletePerson(id: string): Promise<void> {
  // Validate ID
  const idValidation = validateId(id);
  if (!idValidation.isValid) {
    throw new Error(`Invalid ID: ${idValidation.error}`);
  }

  // Check if person exists
  const existingPerson = await getPersonById(id);
  if (!existingPerson) {
    throw new Error('Person not found');
  }

  try {
    // First delete all relationships connected to this person
    await runQuery(
      `MATCH (p:Person {id: $id})-[r]-() DELETE r`,
      { id }
    );
    
    // Then delete the person node
    await runQuery(
      `MATCH (p:Person {id: $id}) DELETE p`,
      { id }
    );
  } catch (error) {
    console.error('Error deleting person:', error);
    throw new Error(`Failed to delete person: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}