import { v4 as uuidv4 } from 'uuid';
import { runQuery } from './neo4';
import { Person } from '@/types/person';

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

function validateDate(fieldName: string, dateString?: string): string | null {
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
function validatePersonData(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (
    !data.firstName ||
    typeof data.firstName !== 'string' ||
    data.firstName.trim().length < 1
  ) {
    errors.push('First name is required');
  }

  if (
    !data.lastName ||
    typeof data.lastName !== 'string' ||
    data.lastName.trim().length < 1
  ) {
    errors.push('Last name is required');
  }

  // Name length validation
  if (
    data.firstName &&
    typeof data.firstName === 'string' &&
    data.firstName.trim().length > 50
  ) {
    errors.push('First name must be 50 characters or less');
  }

  if (
    data.lastName &&
    typeof data.lastName === 'string' &&
    data.lastName.trim().length > 50
  ) {
    errors.push('Last name must be 50 characters or less');
  }

  if (
    data.middleName &&
    typeof data.middleName === 'string' &&
    data.middleName.trim().length > 50
  ) {
    errors.push('Middle name must be 50 characters or less');
  }

  // Gender validation
  if (
    data.gender &&
    typeof data.gender === 'string' &&
    !['male', 'female', 'other', 'unknown'].includes(data.gender)
  ) {
    errors.push('Gender must be one of: male, female, other, unknown');
  }

  // Date validation
  const birthDateError = validateDate(
    'Birth date',
    typeof data.birthDate === 'string' ? data.birthDate : undefined
  );
  if (birthDateError) errors.push(birthDateError);

  const deathDateError = validateDate(
    'Death date',
    typeof data.deathDate === 'string' ? data.deathDate : undefined
  );
  if (deathDateError) errors.push(deathDateError);

  // Date logic validation
  if (
    data.birthDate &&
    typeof data.birthDate === 'string' &&
    data.deathDate &&
    typeof data.deathDate === 'string'
  ) {
    const birthDate = new Date(data.birthDate);
    const deathDate = new Date(data.deathDate);
    if (deathDate <= birthDate) {
      errors.push('Death date must be after birth date');
    }
  }

  // Email validation
  const emailError = validateEmail(
    typeof data.email === 'string' ? data.email : undefined
  );
  if (emailError) errors.push(emailError);

  // Phone validation
  const phoneError = validatePhoneNumber(
    typeof data.phoneNumber === 'string' ? data.phoneNumber : undefined
  );
  if (phoneError) errors.push(phoneError);

  // Blood type validation
  if (
    data.bloodType &&
    typeof data.bloodType === 'string' &&
    !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(data.bloodType)
  ) {
    errors.push('Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-');
  }

  // Life events validation
  if (data.lifeEvents) {
    if (!Array.isArray(data.lifeEvents)) {
      errors.push('Life events must be an array');
    } else {
      data.lifeEvents.forEach(
        (event: Record<string, unknown>, index: number) => {
          if (
            !event.event ||
            typeof event.event !== 'string' ||
            event.event.trim().length < 1
          ) {
            errors.push(
              `Life event ${index + 1}: Event description is required`
            );
          }
          if (!event.date || typeof event.date !== 'string') {
            errors.push(`Life event ${index + 1}: Date is required`);
          } else {
            const eventDateError = validateDate(
              `Life event ${index + 1} date`,
              event.date
            );
            if (eventDateError) errors.push(eventDateError);
          }
          if (
            event.event &&
            typeof event.event === 'string' &&
            event.event.trim().length > 100
          ) {
            errors.push(
              `Life event ${
                index + 1
              }: Event description must be 100 characters or less`
            );
          }
          if (
            event.place &&
            typeof event.place === 'string' &&
            event.place.trim().length > 100
          ) {
            errors.push(
              `Life event ${index + 1}: Place must be 100 characters or less`
            );
          }
          if (
            event.notes &&
            typeof event.notes === 'string' &&
            event.notes.trim().length > 500
          ) {
            errors.push(
              `Life event ${index + 1}: Notes must be 500 characters or less`
            );
          }
        }
      );
    }
  }

  // Legacy field validation (for backward compatibility)
  if (data.birthYear !== undefined && data.birthYear !== null) {
    if (
      typeof data.birthYear !== 'number' ||
      data.birthYear < 1000 ||
      data.birthYear > new Date().getFullYear()
    ) {
      errors.push(
        'Birth year must be a valid number between 1000 and current year'
      );
    }
  }

  if (data.deathYear !== undefined && data.deathYear !== null) {
    if (
      typeof data.deathYear !== 'number' ||
      data.deathYear < 1000 ||
      data.deathYear > new Date().getFullYear()
    ) {
      errors.push(
        'Death year must be a valid number between 1000 and current year'
      );
    }

    if (data.birthYear && data.deathYear < data.birthYear) {
      errors.push('Death year cannot be before birth year');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateId(id: string): { isValid: boolean; error?: string } {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return { isValid: false, error: 'ID is required' };
  }

  // Check if ID is a valid UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { isValid: false, error: 'ID must be a valid UUID' };
  }

  return { isValid: true };
}

export async function createPerson(
  personData: Omit<Person, 'id'>
): Promise<Person> {
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
    middleName: personData.middleName?.trim() || undefined,
    lastName: personData.lastName.trim(),
    maidenName: personData.maidenName?.trim() || undefined,
    suffix: personData.suffix?.trim() || undefined,
    gender: personData.gender || undefined,
    birthDate: personData.birthDate || undefined,
    birthPlace: personData.birthPlace?.trim() || undefined,
    deathDate: personData.deathDate || undefined,
    deathPlace: personData.deathPlace?.trim() || undefined,
    causeOfDeath: personData.causeOfDeath?.trim() || undefined,
    height: personData.height?.trim() || undefined,
    weight: personData.weight?.trim() || undefined,
    eyeColor: personData.eyeColor?.trim() || undefined,
    hairColor: personData.hairColor?.trim() || undefined,
    distinguishingMarks: personData.distinguishingMarks?.trim() || undefined,
    fatherId: personData.fatherId || undefined,
    motherId: personData.motherId || undefined,
    spouseIds: personData.spouseIds || undefined,
    childrenIds: personData.childrenIds || undefined,
    siblingIds: personData.siblingIds || undefined,
    occupation: personData.occupation?.trim() || undefined,
    employer: personData.employer?.trim() || undefined,
    education: personData.education?.trim() || undefined,
    militaryService: personData.militaryService?.trim() || undefined,
    currentAddress: personData.currentAddress?.trim() || undefined,
    phoneNumber: personData.phoneNumber?.trim() || undefined,
    email: personData.email?.trim() || undefined,
    nationality: personData.nationality?.trim() || undefined,
    ethnicity: personData.ethnicity?.trim() || undefined,
    religion: personData.religion?.trim() || undefined,
    politicalAffiliation: personData.politicalAffiliation?.trim() || undefined,
    lifeEvents: personData.lifeEvents || undefined,
    bloodType: personData.bloodType || undefined,
    medicalConditions: personData.medicalConditions || undefined,
    allergies: personData.allergies || undefined,
    notes: personData.notes?.trim() || undefined,
    researchNotes: personData.researchNotes?.trim() || undefined,
    sources: personData.sources || undefined,
    lastUpdated: new Date().toISOString(),
    createdBy: personData.createdBy?.trim() || undefined,

    // Computed fields
    name: formatPersonName(personData),
    birthYear:
      extractYearFromDate(personData.birthDate) ||
      personData.birthYear ||
      undefined,
    deathYear:
      extractYearFromDate(personData.deathDate) ||
      personData.deathYear ||
      undefined,
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
      person as unknown as Record<string, unknown>
    );

    return person;
  } catch (error) {
    console.error('Error creating person:', error);
    throw new Error(
      `Failed to create person: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
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
    throw new Error(
      `Failed to fetch people: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
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
    throw new Error(
      `Failed to fetch person: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function updatePerson(
  id: string,
  personData: Partial<Omit<Person, 'id'>>
): Promise<Person> {
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
  const params: Record<string, unknown> = { id };

  // Build dynamic SET clause for all possible fields
  const fieldsToUpdate = [
    'firstName',
    'middleName',
    'lastName',
    'maidenName',
    'suffix',
    'gender',
    'birthDate',
    'birthPlace',
    'deathDate',
    'deathPlace',
    'causeOfDeath',
    'height',
    'weight',
    'eyeColor',
    'hairColor',
    'distinguishingMarks',
    'fatherId',
    'motherId',
    'spouseIds',
    'childrenIds',
    'siblingIds',
    'occupation',
    'employer',
    'education',
    'militaryService',
    'currentAddress',
    'phoneNumber',
    'email',
    'nationality',
    'ethnicity',
    'religion',
    'politicalAffiliation',
    'lifeEvents',
    'bloodType',
    'medicalConditions',
    'allergies',
    'notes',
    'researchNotes',
    'sources',
    'createdBy',
  ];

  fieldsToUpdate.forEach((field) => {
    if (personData[field as keyof typeof personData] !== undefined) {
      setClauses.push(`p.${field} = $${field}`);
      params[field] = personData[field as keyof typeof personData];
    }
  });

  // Handle computed fields
  if (
    personData.firstName !== undefined ||
    personData.middleName !== undefined ||
    personData.lastName !== undefined ||
    personData.suffix !== undefined
  ) {
    const updatedName = formatPersonName({
      firstName: personData.firstName ?? existingPerson.firstName,
      middleName: personData.middleName ?? existingPerson.middleName,
      lastName: personData.lastName ?? existingPerson.lastName,
      suffix: personData.suffix ?? existingPerson.suffix,
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
    throw new Error(
      `Failed to update person: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
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
    await runQuery(`MATCH (p:Person {id: $id})-[r]-() DELETE r`, { id });

    // Then delete the person node
    await runQuery(`MATCH (p:Person {id: $id}) DELETE p`, { id });
  } catch (error) {
    console.error('Error deleting person:', error);
    throw new Error(
      `Failed to delete person: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

// Relationship management functions
export async function addParentChildRelationship(
  childId: string,
  parentId: string,
  relationshipType: 'father' | 'mother'
): Promise<void> {
  // Validate IDs
  const childValidation = validateId(childId);
  const parentValidation = validateId(parentId);

  if (!childValidation.isValid) {
    throw new Error(`Invalid child ID: ${childValidation.error}`);
  }

  if (!parentValidation.isValid) {
    throw new Error(`Invalid parent ID: ${parentValidation.error}`);
  }

  if (childId === parentId) {
    throw new Error('A person cannot be their own parent');
  }

  // Check if both people exist
  const [child, parent] = await Promise.all([
    getPersonById(childId),
    getPersonById(parentId),
  ]);

  if (!child) {
    throw new Error('Child person not found');
  }

  if (!parent) {
    throw new Error('Parent person not found');
  }

  try {
    // Create the relationship
    await runQuery(
      `MATCH (child:Person {id: $childId}), (parent:Person {id: $parentId})
       CREATE (child)-[:CHILD_OF {type: $relationshipType}]->(parent)`,
      { childId, parentId, relationshipType }
    );

    // Update the person records with the relationship IDs
    if (relationshipType === 'father') {
      await updatePerson(childId, { fatherId: parentId });
    } else {
      await updatePerson(childId, { motherId: parentId });
    }

    // Add child to parent's children list
    const currentChildren = parent.childrenIds || [];
    if (!currentChildren.includes(childId)) {
      await updatePerson(parentId, {
        childrenIds: [...currentChildren, childId],
      });
    }

    // Update siblings for all children of the same parents
    await updateSiblings(childId);
  } catch (error) {
    console.error('Error adding parent-child relationship:', error);
    throw new Error(
      `Failed to add relationship: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function removeParentChildRelationship(
  childId: string,
  parentId: string
): Promise<void> {
  // Validate IDs
  const childValidation = validateId(childId);
  const parentValidation = validateId(parentId);

  if (!childValidation.isValid) {
    throw new Error(`Invalid child ID: ${childValidation.error}`);
  }

  if (!parentValidation.isValid) {
    throw new Error(`Invalid parent ID: ${parentValidation.error}`);
  }

  try {
    // Remove the relationship
    await runQuery(
      `MATCH (child:Person {id: $childId})-[r:CHILD_OF]->(parent:Person {id: $parentId})
       DELETE r`,
      { childId, parentId }
    );

    // Get current person data
    const [child, parent] = await Promise.all([
      getPersonById(childId),
      getPersonById(parentId),
    ]);

    if (child && parent) {
      // Update child's parent ID
      const updates: Record<string, unknown> = {};
      if (child.fatherId === parentId) {
        updates.fatherId = null;
      }
      if (child.motherId === parentId) {
        updates.motherId = null;
      }

      if (Object.keys(updates).length > 0) {
        await updatePerson(childId, updates);
      }

      // Remove child from parent's children list
      const currentChildren = parent.childrenIds || [];
      const updatedChildren = currentChildren.filter((id) => id !== childId);
      await updatePerson(parentId, { childrenIds: updatedChildren });

      // Update siblings
      await updateSiblings(childId);
    }
  } catch (error) {
    console.error('Error removing parent-child relationship:', error);
    throw new Error(
      `Failed to remove relationship: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

async function updateSiblings(personId: string): Promise<void> {
  try {
    const person = await getPersonById(personId);
    if (!person) return;

    // Get all siblings (people with same parents)
    const siblings = await runQuery<{ id: string }>(
      `MATCH (p:Person {id: $personId})-[:CHILD_OF]->(parent:Person)
       MATCH (sibling:Person)-[:CHILD_OF]->(parent)
       WHERE sibling.id <> $personId
       RETURN DISTINCT sibling.id AS id`,
      { personId }
    );

    const siblingIds = siblings.map((s) => s.id);
    await updatePerson(personId, { siblingIds });

    // Update siblings for all found siblings
    for (const siblingId of siblingIds) {
      const sibling = await getPersonById(siblingId);
      if (sibling) {
        const otherSiblings = siblingIds.filter((id) => id !== siblingId);
        if (person.fatherId) otherSiblings.push(personId);
        await updatePerson(siblingId, { siblingIds: otherSiblings });
      }
    }
  } catch (error) {
    console.error('Error updating siblings:', error);
    // Don't throw here as this is a helper function
  }
}

export async function getFamilyMembers(personId: string): Promise<{
  parents: Person[];
  children: Person[];
  siblings: Person[];
}> {
  const person = await getPersonById(personId);
  if (!person) {
    throw new Error('Person not found');
  }

  const parents: Person[] = [];
  const children: Person[] = [];
  const siblings: Person[] = [];

  // Get parents
  if (person.fatherId) {
    const father = await getPersonById(person.fatherId);
    if (father) parents.push(father);
  }
  if (person.motherId) {
    const mother = await getPersonById(person.motherId);
    if (mother) parents.push(mother);
  }

  // Get children
  if (person.childrenIds) {
    for (const childId of person.childrenIds) {
      const child = await getPersonById(childId);
      if (child) children.push(child);
    }
  }

  // Get siblings
  if (person.siblingIds) {
    for (const siblingId of person.siblingIds) {
      const sibling = await getPersonById(siblingId);
      if (sibling) siblings.push(sibling);
    }
  }

  return { parents, children, siblings };
}
