import { prisma } from '../src/index';

const PASSWORD = 'Test@123';

// Ethiopian data generators
const FIRST_NAMES = [
  'Abel', 'Dawit', 'Biruk', 'Nahom', 'Samuel', 'Yonas', 'Meron', 'Saron', 'Hana', 'Liya',
  'Meklit', 'Bethel', 'Rediet', 'Eden', 'Selam', 'Tigist', 'Azeb', 'Worknesh', 'Almaz', 'Tsehay'
];

const LAST_NAMES = [
  'Tesfaye', 'Bekele', 'Abebe', 'Kebede', 'Mekonnen', 'Tadesse', 'Hailu', 'Gebre', 'Alemayehu',
  'Desta', 'Berhanu', 'Fikre', 'Girma', 'Haile', 'Kassa', 'Mulugeta', 'Negash', 'Tekle', 'Wondimu'
];

const REGIONS = [
  'Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'Sidama', 'SNNPR', 'Harari', 'Gambella'
];

const CITIES = {
  'Addis Ababa': ['Bole', 'Kirkos', 'Yeka', 'Gulele', 'Lideta', 'Arada', 'Kolfe', 'Nifas Silk'],
  'Oromia': ['Adama', 'Bishoftu', 'Jimma', 'Shashamane', 'Ambo', 'Nekemte'],
  'Amhara': ['Bahir Dar', 'Gondar', 'Dessie', 'Lalibela', 'Debre Markos'],
  'Tigray': ['Mekelle', 'Adigrat', 'Axum', 'Shire'],
};

const CATEGORIES = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'furniture', name: 'Furniture' },
  { id: 'tools', name: 'Tools' },
  { id: 'cameras', name: 'Cameras' },
  { id: 'clothing', name: 'Clothing' },
];

const LISTING_TITLES: Record<string, string[]> = {
  electronics: [
    'Sony A7III Mirrorless Camera', 'MacBook Pro 16"', 'iPhone 15 Pro', 'DJI Mavic 3 Drone',
    'iPad Pro 12.9"', 'Samsung 65" 4K TV', 'Bose QuietComfort Headphones', 'Canon EOS R5'
  ],
  vehicles: [
    'Toyota Hilux 2023', 'Yamaha Motorcycle', 'Honda CBR 600RR', 'Suzuki Swift 2022',
    'Hyundai Tucson 4WD', 'Electric Scooter', 'Toyota Corolla 2023', 'Scooter for Commute'
  ],
  furniture: [
    'Modern Leather Sofa', 'Dining Table Set 6-Seater', 'Queen Size Bed Frame', 'Office Desk Executive',
    'Bookshelf Wall Unit', 'Wardrobe 8-Door', 'Conference Table', 'Outdoor Patio Set'
  ],
  tools: [
    'Bosch Power Drill Set', 'DeWalt Circular Saw', 'Industrial Generator 5kVA', 'Makita Impact Driver',
    'Electric Welding Machine', 'Air Compressor', 'Heavy Duty Jackhammer', 'Professional Tool Kit'
  ],
  cameras: [
    'Canon EOS R5 Professional', 'Sony FX6 Cinema Camera', 'Blackmagic Pocket 6K', 'GoPro Hero 12',
    'DJI Ronin Gimbal', 'Professional Lighting Kit', 'Green Screen Setup', 'Audio Recording Kit'
  ],
  clothing: [
    'Traditional Ethiopian Dress', "Men's Wedding Suit", "Women's Evening Gown", 'Winter Jacket',
    'Designer Handbag', 'Shoes Collection', 'Accessories Set', 'Cultural Costume'
  ],
};

const REVIEW_COMMENTS = {
  5: [
    'Excellent experience! Item was in perfect condition. Highly recommended!',
    'Amazing! Owner was very professional and responsive.',
    'Perfect rental, would definitely use again.',
    'Top quality service. Everything was smooth and easy.',
    'Fantastic! Item exceeded expectations.'
  ],
  4: [
    'Very good experience. Minor issues but overall great.',
    'Good rental, item worked as described.',
    'Satisfied with the service. Would recommend.',
    'Nice experience, owner was helpful.',
    'Good value for money.'
  ],
  3: [
    'Average experience. Item was okay.',
    'Decent rental, nothing special.',
    'Met expectations but didn\'t exceed them.',
    'Acceptable condition and service.',
    'Could be better but overall fine.'
  ],
  2: [
    'Below expectations. Had some issues.',
    'Not great. Item had some problems.',
    'Disappointed with the condition.',
    'Communication could be better.',
    'Would not rent again.'
  ],
  1: [
    'Very poor experience. Would not recommend.',
    'Terrible! Item was not as described.',
    'Waste of money. Avoid this owner.',
    'Many issues with the rental.',
    'Completely dissatisfied.'
  ],
};

