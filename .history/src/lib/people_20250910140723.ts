import { runQuery } from "./neo4";
import { Person } from "@/types/person";
import { v4 as uuidv4 } from 'uuid';

// Validation functions
function validatePersonData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long');
  }

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
  
  // Prepare data for database
  const person = {
    id,
    name: personData.name.trim(),
    birthYear: personData.birthYear || null,
    deathYear: personData.deathYear || null
  };

  try {
    await runQuery(
      `CREATE (:Person {id: $id, name: $name, birthYear: $birthYear, deathYear: $deathYear})`,
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
      `MATCH (p:Person) RETURN p.id AS id, p.name AS name, p.birthYear AS birthYear, p.deathYear AS deathYear ORDER BY p.name`
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
      `MATCH (p:Person {id: $id}) RETURN p.id AS id, p.name AS name, p.birthYear AS birthYear, p.deathYear AS deathYear`,
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

  if (personData.name !== undefined) {
    setClauses.push('p.name = $name');
    params.name = personData.name.trim();
  }
  if (personData.birthYear !== undefined) {
    setClauses.push('p.birthYear = $birthYear');
    params.birthYear = personData.birthYear || null;
  }
  if (personData.deathYear !== undefined) {
    setClauses.push('p.deathYear = $deathYear');
    params.deathYear = personData.deathYear || null;
  }

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