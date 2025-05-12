import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Request, UseGuards } from "@nestjs/common";
import { BusinessService } from "./services/business.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Business } from "./entities/business.entity";

@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyBusinesses(@Request() req): Promise<Business[]> {
      return this.businessService.getAllUserBusinesses(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
      @Param('id', ParseIntPipe) id: number,
      @Request() req
  ): Promise<void> {
      await this.businessService.deleteBusinessByIdAndUserId(id, req.user.id);
  }
}