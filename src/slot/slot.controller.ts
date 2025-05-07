import { Controller, Injectable } from "@nestjs/common";
import { SlotService } from "./slot.service";

@Controller('slots')
export class SlotController {
    constructor(
        private readonly slotService: SlotService
    ) {}
}