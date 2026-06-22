import { read, write } from './neo4j/driver';

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

type StoredUser = User & { passwordHash: string };

const PUBLIC = 'u { .id, .email, .name, .createdAt } AS user';

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const rows = await read<{ user: StoredUser }>(
    `MATCH (u:User { email: $email })
     RETURN u { .id, .email, .name, .createdAt, .passwordHash } AS user`,
    { email },
  );
  return rows[0]?.user ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await read<{ user: User }>(
    `MATCH (u:User { id: $id }) RETURN ${PUBLIC}`,
    { id },
  );
  return rows[0]?.user ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<User> {
  const rows = await write<{ user: User }>(
    `CREATE (u:User {
       id: $id, email: $email, name: $name,
       passwordHash: $passwordHash, createdAt: $createdAt
     })
     RETURN ${PUBLIC}`,
    {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      createdAt: new Date().toISOString(),
    },
  );
  return rows[0].user;
}
