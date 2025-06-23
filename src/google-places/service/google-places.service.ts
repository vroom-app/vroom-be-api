import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { BusinessProfileDto } from '../../business-management/dto/business-profile.dto';
import { GooglePlaceResponse } from '../interface/google-place-response.interface';

@Injectable()
export class GooglePlacesService {
    private readonly logger = new Logger(GooglePlacesService.name);

    async getGooglePlaceDetails(placeId: string): Promise<BusinessProfileDto> {
        const fieldMask = [
            'id', 'displayName', 'formattedAddress',
            'location', 'types', 'rating',
            'userRatingCount', 'websiteUri',
            'nationalPhoneNumber', 'currentOpeningHours',
            'photos', 'reviews'
        ].join(',');

        try {
            const response = await axios.get<GooglePlaceResponse>(
                `https://places.googleapis.com/v1/places/${placeId}`, {
                    params: {
                        languageCode: 'bg',
                        key: process.env.GOOGLE_PLACES_API_KEY,
                    },
                    headers: {
                        'X-Goog-FieldMask': fieldMask,
                    },
                }
            );

            const data = response.data;
            const photoRefs = data.photos?.map(photo => photo.name) || [];

            const businessDetails: BusinessProfileDto = {
                id: data.id,
                googlePlaceId: data.id,
                displayName: {
                    text: data.displayName?.text || '',
                    languageCode: data.displayName?.languageCode || 'NONE'
                },
                formattedAddress: data.formattedAddress || '',
                location: {
                    latitude: data.location?.latitude,
                    longitude: data.location?.longitude,
                },
                types: data.types || [],
                rating: data.rating,
                userRatingCount: data.userRatingCount,
                websiteUri: data.websiteUri,
                nationalPhoneNumber: data.nationalPhoneNumber,
                currentOpeningHours: data.currentOpeningHours ?? {
                    openNow: false,
                    periods: [],
                    weekdayDescriptions: [],
                },
                photoRefs,
                isVerified: false,
                isSponsored: false,
                acceptBookings: false,
                reviews: data.reviews?.map(review => ({
                    text: review.text,
                    rating: review.rating,
                    publishTime: review.publishTime,
                    authorAttribution: {
                        displayName: review.authorAttribution?.displayName,
                        photoUri: review.authorAttribution?.photoUri,
                    },
                })) || [],
            };

            return businessDetails;
        } catch (error) {
            const status = error.response?.status;
            const errorMessage = error.response?.data?.error?.message || error.message;
            
            switch (status) {
                case 404:
                    console.log(`Business with place ID ${placeId} not found on Google Maps`);
                    throw new NotFoundException(`Business with place ID ${placeId} not found on Google Maps`);  

                case 403:
                    console.error(`Google Places API access denied: ${errorMessage}`);
                    throw new NotFoundException('Google Places API access denied');
                    
                case 400:
                    console.error(`Invalid place ID format: ${placeId}`);
                    throw new NotFoundException('Invalid place ID format');
                    
                case 429:
                    console.error('Google Places API rate limit exceeded');
                    throw new NotFoundException('API rate limit exceeded');
                    
                default:
                    console.error(`Google Places API error (${status}): ${errorMessage}`);
                    throw new NotFoundException(`Google Places API error: ${errorMessage}`);
            }
        }
    }
}