import { NextResponse } from "next/server";

import {
  addParentChildRelationship,
  getFamilyMembers,
  removeParentChildRelationship,
} from '@/lib/people';

export async function POST(req: Request) {
  try {
    const { action, childId, parentId, relationshipType } = await req.json();
    
    if (action === 'add') {
      await addParentChildRelationship(childId, parentId, relationshipType);
      return NextResponse.json({ status: 'ok', message: 'Relationship added successfully' });
    } else if (action === 'remove') {
      await removeParentChildRelationship(childId, parentId);
      return NextResponse.json({ status: 'ok', message: 'Relationship removed successfully' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "add" or "remove"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/relationships:', error);
    return NextResponse.json(
      { 
        error: 'Failed to manage relationship',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get('personId');
    
    if (!personId) {
      return NextResponse.json(
        { error: 'personId parameter is required' },
        { status: 400 }
      );
    }
    
    const familyMembers = await getFamilyMembers(personId);
    return NextResponse.json(familyMembers);
  } catch (error) {
    console.error('Error in GET /api/relationships:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch family members',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}