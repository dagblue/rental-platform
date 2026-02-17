import { AuthService } from './services/auth.service';
import { EthiopianAuthService } from './services/ethiopian-auth.service';
import { PhoneVerificationService } from './services/phone-verification.service';
import { JwtService } from './services/jwt.service';

async function testAuthPackage() {
  console.log('Ì∑™ Testing Auth Package...\n');

  // Initialize services
  const jwtService = new JwtService();
  const phoneVerificationService = new PhoneVerificationService();
  const ethiopianAuthService = new EthiopianAuthService();
  const authService = new AuthService(jwtService);

  console.log('‚úÖ Services initialized\n');

  // Test 1: Register a user
  console.log('Ì≥ù Testing registration...');
  const registerData = {
    phone: '+251911223344',
    firstName: 'John',
    lastName: 'Doe',
    password: 'Test@123'
  };
  
  const registerResult = await authService.register(registerData);
  console.log('   Registration:', registerResult.success);
  console.log('   User:', registerResult.user);
  console.log('   Tokens received:', !!registerResult.tokens);
  console.log();

  // Test 2: Login with the user
  console.log('Ì¥ê Testing login...');
  const loginResult = await authService.login(
    registerData.phone,
    registerData.password
  );
  
  console.log('   Login success:', loginResult.success);
  console.log('   User:', loginResult.user);
  console.log('   Tokens:', !!loginResult.tokens);
  console.log();

  // Test 3: Phone verification
  console.log('Ì≥± Testing phone verification...');
  const verificationCode = '123456'; // In real scenario, this would be sent via SMS
  const verifyResult = await authService.verifyPhone(registerData.phone, verificationCode);
  console.log('   Verification result:', verifyResult);
  console.log();

  // Test 4: Ethiopian phone validation
  console.log('Ì∑™Ì∑π Testing Ethiopian phone validation...');
  const validPhone = '+251911223344';
  const invalidPhone = '+1234567890';
  
  const isValidValid = await ethiopianAuthService.validateEthiopianPhone(validPhone);
  const isValidInvalid = await ethiopianAuthService.validateEthiopianPhone(invalidPhone);
  
  console.log('   Valid phone:', isValidValid);
  console.log('   Invalid phone:', isValidInvalid);
  console.log();

  // Test 5: JWT token verification
  console.log('Ìæ´ Testing JWT token...');
  if (loginResult.tokens) {
    const payload = jwtService.verifyAccessToken(loginResult.tokens.access_token);
    console.log('   Token valid:', !!payload);
    console.log('   Token payload:', payload);
  }
  console.log();

  console.log('‚úÖ All tests completed!');
}

// Run the tests
testAuthPackage().catch(console.error);
