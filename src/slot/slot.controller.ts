import { Controller, Get, Injectable, Param, Query } from "@nestjs/common";
import { SlotService } from "./slot.service";
import { AvailableSlotsResponse } from "./dtos/available-slots.dto";

@Controller('slots')
export class SlotController {
    constructor(
        private readonly slotService: SlotService
    ) {}

    @Get('/:businessId/:serviceOfferingId')
    async getAvailableSlots(
        @Param('businessId') businessId: number,
        @Param('serviceOfferingId') serviceOfferingId: number,
        @Query('startDate') startDate: string,
        @Query('days') days: number = 7,
    ): Promise<AvailableSlotsResponse[]> {
        return this.slotService.getAvailableSlots(businessId, serviceOfferingId, startDate, days);
    }
}