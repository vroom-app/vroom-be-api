export interface GooglePlaceResponse {
    id: string;
    displayName: {
        text: string;
        languageCode: string;
    };
    formattedAddress: string;
    location: {
        latitude: number;
        longitude: number;
    };
    types?: string[];
    rating?: number;
    userRatingCount?: number;
    websiteUri?: string;
    nationalPhoneNumber?: string;
    currentOpeningHours?: {
        openNow: boolean;
        periods: Array<{
            open: { day: number; time: string };
            close: { day: number; time: string };
        }>;
        weekdayDescriptions: string[];
    };
    photos?: Array<{
        name: string;
        widthPx: number;
        heightPx: number;
    }>;
    reviews?: Array<{
        name: string;
        text: string;
        rating: number;
        publishTime: string;
        authorAttribution: {
            displayName: string;
            photoUri: string;
        };
    }>;
}