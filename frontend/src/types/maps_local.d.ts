declare module 'maps_local' {
  export interface Place {
    address: string;
    description: string;
    distance: string;
    distance_in_meters: number;
    id: string;
    map_url: string;
    name: string;
    opening_hours: string[];
    phone_number: string;
    rating: string;
    review_count: number | null;
    url: string;
    user_rating_count: number | null;
  }

  export interface SummaryPlaces {
    map_url: string | null;
    places: Place[];
    query: string;
  }

  export function query_places(options: { query: string }): SummaryPlaces;
}