const MESSAGES = [
  'Hi, is this still available?',
  'Yes, it is! When would you like to book?',
  'Can I pick it up tomorrow?',
  'What time works for you?',
  'Is the price negotiable?',
  'Does it come with accessories?',
  'How long have you had it?',
  'Thanks for the quick response!',
  "I'll take it. How do we proceed?",
  'Great, sending booking request now.',
  'When can you deliver?',
  'Is there a deposit required?',
  'Perfect, see you tomorrow!',
  'Thank you, received.',
  'Any discount for longer rental?'
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const prefixes = ['911', '912', '913', '914', '915', '916', '917', '918', '919'];
  return `+251${randomItem(prefixes)}${Math.floor(100000 + Math.random() * 900000)}`;
}

function randomEmail(firstName: string, lastName: string, index: number): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'ethiopia.et'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${randomItem(domains)}`;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomLocation() {
  const region = randomItem(REGIONS);
  const cities = CITIES[region as keyof typeof CITIES] || ['Addis Ababa'];
  const city = randomItem(cities);
  const subcity = typeof city === 'string' && city === 'Addis Ababa' ? randomItem(CITIES['Addis Ababa']) : null;
  
  return {
    region,
    city,
    subcity: subcity,
    woreda: `${Math.floor(Math.random() * 15) + 1}`,
    kebele: `${Math.floor(Math.random() * 25) + 1}`,
    latitude: 8.98 + (Math.random() * 0.2),
    longitude: 38.75 + (Math.random() * 0.2),
    formattedAddress: `${city}, ${region}, Ethiopia`,
    isExactLocation: Math.random() > 0.3
  };
}

async function seedCategories() {
  console.log('Creating categories...');
  
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.id,
      }
    });
  }
  
  console.log(`  Created ${CATEGORIES.length} categories`);
}

async function seedUsers() {
  console.log('Creating users...');
  
  const users = [];

  // Admin user - email doesn't need to be unique for admin
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      phone: '+251911111111',
      email: 'admin@rentalplatform.com',
      passwordHash: PASSWORD,
      role: 'ADMIN',
      trustLevel: 'TRUSTED',
      verificationStatus: 'COMPLETE',
      phoneVerified: true,
      emailVerified: true,
      idVerified: true,
      agreedToTerms: true,
      agreedToTermsAt: new Date(),
    }
  });
  users.push(admin);

  // Owners (8 users) - add index to make email unique
  for (let i = 0; i < 8; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone: randomPhone(),
        email: randomEmail(firstName, lastName, i + 100),
        passwordHash: PASSWORD,
        role: 'OWNER',
        trustLevel: randomItem(['BASIC', 'VERIFIED', 'TRUSTED']),
        verificationStatus: 'COMPLETE',
        phoneVerified: true,
        emailVerified: true,
        idVerified: Math.random() > 0.3,
        agreedToTerms: true,
        agreedToTermsAt: new Date(),
      }
    });
    users.push(user);
  }

  // Renters (12 users) - add index to make email unique
  for (let i = 0; i < 12; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone: randomPhone(),
        email: randomEmail(firstName, lastName, i + 200),
        passwordHash: PASSWORD,
        role: 'RENTER',
        trustLevel: randomItem(['NEW', 'BASIC', 'VERIFIED']),
        verificationStatus: 'COMPLETE',
        phoneVerified: true,
        emailVerified: Math.random() > 0.3,
        idVerified: Math.random() > 0.5,
        agreedToTerms: true,
        agreedToTermsAt: new Date(),
      }
    });
    users.push(user);
  }

  console.log(`  Created ${users.length} users`);
  return users;
}

async function seedProfiles(users: any[]) {
  console.log('Creating user profiles...');
  
  let created = 0;
  for (const user of users) {
    if (user.role !== 'ADMIN') {
      const location = randomLocation();
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          bio: `${user.role === 'OWNER' ? 'I love sharing my items' : 'I love renting quality items'} on this platform.`,
          languages: ['Amharic', 'English'],
          occupation: user.role === 'OWNER' ? 'Business Owner' : 'Professional',
          education: 'University Graduate',
          skills: ['Communication', 'Reliable', 'Trustworthy'],
          region: location.region,
          city: location.city,
          subcity: location.subcity,
          woreda: location.woreda,
          kebele: location.kebele,
          houseNumber: `${Math.floor(Math.random() * 999) + 1}`,
          formattedAddress: location.formattedAddress,
          secondaryPhone: Math.random() > 0.5 ? randomPhone() : null,
          preferences: {},
        }
      });
      created++;
    }
  }
  console.log(`  Created/Updated ${created} profiles`);
}

async function seedListings(users: any[]) {
  console.log('Creating listings...');
  
  const owners = users.filter(u => u.role === 'OWNER');
  const listings = [];
  const listingCount = 50;

  for (let i = 0; i < listingCount; i++) {
    const owner = randomItem(owners);
    const category = randomItem(CATEGORIES);
    const title = randomItem(LISTING_TITLES[category.id] || LISTING_TITLES.electronics);
    const pricePerDay = Math.floor(Math.random() * 2000) + 200;
    const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
    const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING_REVIEW'];
    const location = randomLocation();
    
    const listing = await prisma.listing.create({
      data: {
        ownerId: owner.id,
        categoryId: category.id,
        title,
        slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`,
        description: `Professional ${title} available for rent. Perfect for ${category.name.toLowerCase()} enthusiasts. Well maintained and ready to use.`,
        shortDescription: `Rent ${title} - ${randomItem(conditions)} condition`,
        pricePerDay,
        pricePerWeek: pricePerDay * 6,
        pricePerMonth: pricePerDay * 20,
        currency: 'ETB',
        minimumRentalDays: Math.floor(Math.random() * 3) + 1,
        maximumRentalDays: 365,
        discountWeekly: 10,
        discountMonthly: 15,
        locationRegion: location.region,
        locationCity: location.city,
        locationSubcity: location.subcity,
        locationWoreda: location.woreda,
        locationKebele: location.kebele,
        locationFormatted: location.formattedAddress,
        isExactLocation: location.isExactLocation,
        condition: randomItem(conditions) as any,
        yearOfManufacture: 2020 + Math.floor(Math.random() * 4),
        brand: title.split(' ')[0],
        model: title.split(' ')[1] || 'Pro',
        specifications: {},
        availabilityType: 'CALENDAR',
        advanceNoticeHours: 24,
        sameDayBooking: Math.random() > 0.5,
        instantBooking: Math.random() > 0.7,
        minTrustLevel: randomItem(['NEW', 'BASIC', 'VERIFIED']),
        requiresGuarantors: Math.random() > 0.8 ? 1 : 0,
        requiresIdVerification: Math.random() > 0.6,
        requiresDeposit: Math.random() > 0.5,
        deliveryAvailable: Math.random() > 0.5,
        deliveryFee: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 50 : null,
        pickupRequired: true,
        rules: ['No smoking', 'Return on time', 'Handle with care'],
        status: randomItem(statuses) as any,
        isFeatured: Math.random() > 0.8,
        views: Math.floor(Math.random() * 500),
        saves: Math.floor(Math.random() * 100),
        publishedAt: new Date(),
      }
    });
    
    listings.push(listing);
    
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        url: `https://picsum.photos/seed/${listing.id}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${listing.id}/200/150`,
        isPrimary: true,
        order: 0,
        verified: true,
      }
    });
  }
  
  console.log(`  Created ${listings.length} listings`);
  return listings;
}

