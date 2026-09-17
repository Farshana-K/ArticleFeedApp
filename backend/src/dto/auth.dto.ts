export interface SafeCategoryDTO {
  id: string;
  name: string;
  slug: string;
}

export interface SafeUserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  preferences: SafeCategoryDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseDTO {
  user: SafeUserDTO;
}
 
export interface RefreshTokenResponseDTO {
  accessTokenRefreshed: true;
}
