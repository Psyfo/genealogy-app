import { Person } from '@/types/person';

import { runQuery } from './neo4';

export async function createPerson(person: Person) {
  await runQuery(
    `CREATE (:Person {id: $id, name: $name, birthYear: $birthYear, deathYear: $deathYear})`,
    { ...person }
  );
}

export async function getAllPeople(): Promise<Person[]> {
  return runQuery<Person>(
    `MATCH (p:Person) RETURN p.id AS id, p.name AS name, p.birthYear AS birthYear, p.deathYear AS deathYear`
  );
}

export async function getPersonById(id: string): Promise<Person | null> {
  const results = await runQuery<Person>(
    `MATCH (p:Person {id: $id}) RETURN p.id AS id, p.name AS name, p.birthYear AS birthYear, p.deathYear AS deathYear`,
    { id }
  );
  return results.length > 0 ? results[0] : null;
}

export async function updatePerson(id: string, personData: Partial<Omit<Person, 'id'>>) {
  const setClauses = [];
  const params: Record<string, any> = { id };

  if (personData.name !== undefined) {
    setClauses.push('p.name = $name');
    params.name = personData.name;
  }
  if (personData.birthYear !== undefined) {
    setClauses.push('p.birthYear = $birthYear');
    params.birthYear = personData.birthYear;
  }
  if (personData.deathYear !== undefined) {
    setClauses.push('p.deathYear = $deathYear');
    params.deathYear = personData.deathYear;
  }

  if (setClauses.length === 0) {
    throw new Error('No fields to update');
  }

  await runQuery(
    `MATCH (p:Person {id: $id}) SET ${setClauses.join(', ')}`,
    params
  );
}

export async function deletePerson(id: string) {
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
}