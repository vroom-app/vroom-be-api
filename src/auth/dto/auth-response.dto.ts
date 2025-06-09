import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/users/entities/user.entity';

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

  @ApiProperty()
  phone: string;

  @ApiProperty({ type: [String], enum: UserRole })
  roles: UserRole[];
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}