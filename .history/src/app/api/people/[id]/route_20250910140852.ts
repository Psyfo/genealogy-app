import { NextResponse } from "next/server";
import { deletePerson, getPersonById, updatePerson } from "@/lib/people";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const person = await getPersonById(params.id);
    
    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(person);
  } catch (error) {
    console.error('Error fetching person:', error);
    
    // Check if it's a validation error (invalid ID format)
    if (error instanceof Error && error.message.includes('Invalid ID')) {
      return NextResponse.json(
        { 
          error: 'Invalid person ID',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch person',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const data = await req.json();
    
    // Validate request body
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Update the person
    const updatedPerson = await updatePerson(params.id, data);
    
    return NextResponse.json({ 
      status: 'ok',
      person: updatedPerson
    });
  } catch (error) {
    console.error('Error updating person:', error);
    
    // Check if it's a validation error
    if (error instanceof Error && (error.message.includes('Validation failed') || error.message.includes('Invalid ID'))) {
      return NextResponse.json(
        { 
          error: error.message.includes('Invalid ID') ? 'Invalid person ID' : 'Validation failed',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    // Check if person not found
    if (error instanceof Error && error.message.includes('Person not found')) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update person',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    // Delete the person
    await deletePerson(params.id);
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error deleting person:', error);
    
    // Check if it's a validation error (invalid ID format)
    if (error instanceof Error && error.message.includes('Invalid ID')) {
      return NextResponse.json(
        { 
          error: 'Invalid person ID',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    // Check if person not found
    if (error instanceof Error && error.message.includes('Person not found')) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete person',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
