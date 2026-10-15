import { UpdateProfileDto } from '../../dto/users/update-profile.dto';
import { VerifyIdDto } from '../../dto/users/verify-id.dto';

export interface IUserService {
  /** Cache sync after auth login/register (in-memory fallback store). */
  syncUser(userData: { phone?: unknown }): void;
  getProfile(userId: string): Promise<any>;
  updateProfile(userId: string, data: UpdateProfileDto): Promise<any>;
  requestIdVerification(userId: string, data: VerifyIdDto): Promise<any>;
  getVerificationStatus(userId: string): Promise<any[]>;
  updateTrustLevel(userId: string, newLevel: string, reason: string): Promise<any>;
  addGuarantor(userId: string, guarantorPhone: string, relationship: string): Promise<any>;
  getGuarantors(userId: string): Promise<any[]>;
}
