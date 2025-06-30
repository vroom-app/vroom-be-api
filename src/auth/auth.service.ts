import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/users/user.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthProvider, User } from 'src/users/entities/user.entity';

interface OAuthUser {
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user || user.provider !== AuthProvider.LOCAL) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async validateOAuthUser(oauthUser: OAuthUser): Promise<User> {
    // First, try to find user by email
    let user = await this.usersService.findByEmail(oauthUser.email);

    if (user) {
      // User exists - check if it's the same provider
      if (
        user.provider === AuthProvider.GOOGLE &&
        user.providerId === oauthUser.providerId
      ) {
        // Update user info in case it changed
        user.firstName = oauthUser.firstName;
        user.lastName = oauthUser.lastName;
        user.avatarUrl = oauthUser.avatarUrl ?? '';
        user.emailVerified = oauthUser.emailVerified;

        return await this.usersService.update(user.id, user);
      } else if (user.provider === AuthProvider.LOCAL) {
        // User registered with email/password, link Google account
        user.provider = AuthProvider.GOOGLE;
        user.providerId = oauthUser.providerId;
        user.avatarUrl = oauthUser.avatarUrl ?? '';
        user.emailVerified = oauthUser.emailVerified;

        return await this.usersService.update(user.id, user);
      } else {
        // Different OAuth provider - for now, throw error
        throw new ConflictException(
          'Email already registered with different provider',
        );
      }
    }

    // Create new user
    return await this.usersService.createOAuthUser({
      email: oauthUser.email,
      firstName: oauthUser.firstName,
      lastName: oauthUser.lastName,
      provider: AuthProvider.GOOGLE,
      providerId: oauthUser.providerId,
      avatarUrl: oauthUser.avatarUrl,
      emailVerified: oauthUser.emailVerified,
    });
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, country, phone } =
      registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create(
      email,
      password,
      firstName,
      lastName,
      country,
      phone,
    );

    return this.generateAuthResponse(user);
  }

  async login(user: any): Promise<AuthResponseDto> {
    return this.generateAuthResponse(user);
  }

  async googleLogin(user: User): Promise<AuthResponseDto> {
    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: User): AuthResponseDto {
    const payload = { email: user.email, sub: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        phone: user.phone ?? null,
        roles: user.roles,
        provider: user.provider,
        avatarUrl: user.avatarUrl ?? null,
        emailVerified: user.emailVerified,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result;
  }
}
