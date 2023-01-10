export const ssr = false;
import { multiverseService } from '$services/multiverse.service';

/** @type {import('./$types').PageLoad} */
export async function load({ params }: { params: { id: string } }) {
	const id = params.id;
	await multiverseService.loadGalaxyIfNeeded(id);
	return {};
}
