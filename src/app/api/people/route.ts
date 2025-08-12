import { NextResponse } from 'next/server';

import { createPerson, getAllPeople } from '@/lib/people';

export async function GET() {
  const people = await getAllPeople();
  return NextResponse.json(people);
}

export async function POST(req: Request) {
  const data = await req.json();
  await createPerson(data);
  return NextResponse.json({ status: 'ok' });
}
