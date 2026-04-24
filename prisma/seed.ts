import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.visitorRegistration.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.serviceDepartment.deleteMany();
  await prisma.leader.deleteMany();
  await prisma.session.deleteMany();
  await prisma.citizen.deleteMany();
  await prisma.location.deleteMany();

  console.log('Cleared existing data');

  // Seed Provinces
  const kigaliCity = await prisma.location.create({
    data: {
      name: 'Kigali City',
      nameKinyarwanda: 'Umujyi wa Kigali',
      level: 1,
      latitude: -1.9536,
      longitude: 29.8739,
    },
  });

  const southernProvince = await prisma.location.create({
    data: {
      name: 'Southern Province',
      nameKinyarwanda: 'Intara y\'Amajyaruguru',
      level: 1,
      latitude: -2.5833,
      longitude: 29.75,
    },
  });

  console.log('Created provinces');

  // Seed Districts
  const gasabo = await prisma.location.create({
    data: {
      name: 'Gasabo',
      level: 2,
      parentId: kigaliCity.id,
      latitude: -1.9536,
      longitude: 29.8739,
    },
  });

  const muhanga = await prisma.location.create({
    data: {
      name: 'Muhanga',
      level: 2,
      parentId: kigaliCity.id,
      latitude: -2.0,
      longitude: 30.0,
    },
  });

  console.log('Created districts');

  // Seed Sectors
  const ndera = await prisma.location.create({
    data: {
      name: 'Ndera',
      level: 3,
      parentId: gasabo.id,
      latitude: -1.95,
      longitude: 29.88,
    },
  });

  const kacyiru = await prisma.location.create({
    data: {
      name: 'Kacyiru',
      level: 3,
      parentId: gasabo.id,
      latitude: -1.96,
      longitude: 29.87,
    },
  });

  const mushishiro = await prisma.location.create({
    data: {
      name: 'Mushishiro',
      level: 3,
      parentId: muhanga.id,
      latitude: -2.0,
      longitude: 30.0,
    },
  });

  const shyogwe = await prisma.location.create({
    data: {
      name: 'Shyogwe',
      level: 3,
      parentId: muhanga.id,
      latitude: -2.01,
      longitude: 30.01,
    },
  });

  console.log('Created sectors');

  // Seed Cells
  const nderaCell1 = await prisma.location.create({
    data: {
      name: 'Ndera Cell 1',
      level: 4,
      parentId: ndera.id,
      latitude: -1.95,
      longitude: 29.88,
    },
  });

  const nderaCell2 = await prisma.location.create({
    data: {
      name: 'Ndera Cell 2',
      level: 4,
      parentId: ndera.id,
      latitude: -1.951,
      longitude: 29.881,
    },
  });

  const kacyiruCell1 = await prisma.location.create({
    data: {
      name: 'Kacyiru Cell 1',
      level: 4,
      parentId: kacyiru.id,
      latitude: -1.96,
      longitude: 29.87,
    },
  });

  const kacyiruCell2 = await prisma.location.create({
    data: {
      name: 'Kacyiru Cell 2',
      level: 4,
      parentId: kacyiru.id,
      latitude: -1.961,
      longitude: 29.871,
    },
  });

  const mushishiroCell1 = await prisma.location.create({
    data: {
      name: 'Mushishiro Cell 1',
      level: 4,
      parentId: mushishiro.id,
      latitude: -2.0,
      longitude: 30.0,
    },
  });

  const mushishiroCell2 = await prisma.location.create({
    data: {
      name: 'Mushishiro Cell 2',
      level: 4,
      parentId: mushishiro.id,
      latitude: -2.001,
      longitude: 30.001,
    },
  });

  const shyogweCell1 = await prisma.location.create({
    data: {
      name: 'Shyogwe Cell 1',
      level: 4,
      parentId: shyogwe.id,
      latitude: -2.01,
      longitude: 30.01,
    },
  });

  const shyogweCell2 = await prisma.location.create({
    data: {
      name: 'Shyogwe Cell 2',
      level: 4,
      parentId: shyogwe.id,
      latitude: -2.011,
      longitude: 30.011,
    },
  });

  console.log('Created cells');

  // Seed Villages
  const villages = [];
  const cellsData = [
    { cell: nderaCell1, name: 'Ndera Village 1' },
    { cell: nderaCell1, name: 'Ndera Village 2' },
    { cell: nderaCell2, name: 'Ndera Village 3' },
    { cell: nderaCell2, name: 'Ndera Village 4' },
    { cell: kacyiruCell1, name: 'Kacyiru Village 1' },
    { cell: kacyiruCell1, name: 'Kacyiru Village 2' },
    { cell: kacyiruCell2, name: 'Kacyiru Village 3' },
    { cell: kacyiruCell2, name: 'Kacyiru Village 4' },
    { cell: mushishiroCell1, name: 'Mushishiro Village 1' },
    { cell: mushishiroCell1, name: 'Mushishiro Village 2' },
    { cell: mushishiroCell2, name: 'Mushishiro Village 3' },
    { cell: mushishiroCell2, name: 'Mushishiro Village 4' },
    { cell: shyogweCell1, name: 'Shyogwe Village 1' },
    { cell: shyogweCell1, name: 'Shyogwe Village 2' },
    { cell: shyogweCell2, name: 'Shyogwe Village 3' },
    { cell: shyogweCell2, name: 'Shyogwe Village 4' },
  ];

  for (const { cell, name } of cellsData) {
    const village = await prisma.location.create({
      data: {
        name,
        level: 5,
        parentId: cell.id,
        latitude: cell.latitude! + Math.random() * 0.01,
        longitude: cell.longitude! + Math.random() * 0.01,
      },
    });
    villages.push(village);
  }

  console.log('Created villages');

  // Seed Citizens
  const citizens = [];
  const citizenData = [
    { nationalId: '11234567890123456789', firstName: 'Jean', lastName: 'Ndayisaba' },
    { nationalId: '11234567890123456790', firstName: 'Marie', lastName: 'Uwimana' },
    { nationalId: '11234567890123456791', firstName: 'Pierre', lastName: 'Habimana' },
    { nationalId: '11234567890123456792', firstName: 'Francine', lastName: 'Mukamana' },
    { nationalId: '11234567890123456793', firstName: 'Joseph', lastName: 'Nkurunziza' },
    { nationalId: '11234567890123456794', firstName: 'Beatrice', lastName: 'Nyirahabimana' },
    { nationalId: '11234567890123456795', firstName: 'Emmanuel', lastName: 'Kamanzi' },
    { nationalId: '11234567890123456796', firstName: 'Therese', lastName: 'Mukamusoni' },
    { nationalId: '11234567890123456797', firstName: 'David', lastName: 'Niyigena' },
    { nationalId: '11234567890123456798', firstName: 'Sylvie', lastName: 'Mukandayire' },
    { nationalId: '11234567890123456799', firstName: 'Robert', lastName: 'Habiyaremye' },
    { nationalId: '11234567890123456800', firstName: 'Josephine', lastName: 'Nyirahabimana' },
    { nationalId: '11234567890123456801', firstName: 'Charles', lastName: 'Nkurunziza' },
    { nationalId: '11234567890123456802', firstName: 'Marguerite', lastName: 'Mukamana' },
    { nationalId: '11234567890123456803', firstName: 'Vincent', lastName: 'Habimana' },
    { nationalId: '11234567890123456804', firstName: 'Antoinette', lastName: 'Uwimana' },
    { nationalId: '11234567890123456805', firstName: 'Laurent', lastName: 'Ndayisaba' },
    { nationalId: '11234567890123456806', firstName: 'Cecile', lastName: 'Mukandayire' },
    { nationalId: '11234567890123456807', firstName: 'Benoit', lastName: 'Niyigena' },
    { nationalId: '11234567890123456808', firstName: 'Henriette', lastName: 'Mukamusoni' },
  ];

  for (let i = 0; i < citizenData.length; i++) {
    const citizen = await prisma.citizen.create({
      data: {
        ...citizenData[i],
        phoneNumber: `+250${Math.floor(Math.random() * 900000000) + 100000000}`,
        homeLocationId: villages[i % villages.length].id,
      },
    });
    citizens.push(citizen);
  }

  console.log('Created citizens');

  // Seed Leaders
  const leaders = [];
  for (let i = 0; i < 5; i++) {
    const leader = await prisma.leader.create({
      data: {
        citizenId: citizens[i].id,
        locationId: [gasabo.id, muhanga.id, ndera.id, kacyiru.id, mushishiro.id][i],
        title: ['District Mayor', 'District Mayor', 'Sector Coordinator', 'Sector Coordinator', 'Sector Coordinator'][i],
        phoneNumber: `+250${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `leader${i}@iwacu.rw`,
        officeAddress: `Office ${i}, Kigali`,
      },
    });
    leaders.push(leader);
  }

  console.log('Created leaders');

  // Seed Service Departments
  const departments = [];
  const departmentData = [
    { name: 'Rwanda National Police', category: 'security' },
    { name: 'Rwanda Energy Group', category: 'utilities' },
    { name: 'WASAC', category: 'utilities' },
    { name: 'Rwanda Revenue Authority', category: 'finance' },
    { name: 'RURA', category: 'utilities' },
    { name: 'Ministry of Local Government', category: 'general' },
    { name: 'Rwanda Biomedical Centre', category: 'health' },
    { name: 'Ministry of Health', category: 'health' },
  ];

  for (const dept of departmentData) {
    const department = await prisma.serviceDepartment.create({
      data: {
        ...dept,
        phoneNumber: `+250${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `${dept.name.toLowerCase().replace(/\s+/g, '.')}@gov.rw`,
      },
    });
    departments.push(department);
  }

  console.log('Created service departments');

  // Seed Announcements
  const announcements = [];
  const categories = ['general', 'meeting', 'infrastructure', 'health', 'security', 'umuganda', 'emergency'];
  for (let i = 0; i < 12; i++) {
    const announcement = await prisma.announcement.create({
      data: {
        leaderId: leaders[i % leaders.length].id,
        locationId: [gasabo.id, muhanga.id, ndera.id, kacyiru.id, mushishiro.id][i % 5],
        title: `Announcement ${i + 1}`,
        body: `This is announcement number ${i + 1} with important information for the community.`,
        category: categories[i % categories.length],
        isUrgent: i % 3 === 0,
      },
    });
    announcements.push(announcement);
  }

  console.log('Created announcements');

  // Seed Visitor Registrations
  for (let i = 0; i < 3; i++) {
    await prisma.visitorRegistration.create({
      data: {
        hostCitizenId: citizens[i].id,
        visitorName: `Visitor ${i + 1}`,
        visitorNationalId: `1${Math.floor(Math.random() * 10000000000000000000)}`,
        visitorPhone: `+250${Math.floor(Math.random() * 900000000) + 100000000}`,
        purposeOfVisit: 'Social visit',
        arrivalDate: new Date(),
        expectedDepartureDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        locationId: villages[i].id,
      },
    });
  }

  console.log('Created visitor registrations');

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
