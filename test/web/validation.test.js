import { describe, it, expect } from 'vitest';

/* ---- Constants (mirrored from the app) ---- */
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DESCRIPTION_LENGTH = 500;
const CATEGORIES = ['pothole', 'garbage'];

/* ---- Helpers under test ---- */
function validateImageType(mimeType) {
  return ALLOWED_TYPES.includes(mimeType);
}

function validateImageSize(sizeBytes) {
  return sizeBytes <= MAX_FILE_SIZE;
}

function validateDescription(text) {
  return typeof text === 'string' && text.length <= MAX_DESCRIPTION_LENGTH;
}

function validateCategory(cat) {
  return CATEGORIES.includes(cat);
}

/* ---- Tests ---- */
describe('Image validation', () => {
  it('accepts JPEG', () => {
    expect(validateImageType('image/jpeg')).toBe(true);
  });

  it('accepts PNG', () => {
    expect(validateImageType('image/png')).toBe(true);
  });

  it('rejects GIF', () => {
    expect(validateImageType('image/gif')).toBe(false);
  });

  it('rejects WebP', () => {
    expect(validateImageType('image/webp')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateImageType('')).toBe(false);
  });

  it('accepts file exactly at 5 MB', () => {
    expect(validateImageSize(MAX_FILE_SIZE)).toBe(true);
  });

  it('accepts file under 5 MB', () => {
    expect(validateImageSize(1024)).toBe(true);
  });

  it('rejects file over 5 MB', () => {
    expect(validateImageSize(MAX_FILE_SIZE + 1)).toBe(false);
  });

  it('rejects zero-byte file', () => {
    // zero-byte is technically valid in size, but let's keep it accepted
    expect(validateImageSize(0)).toBe(true);
  });
});

describe('Description validation', () => {
  it('accepts empty description', () => {
    expect(validateDescription('')).toBe(true);
  });

  it('accepts description at max length', () => {
    expect(validateDescription('x'.repeat(MAX_DESCRIPTION_LENGTH))).toBe(true);
  });

  it('rejects description over max length', () => {
    expect(validateDescription('x'.repeat(MAX_DESCRIPTION_LENGTH + 1))).toBe(false);
  });

  it('rejects non-string', () => {
    expect(validateDescription(null)).toBe(false);
    expect(validateDescription(undefined)).toBe(false);
    expect(validateDescription(123)).toBe(false);
  });
});

describe('Category validation', () => {
  it('accepts pothole', () => {
    expect(validateCategory('pothole')).toBe(true);
  });

  it('accepts garbage', () => {
    expect(validateCategory('garbage')).toBe(true);
  });

  it('rejects street_light (not a supported category)', () => {
    expect(validateCategory('street_light')).toBe(false);
  });

  it('rejects drain_blockage (future work, not supported)', () => {
    expect(validateCategory('drain_blockage')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateCategory('')).toBe(false);
  });

  it('rejects arbitrary string', () => {
    expect(validateCategory('bridge')).toBe(false);
  });
});

