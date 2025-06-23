import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpStatus,
  HttpCode,
    Res,
    Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    type: AuthResponseDto,
    description: 'User registered successfully',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'User logged in successfully',
  })
  async login(@Request() req): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    this.logger.log(`Google OAuth callback received for user ${req.user?.id}`);
    try {
      const authResult = await this.authService.googleLogin(req.user);
      
      // Redirect to frontend with token
      const frontendUrl = this.configService.get<string>('frontend.url');
      const redirectUrl = `${frontendUrl}/auth/callback?token=${authResult.accessToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      // Redirect to frontend with error
      const frontendUrl = this.configService.get<string>('frontend.url');
      const redirectUrl = `${frontendUrl}/auth/callback?error=oauth_failed`;
      
      res.redirect(redirectUrl);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile of logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'User profile returned successfully',
  })
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}