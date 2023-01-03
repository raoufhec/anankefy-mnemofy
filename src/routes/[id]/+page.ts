import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params }: any) {
	console.log('params', params);
	const { id } = params;
	throw redirect(307, `/${id}/overview`);
}
