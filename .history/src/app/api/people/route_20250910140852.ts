import { NextResponse } from "next/server";
import { createPerson, getAllPeople } from "@/lib/people";

export async function GET() {
  try {
    const people = await getAllPeople();
    return NextResponse.json(people);
  } catch (error) {
    console.error('Error in GET /api/people:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch people',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate request body
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const person = await createPerson(data);
    return NextResponse.json({ 
      status: 'ok', 
      person 
    });
  } catch (error) {
    console.error('Error in POST /api/people:', error);
    
    // Check if it's a validation error
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create person',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
