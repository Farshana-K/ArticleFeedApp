import { Types } from 'mongoose';
import { BadRequestError, ConflictError, UnauthorizedError } from '../errors/app.error';
import { IUserRepository } from '../contracts/user.repository.interface';
import { ICategoryRepository } from '../contracts/category.repository.interface';
import { IPasswordService } from '../contracts/password.service.interface';
import { SafeUserDTO } from '../dto/auth.dto';
import { toSafeUserDTO } from '../mappers/user.mapper';
import { UpdatePasswordRequestDTO, UpdatePreferencesRequestDTO, UpdateProfileRequestDTO } from '../validators/user.validator';

export class UserService {
  constructor(private readonly users: IUserRepository, private readonly categories: ICategoryRepository, private readonly passwords: IPasswordService) {}
  async getProfile(userId: string): Promise<SafeUserDTO> { const user = await this.users.findByIdWithPreferences(userId); if (!user) throw new UnauthorizedError('User not found'); return toSafeUserDTO(user); }
  async updateProfile(userId: string, input: UpdateProfileRequestDTO): Promise<SafeUserDTO> {
    if (input.email) { const user = await this.users.findByEmail(input.email); if (user && String(user._id) !== userId) throw new ConflictError('An account with this email already exists'); }
    if (input.phone) { const user = await this.users.findByPhone(input.phone); if (user && String(user._id) !== userId) throw new ConflictError('An account with this phone number already exists'); }
    const updated = await this.users.updateProfile(userId, input); if (!updated) throw new UnauthorizedError('User not found');
    const populated = await this.users.findByIdWithPreferences(userId); if (!populated) throw new UnauthorizedError('User not found'); return toSafeUserDTO(populated);
  }
  async changePassword(userId: string, input: UpdatePasswordRequestDTO): Promise<void> {
    const user = await this.users.findByIdWithPassword(userId); if (!user) throw new UnauthorizedError('User not found');
    if (!(await this.passwords.compare(input.currentPassword, user.password))) throw new UnauthorizedError('Current password is incorrect');
    await this.users.updatePassword(userId, await this.passwords.hash(input.newPassword)); await this.users.updateRefreshToken(userId, null);
  }
  async updatePreferences(userId: string, input: UpdatePreferencesRequestDTO): Promise<SafeUserDTO> {
    const ids = [...new Set(input.preferences)]; const categories = await this.categories.findActiveByIds(ids);
    if (categories.length !== ids.length) throw new BadRequestError('One or more selected preferences are invalid or inactive');
    await this.users.updatePreferences(userId, categories.map((category) => category._id as Types.ObjectId));
    return this.getProfile(userId);
  }
}