async function seedBookings(users: any[], listings: any[]) {
  console.log('Creating bookings...');
  
  const renters = users.filter(u => u.role === 'RENTER');
  const bookings = [];
  const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED'];
  
  for (let i = 0; i < 60; i++) {
    const renter = randomItem(renters);
    const listing = randomItem(listings);
    const status = randomItem(statuses);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) - 15);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * listing.pricePerDay;
    
    const booking = await prisma.booking.create({
      data: {
        listingId: listing.id,
        renterId: renter.id,
        ownerId: listing.ownerId,
        bookingCode: `BK-${Date.now()}-${i}`,
        startDate,
        endDate,
        totalDays,
        dailyRate: listing.pricePerDay,
        totalAmount,
        depositAmount: totalAmount * 0.2,
        platformFee: totalAmount * 0.05,
        status: status as any,
        renterTrustLevel: renter.trustLevel,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    });
    bookings.push(booking);
  }
  
  console.log(`  Created ${bookings.length} bookings`);
  return bookings;
}

async function seedReviews(users: any[], listings: any[], bookings: any[]) {
  console.log('Creating reviews...');
  
  let created = 0;
  
  for (let i = 0; i < 40 && i < bookings.length; i++) {
    const booking = bookings[i];
    const rating = Math.floor(Math.random() * 5) + 1;
    const ratingGroup = rating as keyof typeof REVIEW_COMMENTS;
    
    await prisma.review.create({
      data: {
        bookingId: booking.id,
        reviewerId: booking.renterId,
        revieweeId: booking.ownerId,
        listingId: booking.listingId,
        role: 'RENTER',
        rating,
        comment: randomItem(REVIEW_COMMENTS[ratingGroup]),
        isPublic: true,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    });
    created++;
  }
  
  console.log(`  Created ${created} reviews`);
}

async function seedConversationsAndMessages(users: any[]) {
  console.log('Creating conversations and messages...');
  
  let conversationsCreated = 0;
  let messagesCreated = 0;
  
  for (let i = 0; i < 20; i++) {
    const user1 = randomItem(users);
    let user2 = randomItem(users);
    while (user2.id === user1.id) {
      user2 = randomItem(users);
    }
    
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: user1.id }, { id: user2.id }]
        }
      }
    });
    conversationsCreated++;
    
    const messageCount = Math.floor(Math.random() * 8) + 3;
    let lastMessageId = null;
    
    for (let j = 0; j < messageCount; j++) {
      const sender = j % 2 === 0 ? user1 : user2;
      const receiver = j % 2 === 0 ? user2 : user1;
      const isRead = j < messageCount - (Math.random() > 0.5 ? 1 : 2);
      
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: sender.id,
          receiverId: receiver.id,
          content: randomItem(MESSAGES),
          isRead,
          readAt: isRead ? new Date() : null,
          createdAt: new Date(Date.now() - (messageCount - j) * 3600000)
        }
      });
      messagesCreated++;
      lastMessageId = message.id;
    }
    
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageId, updatedAt: new Date() }
    });
  }
  
  console.log(`  Created ${conversationsCreated} conversations with ${messagesCreated} messages`);
}

