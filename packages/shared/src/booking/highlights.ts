import type { EventCategory } from '../constants';

/**
 * "What's this evening actually like?" — answered in three phrases, derived
 * from the category rather than asked of the organiser. Organisers already
 * abandon long submission forms; a field most of them would leave blank isn't
 * worth the friction when the category already implies the answer.
 *
 * An explicit per-event override can be layered on later (an optional
 * `highlights` column) without touching the page: `eventHighlights` takes the
 * override first.
 */
export interface EventHighlight {
  icon: string;
  label: string;
}

const BY_CATEGORY: Record<EventCategory, EventHighlight[]> = {
  concert: [
    { icon: '🎤', label: 'Live performance' },
    { icon: '🎵', label: 'Live music' },
    { icon: '✨', label: 'Full production' },
  ],
  party: [
    { icon: '🪩', label: 'DJ sets all night' },
    { icon: '💃', label: 'Dancefloor' },
    { icon: '🎶', label: 'Bollywood & desi hits' },
  ],
  garba_dandiya: [
    { icon: '💃', label: 'Garba & Dandiya' },
    { icon: '🎵', label: 'Live music' },
    { icon: '🎉', label: 'Festival atmosphere' },
  ],
  diwali: [
    { icon: '🪔', label: 'Diwali celebration' },
    { icon: '🎆', label: 'Festival of lights' },
    { icon: '🍽️', label: 'Food & sweets' },
  ],
  holi: [
    { icon: '🎨', label: 'Colours & gulal' },
    { icon: '🥁', label: 'Dhol & live music' },
    { icon: '🎉', label: 'Outdoor celebration' },
  ],
  temple: [
    { icon: '🙏', label: 'Traditional pooja' },
    { icon: '🪔', label: 'Aarti & prasad' },
    { icon: '🌸', label: 'Spiritual gathering' },
  ],
  cultural: [
    { icon: '🎭', label: 'Cultural programme' },
    { icon: '🎵', label: 'Music & dance' },
    { icon: '🌏', label: 'Community celebration' },
  ],
  comedy: [
    { icon: '🎙️', label: 'Live stand-up' },
    { icon: '😂', label: 'Desi & Hinglish humour' },
    { icon: '🍻', label: 'Bar on site' },
  ],
  food: [
    { icon: '🍛', label: 'Street food stalls' },
    { icon: '🌶️', label: 'Regional specialities' },
    { icon: '👨‍👩‍👧', label: 'Family friendly' },
  ],
  family: [
    { icon: '👨‍👩‍👧', label: 'All ages welcome' },
    { icon: '🎈', label: 'Kids activities' },
    { icon: '🎨', label: 'Hands-on fun' },
  ],
  workshop: [
    { icon: '🧑‍🏫', label: 'Guided by an expert' },
    { icon: '🙌', label: 'Hands-on session' },
    { icon: '🎓', label: 'Beginners welcome' },
  ],
  networking: [
    { icon: '🤝', label: 'Meet the community' },
    { icon: '💬', label: 'Open conversations' },
    { icon: '🥂', label: 'Drinks included' },
  ],
};

export function eventHighlights(
  category: EventCategory,
  override?: EventHighlight[] | null,
): EventHighlight[] {
  if (override && override.length > 0) return override;
  return BY_CATEGORY[category] ?? [];
}
