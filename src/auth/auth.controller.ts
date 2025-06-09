import { 
    Controller, 
    Post, 
    Body, 
    UseGuards, 
    Get, 
    Request,
    HttpStatus, 
    HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
  
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, type: AuthResponseDto, description: 'User registered successfully' })
    async register(
        @Body() registerDto: RegisterDto
    ): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }
  
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({ status: 200, type: AuthResponseDto, description: 'User logged in successfully' })
    async login(
        @Request() req
    ): Promise<AuthResponseDto> {
        return this.authService.login(req.user);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get profile of logged-in user' })
    @ApiResponse({ status: 200, description: 'User profile returned successfully' })
    getProfile(
        @Request() req
    ) {
        return this.authService.getProfile(req.user.id);
    }
}