async function seedNotifications(users: any[]) {
  console.log('Creating notifications...');
  
  const types = ['BOOKING_REQUEST', 'BOOKING_CONFIRMED', 'PAYMENT_RECEIVED', 'NEW_REVIEW', 'MESSAGE_RECEIVED'];
  let created = 0;
  
  for (const user of users) {
    const notificationCount = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < notificationCount; i++) {
      const type = randomItem(types);
      let title = '';
      let message = '';
      
      switch (type) {
        case 'BOOKING_REQUEST':
          title = 'New Booking Request';
          message = 'Someone wants to book your item';
          break;
        case 'BOOKING_CONFIRMED':
          title = 'Booking Confirmed';
          message = 'Your booking has been confirmed';
          break;
        case 'PAYMENT_RECEIVED':
          title = 'Payment Received';
          message = 'Payment received successfully';
          break;
        case 'NEW_REVIEW':
          title = 'New Review';
          message = 'Someone left you a review';
          break;
        case 'MESSAGE_RECEIVED':
          title = 'New Message';
          message = 'You have a new message';
          break;
      }
      
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: type as any,
          title,
          message,
          data: {},
          channels: ['IN_APP'],
          isRead: Math.random() > 0.4,
          createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        }
      });
      created++;
    }
  }
  
  console.log(`  Created ${created} notifications`);
}

async function main() {
  const startTime = Date.now();
  
  try {
    console.log('Starting database seeding...');
    console.log('=================================');
    
    await seedCategories();
    const users = await seedUsers();
    await seedProfiles(users);
    const listings = await seedListings(users);
    const bookings = await seedBookings(users, listings);
    await seedReviews(users, listings, bookings);
    await seedConversationsAndMessages(users);
    await seedNotifications(users);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('=================================');
    console.log(`Seed completed in ${duration}s`);
    console.log('\nSummary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Listings: ${listings.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log(`   Reviews: 40`);
    console.log(`   Conversations: 20`);
    console.log(`   Notifications: ~80`);
    console.log('\nTest Credentials:');
    console.log(`   Password for all users: ${PASSWORD}`);
    console.log('   Admin user: +251911111111 / admin@rentalplatform.com');
    console.log('\n✅ All passwords will be automatically hashed by Prisma middleware!');
    
  } catch (err) {
    console.error('\nSeeding failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
