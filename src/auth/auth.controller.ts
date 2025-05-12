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
        return this.authService.getProfile(req.user.id);
    }
}