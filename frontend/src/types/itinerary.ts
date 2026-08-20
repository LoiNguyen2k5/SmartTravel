export type ActivityCategoryType = 'ATTRACTION' | 'RESTAURANT' | 'HOTEL' | 'TRANSPORT' | 'OTHER';

export interface ItineraryItem {
  id: number;
  dayId?: number;
  activityName: string;
  startTime?: string;
  endTime?: string;
  estimatedCost?: number;
  category?: ActivityCategoryType;
  latitude?: number;
  longitude?: number;
  notes?: string;
  sortOrder?: number;
}

export interface ItineraryDay {
  id: number;
  dayNumber: number;
  date?: string;
  title?: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  estimatedBudget?: number;
  totalCost?: number;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  shareToken?: string;
  userId: number;
  userName?: string;
  days?: ItineraryDay[];
}

export interface ItineraryCreateRequest {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  estimatedBudget?: number;
  visibility?: 'PRIVATE' | 'PUBLIC' | 'SHARED';
}
