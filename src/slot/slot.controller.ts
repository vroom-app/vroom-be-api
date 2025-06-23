import { Controller, Get, Injectable, Param, Query } from '@nestjs/common';
import { SlotService } from './slot.service';
import { AvailableSlotsResponse } from './dtos/available-slots.dto';
import { GetAvailableSlotsQueryDto } from './dtos/get-available-slots-quety.dto';
import { getDefaultStartDateAndDays } from 'src/common/helpers/time.utils';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Slots')
@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Get('/:businessId/:serviceOfferingId')
  @ApiOperation({ summary: 'Get available booking slots' })
  @ApiParam({
    name: 'businessId',
    type: Number,
    description: 'ID of the business',
  })
  @ApiParam({
    name: 'serviceOfferingId',
    type: Number,
    description: 'ID of the service offering',
  })
  async getAvailableSlots(
    @Param('businessId') businessId: string,
    @Param('serviceOfferingId') serviceOfferingId: number,
    @Query() query: GetAvailableSlotsQueryDto,
  ): Promise<AvailableSlotsResponse[]> {
    let { startDate: startDateStr, days } = query;

    if (!startDateStr || !days) {
      const defaultValues = getDefaultStartDateAndDays();
      startDateStr = defaultValues.startDateStr;
      days = defaultValues.days;
    }

    return this.slotService.getAvailableSlots(
      businessId,
      serviceOfferingId,
      startDateStr,
      days,
    );
  }
}
