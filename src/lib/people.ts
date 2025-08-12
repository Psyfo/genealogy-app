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
