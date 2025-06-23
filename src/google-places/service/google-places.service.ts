import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import { BusinessProfileDto } from '../../business-management/dto/business-profile.dto';
import { GooglePlaceResponse } from '../interface/google-place-response.interface';

@Injectable()
export class GooglePlacesService {
    private readonly logger = new Logger(GooglePlacesService.name);
    private readonly SCOPES = ['https://www.googleapis.com/auth/maps-platform.places'];

    constructor() {  }

    private getCredentials() {
        return {
            type: 'service_account',
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
        };
    }

    async getGooglePlaceDetails(placeId: string): Promise<BusinessProfileDto> {
        const fieldMask = [
            'id', 'displayName', 'formattedAddress',
            'location', 'types', 'rating',
            'userRatingCount', 'websiteUri',
            'nationalPhoneNumber', 'currentOpeningHours',
            'photos', 'reviews'
        ].join(',');

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
    }
}