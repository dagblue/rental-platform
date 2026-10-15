"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("@rental-platform/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const shared_1 = require("@rental-platform/shared");
class AuthService {
    constructor(jwtService, useDatabase) {
        this.jwtService = jwtService;
        this.users = new Map();
        this.verificationCodes = new Map();
        this.useDatabase = useDatabase ?? true;
    }
    async register(userData) {
        try {
            // PHONE IS REQUIRED - validate first
            if (!userData.phone) {
                console.error('Phone number is required');
                return { success: false };
            }
            // Normalize phone
            const phoneKey = typeof userData.phone === 'object'
                ? userData.phone.formatted || userData.phone.number
                : userData.phone;
            const normalizedPhone = (0, shared_1.normalizeEthiopianPhone)(phoneKey);
            // Validate phone format
            if (!normalizedPhone || !(0, shared_1.isValidEthiopianPhone)(normalizedPhone)) {
                console.error('Invalid Ethiopian phone number');
                return { success: false };
            }
            // Process email if provided
            let email;
            if (userData.email) {
                email = userData.email.toLowerCase();
            }
            if (this.useDatabase) {
                // Check for existing user
                const existingUser = await database_1.prisma.user.findFirst({
                    where: {
                        OR: [
                            { phone: normalizedPhone },
                            ...(email ? [{ email }] : []),
                        ],
                    },
                });
                if (existingUser) {
                    return { success: false };
                }
                // Create user - phone is guaranteed to be a string here
                const newUser = await database_1.prisma.user.create({
                    data: {
                        phone: normalizedPhone,
                        email: email || null,
                        firstName: userData.firstName || null,
                        lastName: userData.lastName || null,
                        passwordHash: userData.password, // Middleware will hash this
                        role: 'RENTER',
                    },
                });
                const tokens = {
                    access_token: this.jwtService.generateAccessToken({
                        userId: newUser.id,
                        phone: newUser.phone,
                        role: newUser.role
                    }),
                    refresh_token: this.jwtService.generateRefreshToken({
                        userId: newUser.id,
                        phone: newUser.phone,
                        role: newUser.role
                    })
                };
                return {
                    success: true,
                    user: {
                        id: newUser.id,
                        phone: userData.phone,
                        email: newUser.email,
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        role: newUser.role
                    },
                    tokens
                };
            }
            else {
                // MEMORY MODE (fallback)
                const phoneKey = normalizedPhone;
                if (this.users.has(phoneKey)) {
                    return { success: false };
                }
                const newUser = {
                    id: Date.now().toString(),
                    phone: userData.phone,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: 'RENTER',
                    createdAt: new Date()
                };
                this.users.set(phoneKey, {
                    ...newUser,
                    password: userData.password
                });
                const tokens = {
                    access_token: this.jwtService.generateAccessToken({
                        userId: newUser.id,
                        phone: userData.phone,
                        role: newUser.role
                    }),
                    refresh_token: this.jwtService.generateRefreshToken({
                        userId: newUser.id,
                        phone: userData.phone,
                        role: newUser.role
                    })
                };
                return {
                    success: true,
                    user: newUser,
                    tokens
                };
            }
        }
        catch (error) {
            console.error('Registration error:', error);
            return { success: false };
        }
    }
    async login(identifier, password, deviceId) {
        try {
            console.log('🔐 Login attempt with identifier:', identifier);
            if (this.useDatabase) {
                let user = null;
                // Determine if identifier is email or phone
                if ((0, shared_1.isEmail)(identifier)) {
                    console.log('📧 Login with email:', identifier.toLowerCase());
                    user = await database_1.prisma.user.findUnique({
                        where: { email: identifier.toLowerCase() }
                    });
                }
                else {
                    // Login with phone
                    if (!(0, shared_1.isValidEthiopianPhone)(identifier)) {
                        console.log('❌ Invalid Ethiopian phone format:', identifier);
                        return { success: false };
                    }
                    const normalizedPhone = (0, shared_1.normalizeEthiopianPhone)(identifier); // ← Now uses correct function
                    console.log('📱 Login with phone (normalized):', normalizedPhone);
                    user = await database_1.prisma.user.findUnique({
                        where: { phone: normalizedPhone }
                    });
                }
                if (!user) {
                    console.log('❌ User not found for:', identifier);
                    return { success: false };
                }
                console.log('✅ User found:', user.id, user.phone);
                const isValid = await bcrypt_1.default.compare(password, user.passwordHash ?? '');
                console.log('✅ Password valid:', isValid);
                if (!isValid) {
                    console.log('❌ Invalid password');
                    return { success: false };
                }
                const tokens = {
                    access_token: this.jwtService.generateAccessToken({
                        userId: user.id,
                        phone: user.phone,
                        role: user.role
                    }),
                    refresh_token: this.jwtService.generateRefreshToken({
                        userId: user.id,
                        phone: user.phone,
                        role: user.role
                    })
                };
                return {
                    success: true,
                    user: {
                        id: user.id,
                        phone: user.phone,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    },
                    tokens
                };
            }
            else {
                // MEMORY MODE (keep as is)
                let user = null;
                const normalizedInput = (0, shared_1.normalizeEthiopianPhone)(identifier);
                for (const [key, value] of this.users.entries()) {
                    const userPhone = value.phone;
                    if (typeof userPhone === 'object') {
                        if (userPhone.formatted === normalizedInput ||
                            userPhone.number === normalizedInput.replace('+251', '') ||
                            `+251${userPhone.number}` === normalizedInput) {
                            user = value;
                            break;
                        }
                    }
                    else if (userPhone === normalizedInput || userPhone === identifier) {
                        user = value;
                        break;
                    }
                }
                if (!user || user.password !== password) {
                    return { success: false };
                }
                const tokens = {
                    access_token: this.jwtService.generateAccessToken({
                        userId: user.id,
                        phone: user.phone,
                        role: user.role
                    }),
                    refresh_token: this.jwtService.generateRefreshToken({
                        userId: user.id,
                        phone: user.phone,
                        role: user.role
                    })
                };
                return {
                    success: true,
                    user: {
                        id: user.id,
                        phone: user.phone,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    },
                    tokens
                };
            }
        }
        catch (error) {
            console.error('Login error:', error);
            return { success: false };
        }
    }
    async validateUser(identifier, password) {
        if (this.useDatabase) {
            let user = null;
            if ((0, shared_1.isEmail)(identifier)) {
                user = await database_1.prisma.user.findUnique({
                    where: { email: identifier.toLowerCase() }
                });
            }
            else {
                const normalizedPhone = (0, shared_1.normalizeEthiopianPhone)(identifier);
                user = await database_1.prisma.user.findUnique({
                    where: { phone: normalizedPhone }
                });
            }
            if (user) {
                console.log('🔐 Comparing password with hash:', user.passwordHash);
                const isValid = await bcrypt_1.default.compare(password, user.passwordHash ?? '');
                console.log('🔐 bcrypt.compare result:', isValid);
                if (isValid) {
                    return {
                        id: user.id,
                        phone: user.phone,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    };
                }
            }
        }
        else {
            for (const [key, user] of this.users.entries()) {
                const userPhone = typeof user.phone === 'object' ? user.phone.formatted : user.phone;
                if ((userPhone === identifier || user.email === identifier) && user.password === password) {
                    return {
                        id: user.id,
                        phone: user.phone,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    };
                }
            }
        }
        return null;
    }
    async verifyPhone(phone, code) {
        const storedCode = this.verificationCodes.get(phone);
        if (storedCode && storedCode === code) {
            this.verificationCodes.delete(phone);
            if (this.useDatabase) {
                await database_1.prisma.user.update({
                    where: { phone },
                    data: { phoneVerified: true }
                }).catch(err => console.error('Error updating verification status:', err));
            }
            return true;
        }
        return false;
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verifyRefreshToken(refreshToken);
            if (!payload) {
                return null;
            }
            const newAccessToken = this.jwtService.generateAccessToken({
                userId: payload.userId,
                phone: payload.phone,
                role: payload.role
            });
            return { access_token: newAccessToken };
        }
        catch (error) {
            return null;
        }
    }
}
exports.AuthService = AuthService;
