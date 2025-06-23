import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider, UserRole } from 'src/users/entities/user.entity';

export class AuthUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  country: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ type: [String], enum: UserRole })
  roles: UserRole[];

  @ApiProperty({ enum: AuthProvider })
  provider: AuthProvider;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty()
  emailVerified: boolean;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}