import { Types } from 'mongoose';
import { UserDocument, UserModel } from '../models/user.model';
import { CreateUserInput, IUserRepository, UserWithPopulatedPreferences } from '../contracts/user.repository.interface';

export class UserRepository implements IUserRepository {
  
  findByEmail(email: string): Promise<UserDocument | null> { return UserModel.findOne({ email }); }
 
  findByPhone(phone: string): Promise<UserDocument | null> { return UserModel.findOne({ phone }); }
 
  findByIdentifierWithPassword(identifier: string): Promise<UserDocument | null> {
    const query = identifier.includes('@') ? { email: identifier } : { phone: identifier };
    return UserModel.findOne(query).select('+password');
  }
 
  findById(userId: string): Promise<UserDocument | null> { return UserModel.findById(userId); }
  async findByIdWithPreferences(userId: string): Promise<UserWithPopulatedPreferences | null> {
    const user = await UserModel.findById(userId).populate('preferences');
    return user as unknown as UserWithPopulatedPreferences | null;
  }
 
  findByIdWithRefreshToken(userId: string): Promise<UserDocument | null> { return UserModel.findById(userId).select('+refreshToken'); }
  
  findByIdWithPassword(userId: string): Promise<UserDocument | null> { return UserModel.findById(userId).select('+password'); }
 
  async deleteById(userId: string): Promise<void> {
    await UserModel.findByIdAndDelete(userId);
  }

  create(input: CreateUserInput): Promise<UserDocument> { return UserModel.create(input); }

  async verifyEmail(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          emailVerified: true,
        },
      },
      {
        runValidators: true,
      },
    );
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string | null): Promise<void> { await UserModel.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken }); }
 
  updateProfile(userId: string, updates: { firstName?: string; lastName?: string; email?: string; phone?: string; dateOfBirth?: Date }): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
  }
  
  async updatePassword(userId: string, hashedPassword: string): Promise<void> { await UserModel.findByIdAndUpdate(userId, { $set: { password: hashedPassword } }, { runValidators: true }); }
 
  async updatePreferences(userId: string, preferences: Types.ObjectId[]): Promise<void> { await UserModel.findByIdAndUpdate(userId, { $set: { preferences } }, { runValidators: true }); }
}
