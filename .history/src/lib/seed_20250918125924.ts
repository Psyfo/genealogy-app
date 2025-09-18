import dotenv from 'dotenv';
import neo4j, { Driver } from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';
import { Person, LifeEvent } from '@/types/person';

dotenv.config({ path: '.env.local' }); // load .env.local explicitly

function env(candidates: string[]): string {
  for (const name of candidates) {
    const v = process.env[name];
    if (v) return v;
  }
  throw new Error(`Missing required env var (tried: ${candidates.join(', ')})`);
}

const uri = env(['NEO4J_URI']);
const user = env(['NEO4J_USERNAME', 'NEO4J_USER']); // support both names
const password = env(['NEO4J_PASSWORD']);

const driver: Driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
  // Uncomment if you need to disable encryption locally:
  // encrypted: 'ENCRYPTION_OFF',
});

async function seed() {
  const start = Date.now();
  console.log('[seed] Connecting to Neo4j:', uri);
  await driver.getServerInfo();
  console.log('[seed] Connected in %dms', Date.now() - start);

  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    console.log('[seed] Clearing existing graph...');
    await session.run('MATCH (n) DETACH DELETE n');

    // Helper function to create a person with all required fields
    function createPersonData(
      firstName: string,
      lastName: string,
      birthDate: string,
      gender: 'male' | 'female' | 'other' | 'unknown',
      additionalData: Partial<Person> = {}
    ): Person {
      const id = uuidv4();
      const birthYear = new Date(birthDate).getFullYear();
      
      return {
        id,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        birthDate,
        birthYear,
        gender,
        lastUpdated: new Date().toISOString(),
        createdBy: 'seed-script',
        ...additionalData
      };
    }

    // Create comprehensive family tree data
    const people: Person[] = [
      // Grandparents Generation
      createPersonData('William', 'Smith', '1920-03-15', 'male', {
        birthPlace: 'London, England',
        deathDate: '1995-08-22',
        deathPlace: 'Manchester, England',
        occupation: 'Factory Worker',
        nationality: 'British',
        notes: 'Served in World War II'
      }),
      createPersonData('Margaret', 'Smith', '1923-07-08', 'female', {
        maidenName: 'Thompson',
        birthPlace: 'Birmingham, England',
        deathDate: '2001-12-03',
        deathPlace: 'Manchester, England',
        occupation: 'Nurse',
        nationality: 'British'
      }),
      createPersonData('Robert', 'Johnson', '1918-11-20', 'male', {
        birthPlace: 'Glasgow, Scotland',
        deathDate: '1988-04-10',
        deathPlace: 'Edinburgh, Scotland',
        occupation: 'Engineer',
        nationality: 'Scottish',
        militaryService: 'Royal Air Force, WWII'
      }),
      createPersonData('Elizabeth', 'Johnson', '1921-05-12', 'female', {
        maidenName: 'Brown',
        birthPlace: 'Edinburgh, Scotland',
        deathDate: '1992-09-18',
        deathPlace: 'Edinburgh, Scotland',
        occupation: 'Teacher',
        nationality: 'Scottish'
      }),

      // Parents Generation
      createPersonData('John', 'Smith', '1945-06-10', 'male', {
        birthPlace: 'Manchester, England',
        occupation: 'Mechanical Engineer',
        employer: 'British Aerospace',
        education: 'University of Manchester, Mechanical Engineering',
        nationality: 'British',
        currentAddress: '123 Oak Street, Manchester, UK',
        phoneNumber: '+44-161-555-0123',
        email: 'john.smith@email.com',
        bloodType: 'O+',
        notes: 'Retired engineer, enjoys gardening and woodworking'
      }),
      createPersonData('Mary', 'Smith', '1947-09-25', 'female', {
        maidenName: 'Johnson',
        birthPlace: 'Edinburgh, Scotland',
        occupation: 'Primary School Teacher',
        employer: 'Manchester City Council',
        education: 'University of Edinburgh, Education',
        nationality: 'Scottish',
        currentAddress: '123 Oak Street, Manchester, UK',
        phoneNumber: '+44-161-555-0124',
        email: 'mary.smith@email.com',
        bloodType: 'A+',
        notes: 'Retired teacher, active in local community groups'
      }),
      createPersonData('David', 'Williams', '1950-02-14', 'male', {
        birthPlace: 'Cardiff, Wales',
        occupation: 'Doctor',
        employer: 'NHS Manchester',
        education: 'University of Cambridge, Medicine',
        nationality: 'Welsh',
        currentAddress: '456 Pine Avenue, Manchester, UK',
        phoneNumber: '+44-161-555-0456',
        email: 'david.williams@nhs.uk',
        bloodType: 'B+',
        militaryService: 'Royal Army Medical Corps, 1970-1972',
        notes: 'Cardiologist, published several research papers'
      }),
      createPersonData('Patricia', 'Williams', '1952-08-30', 'female', {
        maidenName: 'Davis',
        birthPlace: 'Liverpool, England',
        occupation: 'Nurse',
        employer: 'NHS Manchester',
        education: 'University of Liverpool, Nursing',
        nationality: 'British',
        currentAddress: '456 Pine Avenue, Manchester, UK',
        phoneNumber: '+44-161-555-0457',
        email: 'patricia.williams@nhs.uk',
        bloodType: 'AB+',
        notes: 'Senior nurse, specialized in cardiac care'
      }),

      // Children Generation
      createPersonData('Robert', 'Smith', '1970-04-18', 'male', {
        birthPlace: 'Manchester, England',
        occupation: 'Software Engineer',
        employer: 'Tech Solutions Ltd',
        education: 'University of Manchester, Computer Science',
        nationality: 'British',
        currentAddress: '789 Elm Street, Manchester, UK',
        phoneNumber: '+44-161-555-0789',
        email: 'robert.smith@techsolutions.com',
        bloodType: 'O+',
        notes: 'Specializes in web development and database design'
      }),
      createPersonData('Linda', 'Johnson', '1972-12-05', 'female', {
        maidenName: 'Smith',
        birthPlace: 'Manchester, England',
        occupation: 'Marketing Manager',
        employer: 'Digital Marketing Co',
        education: 'University of Leeds, Marketing',
        nationality: 'British',
        currentAddress: '789 Elm Street, Manchester, UK',
        phoneNumber: '+44-161-555-0790',
        email: 'linda.johnson@digitalmarketing.com',
        bloodType: 'A-',
        notes: 'Expert in digital marketing and social media'
      }),
      createPersonData('Sarah', 'Williams', '1975-03-22', 'female', {
        birthPlace: 'Manchester, England',
        occupation: 'Lawyer',
        employer: 'Manchester Legal Associates',
        education: 'University of Oxford, Law',
        nationality: 'British',
        currentAddress: '321 Cedar Lane, Manchester, UK',
        phoneNumber: '+44-161-555-0321',
        email: 'sarah.williams@manchesterlegal.com',
        bloodType: 'B-',
        notes: 'Specializes in family law and estate planning'
      }),
      createPersonData('Michael', 'Williams', '1978-11-08', 'male', {
        birthPlace: 'Manchester, England',
        occupation: 'Architect',
        employer: 'Design Studio Manchester',
        education: 'University of Sheffield, Architecture',
        nationality: 'British',
        currentAddress: '654 Maple Drive, Manchester, UK',
        phoneNumber: '+44-161-555-0654',
        email: 'michael.williams@designstudio.com',
        bloodType: 'AB-',
        notes: 'Award-winning architect, specializes in sustainable design'
      }),

      // Grandchildren Generation
      createPersonData('Emily', 'Smith', '1995-07-14', 'female', {
        birthPlace: 'Manchester, England',
        occupation: 'Student',
        education: 'University of Manchester, Psychology',
        nationality: 'British',
        currentAddress: '789 Elm Street, Manchester, UK',
        phoneNumber: '+44-161-555-0791',
        email: 'emily.smith@student.manchester.ac.uk',
        bloodType: 'A+',
        notes: 'Currently studying psychology, interested in clinical practice'
      }),
      createPersonData('James', 'Smith', '1998-01-30', 'male', {
        birthPlace: 'Manchester, England',
        occupation: 'Student',
        education: 'University of Manchester, Engineering',
        nationality: 'British',
        currentAddress: '789 Elm Street, Manchester, UK',
        phoneNumber: '+44-161-555-0792',
        email: 'james.smith@student.manchester.ac.uk',
        bloodType: 'O-',
        notes: 'Studying mechanical engineering, following in grandfather\'s footsteps'
      }),
      createPersonData('Olivia', 'Williams', '2000-09-12', 'female', {
        birthPlace: 'Manchester, England',
        occupation: 'Student',
        education: 'Manchester High School',
        nationality: 'British',
        currentAddress: '321 Cedar Lane, Manchester, UK',
        phoneNumber: '+44-161-555-0322',
        email: 'olivia.williams@student.email.com',
        bloodType: 'B+',
        notes: 'High school student, interested in art and design'
      }),
      createPersonData('Daniel', 'Williams', '2003-05-25', 'male', {
        birthPlace: 'Manchester, England',
        occupation: 'Student',
        education: 'Manchester High School',
        nationality: 'British',
        currentAddress: '321 Cedar Lane, Manchester, UK',
        phoneNumber: '+44-161-555-0323',
        email: 'daniel.williams@student.email.com',
        bloodType: 'AB+',
        notes: 'High school student, interested in computer science'
      }),
      createPersonData('Sophia', 'Williams', '2005-12-18', 'female', {
        birthPlace: 'Manchester, England',
        occupation: 'Student',
        education: 'Manchester Elementary School',
        nationality: 'British',
        currentAddress: '654 Maple Drive, Manchester, UK',
        phoneNumber: '+44-161-555-0655',
        email: 'sophia.williams@student.email.com',
        bloodType: 'A-',
        notes: 'Elementary school student, loves reading and music'
      }),
      createPersonData('Lucas', 'Williams', '2008-08-03', 'male', {
        birthPlace: 'Manchester, England',
        occupation: 'Student',
        education: 'Manchester Elementary School',
        nationality: 'British',
        currentAddress: '654 Maple Drive, Manchester, UK',
        phoneNumber: '+44-161-555-0656',
        email: 'lucas.williams@student.email.com',
        bloodType: 'O+',
        notes: 'Elementary school student, interested in sports and science'
      })
    ];

    console.log('[seed] Creating %d people...', people.length);
    await session.executeWrite(async (tx) => {
      for (const person of people) {
        await tx.run(
          `
          CREATE (:Person {
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
          })
          `,
          person as Record<string, unknown>
        );
      }
    });

    type Rel = { from: string; to: string; type: 'MARRIED' | 'PARENT' };
    const relationships: Rel[] = [
      { from: 'John Smith', to: 'Mary Smith', type: 'MARRIED' },
      { from: 'John Smith', to: 'Robert Smith', type: 'PARENT' },
      { from: 'Mary Smith', to: 'Robert Smith', type: 'PARENT' },
      { from: 'Robert Smith', to: 'Linda Johnson', type: 'MARRIED' },
      { from: 'Robert Smith', to: 'Michael Smith', type: 'PARENT' },
      { from: 'Linda Johnson', to: 'Michael Smith', type: 'PARENT' },
      { from: 'Robert Smith', to: 'Emily Smith', type: 'PARENT' },
      { from: 'Linda Johnson', to: 'Emily Smith', type: 'PARENT' },
      { from: 'Patricia Williams', to: 'David Williams', type: 'PARENT' },
      { from: 'David Williams', to: 'Olivia Williams', type: 'PARENT' },
      { from: 'David Williams', to: 'Daniel Williams', type: 'PARENT' },
      { from: 'Sophia Miller', to: 'Lucas Miller', type: 'PARENT' },
      { from: 'William Miller', to: 'Lucas Miller', type: 'PARENT' },
      { from: 'Sophia Miller', to: 'Mia Miller', type: 'PARENT' },
      { from: 'William Miller', to: 'Mia Miller', type: 'PARENT' },
      { from: 'Michael Smith', to: 'Olivia Williams', type: 'MARRIED' },
    ];

    console.log('[seed] Creating %d relationships...', relationships.length);
    await session.executeWrite(async (tx) => {
      for (const rel of relationships) {
        const cypher =
          rel.type === 'MARRIED'
            ? `
              MATCH (a:Person {name: $from}), (b:Person {name: $to})
              MERGE (a)-[:MARRIED_TO]->(b)
              MERGE (b)-[:MARRIED_TO]->(a)
            `
            : `
              MATCH (a:Person {name: $from}), (b:Person {name: $to})
              MERGE (a)-[:PARENT_OF]->(b)
            `;
        const res = await tx.run(cypher, { from: rel.from, to: rel.to });
        if (res.summary.counters.updates().relationshipsCreated === 0) {
          console.warn('[seed] Relationship not created (names missing?)', rel);
        }
      }
    });

    console.log('✅ Seed data created successfully.');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await session.close();
    await driver.close();
    console.log('[seed] Closed session & driver.');
  }
}

seed().catch((e) => {
  console.error('[seed] Unhandled error:', e);
  process.exit(1);
});
