import { z } from 'zod';
import { createListingDto } from './create-listing.dto';

export const updateListingDto = createListingDto.partial();

export type UpdateListingDto = z.infer<typeof updateListingDto>;
