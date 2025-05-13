
/**
 * Type alias for the type of user.
 */
export type UserType = 'individual' | 'agency';

/**
 * Interface representing a user in the `users` table.
 */
export interface User {
  /** Unique identifier (UUID) */
  id: string;
  /** User's first name, nullable */
  first_name: string | null;
  /** User's last name, nullable */
  last_name: string | null;
  /** User's phone number, nullable */
  phone: string | null;
  /** User's birth date (ISO string), nullable */
  birth_date: string | null;
  /** URL to the user's profile picture, nullable */
  profile_picture: string | null;
  /** Registration date (ISO string), always present due to default */
  registration_date: string;
  /** Whether the user is active, defaults to true */
  is_active: boolean;
  /** Whether the user is deleted, defaults to false */
  is_deleted: boolean;
  /** Communication preferences as key-value pairs, nullable */
  communication_preferences: Record<string, string> | null;
  /** Permission level as an integer */
  permissions: number;
  /** Type of user (individual or agency) */
  user_type: UserType;
}

/**
 * Interface representing a state in the `states` table.
 */
export interface State {
  /** Unique identifier */
  id: number;
  /** Name of the state */
  name: string;
}

/**
 * Interface representing a municipality in the `municipalities` table.
 */
export interface Municipality {
  /** Unique identifier */
  id: number;
  /** Foreign key referencing `states.id` */
  state_id: number;
  /** Name of the municipality */
  name: string;
}

/**
 * Interface representing a listing in the `listings` table.
 */
export interface Listing {
  /** Unique identifier (UUID) */
  id: string;
  /** Foreign key referencing `users.id` */
  user_id: string;
  /** Title of the listing */
  title: string | null;
  /** Type of property */
  property_type: number | null;
  /** Property address */
  address: string | null;
  /** Foreign key referencing `states.id` */
  state_id: number | null;
  /** Foreign key referencing `municipalities.id` */
  municipality_id: number | null;
  /** Array of image URLs (stored as JSONB) */
  images: string[] | null;
  /** URL to a video of the property */
  video: string | null;
  /** Type of operation (0=selling or 1=renting) */
  operation_type: number | null;
  /** Seller's asking price, nullable */
  seller_price: number | null;
  /** Whether the price is negotiable */
  is_negotiable: boolean | null;
  /** Highest bidding price, nullable */
  highest_bidding_price: number | null;
  /** Payment type, nullable */
  payment_type: number | null;
  /** Description of the neighborhood, nullable */
  neighborhood_description: string | null;
  /** Type of documents provided */
  documents_type: number | null;
  /** Number of views */
  view_count: number | null;
  /** Number of rooms, nullable */
  rooms: number | null;
  /** Number of stories, nullable */
  stories: number | null;
  /** Total area in square units */
  total_area: number | null;
  /** Property specifications as key-value boolean pairs (stored as JSONB), nullable */
  specifications: Record<string, boolean> | null;
  /** Additional notes, nullable */
  notes: string | null;
  /** Communication preferences as key-value pairs (stored as JSONB) */
  communication_preferences: Record<string, string> | null;
  /** Status of the listing */
  status: number | null;
  /** Creation date (ISO string) */
  created_at: string | null;
  /** Last update date (ISO string) */
  updated_at: string | null;
}

/**
 * Interface representing a review of a listing in the `listing_reviews` table.
 */
export interface ListingReview {
  /** Unique identifier (UUID) */
  id: string;
  /** Foreign key referencing `listings.id` */
  listing_id: string;
  /** Foreign key referencing `users.id` (moderator) */
  moderator_id: string;
  /** Status of the review */
  status: number;
  /** Reason for the review status, nullable */
  reason: string | null;
  /** Review date (ISO string) */
  reviewed_at: string;
}

/**
 * Interface representing a notification in the `notifications` table.
 */
export interface Notification {
  /** Unique identifier (UUID) */
  id: string;
  /** Foreign key referencing `users.id` */
  user_id: string;
  /** Foreign key referencing `listings.id`, nullable */
  listing_id: string | null;
  /** Notification message */
  message: string;
  /** Whether the notification has been read */
  is_read: boolean;
  /** Creation date (ISO string) */
  created_at: string;
}