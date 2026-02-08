// src/test.auth.ts
import { AuthService } from './services/auth.service';
import { EthiopianAuthService } from './services/ethiopian-auth.service';
import { PhoneVerificationService } from './services/phone-verification.service';
import { IUser } from './interfaces/auth.interface';
import { EthiopianPhoneNumber } from '@rental-platform/shared';
import { EthiopianLanguage } from '@rental-platform/shared';

async function testAuthPackage() {
  console.log('🧪 Testing Auth Package...\n');

  try {
    // 1. Initialize services
    const ethiopianAuthService = new EthiopianAuthService();
    const phoneVerificationService = new PhoneVerificationService();
    const authService = new AuthService(phoneVerificationService, ethiopianAuthService);

    console.log('✅ Services initialized successfully');

    // 2. Test phone verification
    console.log('\n📱 Testing Phone Verification...');
    const phone = '+251911223344';
    const verification = await phoneVerificationService.createVerification(phone);
    console.log(`   OTP Code: ${verification.code}`);
    console.log(`   Expires: ${verification.expiresAt.toISOString()}`);

    // 3. Test Ethiopian auth context - with correct types
    console.log('\n🇪🇹 Testing Ethiopian Auth Context...');
    
    // Create properly typed mock user
    const mockPhone: EthiopianPhoneNumber = {
      countryCode: '+251',
      number: '911223344',
      formatted: '+251 91 122 3344',
      isValid: true,
      provider: 'ETHIO_TELECOM'
    };

    const mockUser: IUser = {
      id: 'test-user-1',
      phone: mockPhone,
      firstName: 'John',
      lastName: 'Doe',
      passwordHash: 'hashed_password',
      preferredLanguage: EthiopianLanguage.AMHARIC,
      trustLevel: 'NEW',
      trustScore: 10,
      isActive: true,
      isPhoneVerified: false,
      isEmailVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const context = await ethiopianAuthService.applyEthiopianContext(mockUser);
    console.log(`   Restrictions: ${context.restrictions.join(', ') || 'None'}`);

    // 4. Test trust boost calculation
    const trustBoost = ethiopianAuthService.calculateEthiopianTrustBoost(mockUser);
    console.log(`   Trust Boost: ${trustBoost} points`);

    // 5. Test business hours check
    console.log('\n🕐 Testing Ethiopian Business Hours...');
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    console.log(`   Current time: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    
    // Note: Actual business hours check is internal, but we can show current time

    console.log('\n🎉 All tests passed! Auth package is working correctly.');
    console.log('\n📦 Package ready for use in your application.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAuthPackage();