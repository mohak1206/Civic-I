/**
 * Configuration & constants for the Civic-I Citizen App.
 * Follows PROJECT_RULES.md:
 * - Two categories only: pothole, garbage
 * - Palghar, Maharashtra coordinates
 */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_DESCRIPTION_LENGTH = 500;

export const CATEGORIES = [
  {
    id: 'pothole',
    label: 'Pothole',
    description: 'Road surface damage, asphalt potholes, crater depressions',
  },
  {
    id: 'garbage',
    label: 'Garbage Dump',
    description: 'Overflowing dumpsters, roadside refuse, illegal waste dumping',
  },
];

export const PALGHAR_DEFAULT_CENTER = {
  lat: 19.6967,
  lng: 72.7651,
  zoom: 13,
};

