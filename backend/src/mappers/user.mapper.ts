import { SafeUserDTO } from '../dto/auth.dto';
import { UserWithPopulatedPreferences } from '../contracts/user.repository.interface';

export function toSafeUserDTO(user: UserWithPopulatedPreferences): SafeUserDTO {
  return {
    id: String(user._id), firstName: user.firstName, lastName: user.lastName,
    email: user.email, phone: user.phone, dateOfBirth: user.dateOfBirth,
    preferences: user.preferences.map((category) => ({ id: String(category._id), name: category.name, slug: category.slug })),
    createdAt: user.createdAt, updatedAt: user.updatedAt,
  };
}
