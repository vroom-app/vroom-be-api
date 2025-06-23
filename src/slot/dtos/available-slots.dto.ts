export class AvailableSlotsResponse {
  date: string;
  business_id: string;
  service_offering_id: number;
  available_slots: Array<{ start_time: string; end_time: string }>;
}
