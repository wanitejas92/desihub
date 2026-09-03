import type { ComponentType, SVGProps } from 'react';
import type { EventCategory } from '@desihub/shared';
import {
  IconMic,
  IconDisco,
  IconDance,
  IconDiya,
  IconPalette,
  IconTemple,
  IconMasks,
  IconLaugh,
  IconUtensils,
  IconUsers,
  IconDrum,
  IconHandshake,
} from '@/components/ui/icons';

/** One line-icon component per event category — replaces the old emoji map. */
export const CATEGORY_ICON: Record<EventCategory, ComponentType<SVGProps<SVGSVGElement>>> = {
  concert: IconMic,
  party: IconDisco,
  garba_dandiya: IconDance,
  diwali: IconDiya,
  holi: IconPalette,
  temple: IconTemple,
  cultural: IconMasks,
  comedy: IconLaugh,
  food: IconUtensils,
  family: IconUsers,
  workshop: IconDrum,
  networking: IconHandshake,
};
