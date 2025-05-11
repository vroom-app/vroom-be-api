import { 
    Controller, 
    Post, 
    Body, 
    UseGuards, 
    Get, 
    Request, 
    Put,
    HttpStatus, 
    HttpCode,
    Res,
    Query,
    BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { GoogleCallbackDto } from './dto/google-callback.dto';
import { Response } from 'express';
  
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
        const user = await this.authService.register(registerDto);
        const { passwordHash, ...result } = user;
        return { user: result };
    }
  
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        console.log(`User ID in getProfile: ${req.user.userId}`);
        return this.authService.getProfile(req.user.userId);
    }

    // @UseGuards(JwtAuthGuard)
    @Get('google')
    redirectToGoogle(@Request() req, @Res() res: Response) {
        // console.log(`User ID in redirectToGoogle: ${req.user.userId}`);

        const url = this.authService.getAuthUrl(1111);
        return res.redirect(url);
    }

    /** Step 2: Handle Google's callback, fetch locations, associate with user */
    @Get('google/callback')
    @HttpCode(HttpStatus.OK)
    async handleGoogleCallback(
        @Query('code') code: string, 
        @Query('state') state: string, 
        @Res() res: Response
    ) {
        console.log(`Google callback code: ${code}`);
        if (!code) {
            throw new BadRequestException('Authorization code is required');
        }
        
        const locations = await this.authService.processGoogleCallback(code);
    
        return res.redirect(`http://localhost:3000/google-success?locations=${encodeURIComponent(JSON.stringify(locations))}`);
    }
}