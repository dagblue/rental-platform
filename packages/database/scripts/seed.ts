import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in correct order to avoid foreign key constraints)
  console.log('🧹 Clearing existing data...');
  
  const tables = [
    'SystemLog', 'Configuration', 'AgentVerification', 'AgentTransaction', 'Agent',
    'Notification', 'Message', 'DisputeMessage', 'Dispute', 'Review', 'Transaction',
    'Wallet', 'Payment', 'BookingGuarantor', 'Booking', 'AvailabilitySlot',
    'ListingDocument', 'ListingVideo', 'ListingImage', 'Listing', 'Category',
    'TrustLog', 'Guarantor', 'Verification', 'UserProfile', 'User'
  ];

  for (const table of tables) {
    try {
      await (prisma as any)[table].deleteMany();
      console.log(`✅ Cleared ${table}`);
    } catch (error) {
      console.log(`⚠️  Could not clear ${table}: ${error}`);
    }
  }

  // Create system configurations
  console.log('⚙️ Creating system configurations...');
  await prisma.configuration.createMany({
    data: [
      {
        key: 'platform.commission.rate',
        value: 0.10, // 10%
        description: 'Platform commission rate',
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'trust.deposit.multipliers',
        value: {
          NEW: 2.0,
          BASIC: 1.5,
          VERIFIED: 1.0,
          TRUSTED: 0.5,
        },
        description: 'Deposit multipliers based on trust level',
        isPublic: true,
        isEditable: true,
      },
      {
        key: 'rental.limits',
        value: {
          NEW: 5000,
          BASIC: 25000,
          VERIFIED: 100000,
          TRUSTED: 500000,
        },
        description: 'Maximum rental amounts per trust level (in ETB)',
        isPublic: true,
        isEditable: true,
      },
      {
        key: 'payment.providers',
        value: ['M_PESA', 'TELEBIRR', 'CBE_BIRR', 'HELLO_CASH', 'CASH'],
        description: 'Available payment providers',
        isPublic: true,
        isEditable: true,
      },
      {
        key: 'verification.required.for.listings',
        value: {
          VEHICLES: ['ID', 'PHYSICAL'],
          HOUSES: ['ID', 'ADDRESS', 'PHYSICAL'],
          MACHINERY: ['ID'],
          DEFAULT: ['ID'],
        },
        description: 'Verification requirements by category',
        isPublic: true,
        isEditable: true,
      },
    ],
  });

  // Create admin user
  console.log('👑 Creating admin user...');
  const adminPassword = await hash('Admin@2024!', 12);
  const admin = await prisma.user.create({
    data: {
      phone: '+251911223344',
      email: 'admin@rentalplatform.et',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      trustLevel: 'TRUSTED',
      trustScore: 100,
      verificationStatus: 'COMPLETE',
      phoneVerified: true,
      emailVerified: true,
      idVerified: true,
      addressVerified: true,
      physicalVerified: true,
      verificationDate: new Date(),
      agreedToTerms: true,
      agreedToTermsAt: new Date(),
      profile: {
        create: {
          bio: 'Platform Administrator',
          languages: ['am', 'en'],
          occupation: 'System Administrator',
          education: 'MSc in Computer Science',
          skills: ['Management', 'System Administration', 'Customer Support'],
          region: 'ADDIS_ABABA',
          city: 'ADDIS_ABABA',
          subcity: 'Bole',
          woreda: '08',
          kebele: '04',
          houseNumber: '123',
          formattedAddress: 'Bole, Addis Ababa, Ethiopia',
          latitude: 8.9806,
          longitude: 38.7578,
        },
      },
    },
  });

  // Create categories
  console.log('📂 Creating categories...');
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Houses',
        slug: 'houses',
        icon: '🏠',
        description: 'Residential properties for short-term rental',
        minDepositMultiplier: 2.0,
        maxDepositMultiplier: 3.0,
        requiresVerification: true,
        insuranceRequired: true,
      },
      {
        name: 'Vehicles',
        slug: 'vehicles',
        icon: '🚗',
        description: 'Cars, motorcycles, trucks, and other vehicles',
        minDepositMultiplier: 1.5,
        maxDepositMultiplier: 2.5,
        requiresVerification: true,
        insuranceRequired: true,
      },
      {
        name: 'Tools',
        slug: 'tools',
        icon: '🛠️',
        description: 'Hand tools, power tools, and gardening equipment',
        minDepositMultiplier: 1.0,
        maxDepositMultiplier: 2.0,
        requiresVerification: false,
        insuranceRequired: false,
      },
      {
        name: 'Event Equipment',
        slug: 'event-equipment',
        icon: '🎪',
        description: 'Chairs, tents, sound systems, and event supplies',
        minDepositMultiplier: 1.0,
        maxDepositMultiplier: 2.0,
        requiresVerification: false,
        insuranceRequired: true,
      },
      {
        name: 'Machinery',
        slug: 'machinery',
        icon: '🏗️',
        description: 'Construction, agricultural, and industrial equipment',
        minDepositMultiplier: 1.5,
        maxDepositMultiplier: 3.0,
        requiresVerification: true,
        insuranceRequired: true,
      },
      {
        name: 'Electronics',
        slug: 'electronics',
        icon: '💻',
        description: 'Cameras, laptops, audio equipment, and drones',
        minDepositMultiplier: 1.0,
        maxDepositMultiplier: 2.0,
        requiresVerification: false,
        insuranceRequired: false,
      },
      {
        name: 'Other',
        slug: 'other',
        icon: '📦',
        description: 'Miscellaneous items not fitting other categories',
        minDepositMultiplier: 1.0,
        maxDepositMultiplier: 2.0,
        requiresVerification: false,
        insuranceRequired: false,
      },
    ],
  });

  // Get created categories
  const categoriesList = await prisma.category.findMany();

  // Create 10 sample users (5 owners, 5 renters)
  console.log('👥 Creating sample users...');
  const users = [];
  const userTypes = ['OWNER', 'RENTER'];
  const trustLevels = ['NEW', 'BASIC', 'VERIFIED', 'TRUSTED'];
  const ethiopianNames = [
    { firstName: 'Abebe', lastName: 'Kebede' },
    { firstName: 'Meron', lastName: 'Tesfaye' },
    { firstName: 'Dawit', lastName: 'Hailu' },
    { firstName: 'Sofia', lastName: 'Girma' },
    { firstName: 'Yonas', lastName: 'Mulugeta' },
    { firstName: 'Helen', lastName: 'Assefa' },
    { firstName: 'Tewodros', lastName: 'Getachew' },
    { firstName: 'Rahel', lastName: 'Abate' },
    { firstName: 'Samuel', lastName: 'Mengistu' },
    { firstName: 'Eyerusalem', lastName: 'Berhanu' },
  ];

  for (let i = 0; i < 10; i++) {
    const name = ethiopianNames[i];
    const phone = `+2519${10000000 + i}`;
    const email = `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@example.com`;
    const role = i < 5 ? 'OWNER' : 'RENTER';
    const trustLevel = trustLevels[i % 4] as any;
    const trustScore = trustLevel === 'NEW' ? 20 : 
                       trustLevel === 'BASIC' ? 45 : 
                       trustLevel === 'VERIFIED' ? 70 : 90;

    const password = await hash('Password123!', 12);
    
    const user = await prisma.user.create({
      data: {
        phone,
        email,
        firstName: name.firstName,
        lastName: name.lastName,
        passwordHash: password,
        role,
        trustLevel,
        trustScore,
        verificationStatus: trustLevel === 'NEW' ? 'PENDING' : 'COMPLETE',
        phoneVerified: true,
        emailVerified: true,
        idVerified: trustLevel !== 'NEW',
        addressVerified: ['VERIFIED', 'TRUSTED'].includes(trustLevel),
        physicalVerified: trustLevel === 'TRUSTED',
        verificationDate: trustLevel === 'NEW' ? null : new Date(),
        agreedToTerms: true,
        agreedToTermsAt: new Date(),
        totalTransactions: i * 3,
        totalSpent: i * 5000,
        totalEarned: i < 5 ? i * 10000 : 0,
        averageRating: 4.0 + (i * 0.1),
        responseRate: 80 + (i * 2),
        profile: {
          create: {
            bio: faker.lorem.paragraph(),
            languages: ['am', 'en'],
            occupation: faker.person.jobTitle(),
            education: faker.person.jobArea(),
            skills: [faker.person.jobType(), faker.person.jobType()],
            region: 'ADDIS_ABABA',
            city: 'ADDIS_ABABA',
            subcity: ['Bole', 'Kirkos', 'Arada', 'Lideta', 'Nifas Silk'][i % 5],
            woreda: (i % 8 + 1).toString(),
            kebele: (i % 4 + 1).toString(),
            houseNumber: (i + 100).toString(),
            landmark: faker.location.streetAddress(),
            formattedAddress: faker.location.streetAddress(),
            latitude: 8.9806 + (i * 0.01),
            longitude: 38.7578 + (i * 0.01),
          },
        },
      },
    });
    users.push(user);
  }

  // Create sample listings for owners
  console.log('🏠 Creating sample listings...');
  const listings = [];
  const owners = users.filter(u => u.role === 'OWNER');
  
  for (const owner of owners) {
    // Each owner gets 2-3 listings
    const listingCount = 2 + Math.floor(Math.random() * 2);
    
    for (let j = 0; j < listingCount; j++) {
      const category = categoriesList[Math.floor(Math.random() * categoriesList.length)];
      const isVehicle = category.slug === 'vehicles';
      const isHouse = category.slug === 'houses';
      
      const listing = await prisma.listing.create({
        data: {
          ownerId: owner.id,
          categoryId: category.id,
          title: `${category.name}: ${faker.commerce.productName()}`,
          slug: `${category.slug}-${faker.string.alphanumeric(8).toLowerCase()}`,
          description: faker.lorem.paragraphs(3),
          shortDescription: faker.lorem.sentence(),
          pricePerDay: isVehicle ? 2000 : isHouse ? 5000 : 500 + Math.random() * 1000,
          pricePerWeek: isVehicle ? 12000 : isHouse ? 30000 : 3000 + Math.random() * 5000,
          pricePerMonth: isVehicle ? 40000 : isHouse ? 100000 : 10000 + Math.random() * 20000,
          currency: 'ETB',
          minimumRentalDays: 1,
          maximumRentalDays: isHouse ? 90 : 30,
          discountWeekly: 10,
          discountMonthly: 20,
          locationRegion: 'ADDIS_ABABA',
          locationCity: 'ADDIS_ABABA',
          locationSubcity: ['Bole', 'Kirkos', 'Arada'][Math.floor(Math.random() * 3)],
          locationWoreda: (Math.floor(Math.random() * 8) + 1).toString(),
          locationKebele: (Math.floor(Math.random() * 4) + 1).toString(),
          locationFormatted: faker.location.streetAddress(),
          isExactLocation: false,
          latitude: 8.9806 + (Math.random() * 0.05),
          longitude: 38.7578 + (Math.random() * 0.05),
          condition: ['NEW', 'LIKE_NEW', 'EXCELLENT', 'GOOD'][Math.floor(Math.random() * 4)] as any,
          yearOfManufacture: isVehicle ? 2018 + Math.floor(Math.random() * 6) : null,
          brand: isVehicle ? ['Toyota', 'Mitsubishi', 'Hyundai'][Math.floor(Math.random() * 3)] : null,
          model: isVehicle ? faker.vehicle.model() : null,
          specifications: isVehicle ? {
            transmission: ['Automatic', 'Manual'][Math.floor(Math.random() * 2)],
            fuelType: ['Petrol', 'Diesel'][Math.floor(Math.random() * 2)],
            seats: 5,
          } : {},
          availabilityType: 'CALENDAR',
          advanceNoticeHours: 24,
          sameDayBooking: false,
          instantBooking: true,
          minTrustLevel: ['NEW', 'BASIC', 'VERIFIED'][Math.floor(Math.random() * 3)] as any,
          requiresGuarantors: Math.floor(Math.random() * 3),
          requiresPhysicalVerification: isVehicle || isHouse,
          requiresIdVerification: true,
          requiresDeposit: true,
          insuranceIncluded: isVehicle || isHouse,
          insuranceDetails: isVehicle || isHouse ? {
            provider: 'Nyala Insurance',
            coverage: 'Third Party',
            validUntil: addDays(new Date(), 365),
          } : null,
          deliveryAvailable: !isVehicle && !isHouse,
          deliveryFee: !isVehicle && !isHouse ? 200 : null,
          deliveryRadius: !isVehicle && !isHouse ? 10 : null,
          pickupRequired: true,
          rules: [
            'No smoking',
            'Return in same condition',
            'Report any issues immediately',
          ],
          cancellationPolicy: {
            type: 'MODERATE',
            description: 'Full refund 7 days before, 50% refund 3 days before',
            refundPercentage: {
              days7: 100,
              days3: 50,
              days1: 25,
              day0: 0,
            },
            gracePeriodHours: 24,
          },
          damagePolicy: {
            depositRequired: true,
            depositAmount: 5000,
            wearAndTear: 'Normal wear and tear accepted',
            damageCategories: {
              minor: { description: 'Small scratches', maxCharge: 1000 },
              moderate: { description: 'Dents or broken parts', maxCharge: 5000 },
              major: { description: 'Major damage', maxCharge: 20000 },
            },
          },
          status: 'ACTIVE',
          isFeatured: j === 0, // First listing is featured
          isVerified: true,
          verificationDate: new Date(),
          views: Math.floor(Math.random() * 1000),
          saves: Math.floor(Math.random() * 100),
          bookingsCount: Math.floor(Math.random() * 20),
          averageRating: 4.0 + (Math.random() * 1.0),
          responseRate: 80 + (Math.random() * 20),
          responseTime: 30 + Math.floor(Math.random() * 60),
          publishedAt: subDays(new Date(), Math.floor(Math.random() * 30)),
        },
      });

      // Add images to listing
      await prisma.listingImage.createMany({
        data: [
          {
            listingId: listing.id,
            url: `https://picsum.photos/seed/${listing.id}-1/800/600`,
            thumbnailUrl: `https://picsum.photos/seed/${listing.id}-1/200/150`,
            isPrimary: true,
            caption: 'Main image',
            order: 0,
            verified: true,
          },
          {
            listingId: listing.id,
            url: `https://picsum.photos/seed/${listing.id}-2/800/600`,
            thumbnailUrl: `https://picsum.photos/seed/${listing.id}-2/200/150`,
            isPrimary: false,
            caption: 'Additional view',
            order: 1,
            verified: true,
          },
        ],
      });

      // Add availability slots for next 30 days
      const availabilitySlots = [];
      for (let k = 0; k < 30; k++) {
        const date = addDays(new Date(), k);
        // Make 20% of dates unavailable
        const available = Math.random() > 0.2;
        
        availabilitySlots.push({
          listingId: listing.id,
          date,
          available,
          price: available ? null : 0, // Custom price for unavailable dates
          notes: !available ? 'Already booked' : null,
        });
      }
      
      await prisma.availabilitySlot.createMany({
        data: availabilitySlots,
      });

      listings.push(listing);
    }
  }

  // Create sample bookings
  console.log('📅 Creating sample bookings...');
  const renters = users.filter(u => u.role === 'RENTER');
  
  for (let i = 0; i < 10; i++) {
    const renter = renters[i % renters.length];
    const listing = listings[Math.floor(Math.random() * listings.length)];
    const owner = users.find(u => u.id === listing.ownerId)!;
    
    const startDate = addDays(new Date(), Math.floor(Math.random() * 7) + 1);
    const endDate = addDays(startDate, Math.floor(Math.random() * 7) + 1);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const dailyRate = listing.pricePerDay;
    const totalAmount = dailyRate * totalDays;
    const depositMultiplier = renter.trustLevel === 'NEW' ? 2.0 : 
                              renter.trustLevel === 'BASIC' ? 1.5 : 
                              renter.trustLevel === 'VERIFIED' ? 1.0 : 0.5;
    const depositAmount = totalAmount * depositMultiplier;
    const platformFee = totalAmount * 0.10;
    const insuranceFee = listing.insuranceIncluded ? totalAmount * 0.05 : null;
    
    const booking = await prisma.booking.create({
      data: {
        listingId: listing.id,
        renterId: renter.id,
        ownerId: owner.id,
        bookingCode: `BOOK${String(i + 1).padStart(6, '0')}`,
        startDate,
        endDate,
        totalDays,
        dailyRate,
        totalAmount,
        depositAmount,
        platformFee,
        insuranceFee,
        deliveryFee: listing.deliveryFee,
        paymentStatus: ['PENDING', 'COMPLETED'][Math.floor(Math.random() * 2)] as any,
        paymentMethod: ['MOBILE_MONEY', 'CASH'][Math.floor(Math.random() * 2)] as any,
        paymentProvider: ['M_PESA', 'TELEBIRR'][Math.floor(Math.random() * 2)],
        paymentReference: `PAY${String(i + 1).padStart(8, '0')}`,
        status: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED'][Math.floor(Math.random() * 4)] as any,
        renterTrustLevel: renter.trustLevel,
        guarantorsRequired: listing.requiresGuarantors,
        guarantorsConfirmed: Math.floor(Math.random() * (listing.requiresGuarantors + 1)),
        physicalVerificationRequired: listing.requiresPhysicalVerification,
        physicalVerificationCompleted: Math.random() > 0.5,
        pickupLocation: listing.pickupLocation,
        deliveryLocation: faker.location.streetAddress(),
        handoverNotes: 'Please bring ID',
        createdAt: subDays(new Date(), Math.floor(Math.random() * 30)),
        confirmedAt: Math.random() > 0.3 ? subDays(new Date(), Math.floor(Math.random() * 20)) : null,
        cancelledAt: Math.random() > 0.8 ? subDays(new Date(), Math.floor(Math.random() * 10)) : null,
        startedAt: Math.random() > 0.5 ? subDays(new Date(), Math.floor(Math.random() * 5)) : null,
        completedAt: Math.random() > 0.7 ? subDays(new Date(), Math.floor(Math.random() * 2)) : null,
      },
    });

    // Create payment record for completed payments
    if (booking.paymentStatus === 'COMPLETED') {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId: renter.id,
          amount: booking.totalAmount + booking.depositAmount,
          fee: booking.platformFee,
          netAmount: booking.totalAmount + booking.depositAmount - booking.platformFee,
          method: booking.paymentMethod!,
          provider: booking.paymentProvider!,
          transactionId: `TX${String(i + 1).padStart(10, '0')}`,
          reference: booking.paymentReference!,
          isEscrow: true,
          escrowReleaseDate: booking.completedAt ? addDays(booking.completedAt, 2) : null,
          status: 'COMPLETED',
          completedAt: booking.confirmedAt,
        },
      });
    }

    // Create reviews for completed bookings
    if (booking.status === 'COMPLETED' && booking.completedAt) {
      // Renter reviews owner
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          reviewerId: renter.id,
          revieweeId: owner.id,
          role: 'RENTER',
          rating: 4 + Math.random(),
          communication: 4 + Math.random(),
          reliability: 4 + Math.random(),
          itemCondition: 4 + Math.random(),
          valueForMoney: 4 + Math.random(),
          title: 'Great experience',
          comment: faker.lorem.sentences(2),
          isPublic: true,
        },
      });

      // Owner reviews renter (50% chance)
      if (Math.random() > 0.5) {
        await prisma.review.create({
          data: {
            bookingId: booking.id,
            reviewerId: owner.id,
            revieweeId: renter.id,
            role: 'OWNER',
            rating: 4 + Math.random(),
            communication: 4 + Math.random(),
            reliability: 4 + Math.random(),
            title: 'Good renter',
            comment: faker.lorem.sentences(1),
            isPublic: true,
          },
        });
      }
    }
  }

  // Create wallets for users
  console.log('💰 Creating wallets...');
  for (const user of users) {
    await prisma.wallet.create({
      data: {
        userId: user.id,
        availableBalance: user.role === 'OWNER' ? user.totalEarned * 0.8 : 0,
        pendingBalance: user.role === 'OWNER' ? user.totalEarned * 0.2 : 0,
        escrowBalance: user.role === 'OWNER' ? user.totalEarned * 0.1 : 0,
        withdrawalThreshold: 1000,
        autoWithdrawal: false,
        preferredMethod: 'MOBILE_MONEY',
        preferredProvider: 'M_PESA',
        totalDeposits: user.totalSpent,
        totalWithdrawals: user.role === 'OWNER' ? user.totalEarned * 0.5 : 0,
        totalEarnings: user.totalEarned,
      },
    });
  }

  // Create sample agents
  console.log('🤝 Creating sample agents...');
  for (let i = 0; i < 3; i++) {
    const agentUser = await prisma.user.create({
      data: {
        phone: `+2519${20000000 + i}`,
        email: `agent${i + 1}@rentalplatform.et`,
        firstName: ['Samuel', 'Rahel', 'Daniel'][i],
        lastName: ['Agent', 'Representative', 'Officer'][i],
        passwordHash: await hash('Agent123!', 12),
        role: 'AGENT',
        trustLevel: 'TRUSTED',
        trustScore: 95,
        verificationStatus: 'COMPLETE',
        phoneVerified: true,
        emailVerified: true,
        idVerified: true,
        addressVerified: true,
        physicalVerified: true,
        verificationDate: new Date(),
        agreedToTerms: true,
        agreedToTermsAt: new Date(),
        profile: {
          create: {
            bio: `Certified Rental Platform Agent in ${['Bole', 'Kirkos', 'Arada'][i]}`,
            languages: ['am', 'en'],
            occupation: 'Platform Agent',
            education: 'Business Administration',
            skills: ['Verification', 'Customer Service', 'Conflict Resolution'],
            region: 'ADDIS_ABABA',
            city: 'ADDIS_ABABA',
            subcity: ['Bole', 'Kirkos', 'Arada'][i],
            woreda: (i + 1).toString(),
            kebele: '01',
            houseNumber: (i + 200).toString(),
            formattedAddress: `${['Bole', 'Kirkos', 'Arada'][i]}, Addis Ababa`,
            latitude: 8.9806 + (i * 0.02),
            longitude: 38.7578 + (i * 0.02),
          },
        },
      },
    });

    await prisma.agent.create({
      data: {
        userId: agentUser.id,
        agentCode: `AGT${String(i + 1).padStart(4, '0')}`,
        type: 'INDIVIDUAL',
        businessName: `${['Samuel', 'Rahel', 'Daniel'][i]} Agent Services`,
        operatingRegion: 'ADDIS_ABABA',
        operatingCity: 'ADDIS_ABABA',
        address: `${['Bole', 'Kirkos', 'Arada'][i]}, Addis Ababa`,
        latitude: 8.9806 + (i * 0.02),
        longitude: 38.7578 + (i * 0.02),
        services: ['VERIFICATION', 'CASH_COLLECTION', 'DISPUTE_MEDIATION'],
        serviceRadius: 10,
        status: 'ACTIVE',
        approvalDate: subDays(new Date(), 30 + i),
        commissionRate: 0.02,
        totalTransactions: 10 + i * 5,
        totalCommission: (10 + i * 5) * 100,
        averageRating: 4.5 + (i * 0.1),
        completionRate: 95,
      },
    });
  }

  // Create trust logs for users
  console.log('📊 Creating trust logs...');
  for (const user of users) {
    const logs = [];
    let currentScore = 0;
    let currentLevel = 'NEW';
    
    // Create 3-5 trust updates per user
    const logCount = 3 + Math.floor(Math.random() * 3);
    
    for (let j = 0; j < logCount; j++) {
      const newScore = Math.min(user.trustScore, currentScore + 10 + Math.random() * 30);
      const newLevel = newScore >= 80 ? 'TRUSTED' : 
                       newScore >= 60 ? 'VERIFIED' : 
                       newScore >= 30 ? 'BASIC' : 'NEW';
      
      logs.push({
        userId: user.id,
        oldLevel: currentLevel as any,
        newLevel: newLevel as any,
        oldScore: currentScore,
        newScore,
        scoreDelta: newScore - currentScore,
        reason: j === 0 ? 'INITIAL' : 
                j === 1 ? 'VERIFICATION_COMPLETE' : 
                j === 2 ? 'SUCCESSFUL_TRANSACTION' : 
                'POSITIVE_REVIEW',
        reasonDetails: j === 0 ? 'Initial trust score' : 
                       j === 1 ? 'Completed ID verification' : 
                       j === 2 ? 'Completed first rental' : 
                       'Received positive review',
        triggeredBy: j === 0 ? 'SYSTEM' : 'SYSTEM',
        metadata: {},
        createdAt: subDays(new Date(), (logCount - j) * 7),
      });
      
      currentScore = newScore;
      currentLevel = newLevel;
    }
    
    await prisma.trustLog.createMany({
      data: logs,
    });
  }

  // Create sample notifications
  console.log('🔔 Creating sample notifications...');
  const notifications = [];
  
  for (const user of users.slice(0, 5)) { // First 5 users get notifications
    for (let j = 0; j < 3; j++) {
      notifications.push({
        userId: user.id,
        type: ['BOOKING_REQUEST', 'PAYMENT_RECEIVED', 'TRUST_LEVEL_UP'][j],
        title: ['New Booking Request', 'Payment Received', 'Trust Level Increased'][j],
        message: [
          'You have a new booking request for your listing',
          'Your payment of ETB 5,000 has been received',
          'Congratulations! Your trust level has increased to VERIFIED',
        ][j],
        channels: ['IN_APP', 'EMAIL'],
        emailSent: true,
        smsSent: false,
        pushSent: false,
        inAppSent: true,
        isRead: j > 0,
        readAt: j > 0 ? subDays(new Date(), j) : null,
        createdAt: subDays(new Date(), j + 1),
      });
    }
  }
  
  await prisma.notification.createMany({
    data: notifications,
  });

  // Create sample messages
  console.log('💬 Creating sample messages...');
  const bookings = await prisma.booking.findMany({ take: 5 });
  
  for (const booking of bookings) {
    for (let j = 0; j < 3; j++) {
      const isFromRenter = j % 2 === 0;
      const senderId = isFromRenter ? booking.renterId : booking.ownerId;
      const receiverId = isFromRenter ? booking.ownerId : booking.renterId;
      
      await prisma.message.create({
        data: {
          senderId,
          receiverId,
          bookingId: booking.id,
          content: [
            'Hello, I would like to ask about the availability',
            'Yes, it is available for those dates',
            'Perfect, I will proceed with the booking',
          ][j],
          messageType: 'TEXT',
          isRead: j < 2,
          readAt: j < 2 ? new Date() : null,
          createdAt: subDays(new Date(), 3 - j),
        },
      });
    }
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📊 Seed Summary:');
  console.log(`✅ ${(await prisma.user.count())} users created`);
  console.log(`✅ ${(await prisma.category.count())} categories created`);
  console.log(`✅ ${(await prisma.listing.count())} listings created`);
  console.log(`✅ ${(await prisma.booking.count())} bookings created`);
  console.log(`✅ ${(await prisma.review.count())} reviews created`);
  console.log(`✅ ${(await prisma.agent.count())} agents created`);
  console.log(`✅ ${(await prisma.notification.count())} notifications created`);
  console.log(`✅ ${(await prisma.message.count())} messages created`);
  console.log(`\n👑 Admin Login:`);
  console.log(`📱 Phone: +251911223344`);
  console.log(`🔑 Password: Admin@2024!`);
  console.log(`📧 Email: admin@rentalplatform.et`);
  console.log(`\n🔗 Prisma Studio: http://localhost:5555`);
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });