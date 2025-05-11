import { Injectable, ConflictException, UnauthorizedException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/users/user.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private oauth2Client: OAuth2Client;
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return null;
    }
    
    const { passwordHash, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, firstName, lastName, country, phone } = registerDto;
    
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
    
    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        phone: user.phone,
        roles: user.roles,
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
  getAuthUrl(userId: number): string {
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    this.logger.debug(`State for userId ${userId}: ${state}`);
    const scopes = ['https://www.googleapis.com/auth/business.manage'];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'online',
      response_type: 'code',
      scope: scopes,
      prompt: 'consent',
      state: state,
    });
  }

  /**
   * Exchange authorization code for tokens and fetch Google business locations
   * @param code Authorization code from Google
   * @returns Array of business locations
   */
  async processGoogleCallback(code: string): Promise<any[]> {
    this.logger.debug(`Google callback code: ${code}`);
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.logger.debug(`Google tokens: ${JSON.stringify(tokens)}`);
      this.oauth2Client.setCredentials(tokens);

      const allLocations: any[] = await this.fetchAllLocationsWithRetry();
      return allLocations;
    } catch (error) {
      this.logger.error(`Error processing Google callback: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch business locations');
    }
  }

  /**
   * Fetch all locations with retry logic for rate limiting
   */
  private async fetchAllLocationsWithRetry(maxRetries = 3): Promise<any[]> {
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        return await this.fetchAllLocations();
      } catch (error) {
        if (error.message.includes('Quota exceeded') && retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          this.logger.warn(`Rate limit hit. Retrying in ${delay}ms...`);
          retryCount++;
        } else {
          throw error;
        }
      }
    }
    
    throw new Error('Max retries exceeded when fetching locations');
  }

  /**
   * Fetch all locations from Google My Business API
   */
  private async fetchAllLocations(): Promise<any[]> {
    const accountManagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: this.oauth2Client,
    });
    this.logger.debug('Fetching accounts from Google My Business API');

    const businessInfo = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: this.oauth2Client,
    });
    this.logger.debug('Fetching locations from Google My Business API');

    const accountsResponse = await accountManagement.accounts.list();

    const allLocations: any[] = [];

    // Process accounts sequentially to avoid rate limits
    for (const account of accountsResponse.data.accounts || []) {
      const accountId = account.name;
      this.logger.debug(`Processing account: ${accountId}`);

      if (!accountId) {
        this.logger.warn('Skipping account without valid name');
        continue;
      }
    
      const locationsResponse = await businessInfo.accounts.locations.list({
        parent: accountId,
      });

      const locations = (locationsResponse.data.locations || []).map(location => ({
        accountId: accountId,
        locationName: location.name,
        placeId: location.metadata?.placeId,
        title: location.title,
        address: location.storefrontAddress,
        phone: location.phoneNumbers?.primaryPhone,
        website: location.websiteUri,
      }));

      allLocations.push(...locations);
    }

    return allLocations;
  }
}
