import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/users/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    // Use consistent environment variable naming
    const secret = configService.get<string>('jwt.secret');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // Validate that the user still exists and is active
    const user = await this.userService.findOne(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return consistent user object structure
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      provider: user.provider,
    };
  }
}