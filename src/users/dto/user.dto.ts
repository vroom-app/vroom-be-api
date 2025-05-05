import { UserRole } from "../entities/user.entity";

export class UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserResponseDto {
  user: UserDto;
}