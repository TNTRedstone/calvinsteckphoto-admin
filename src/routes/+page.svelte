<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';

	let authenticated = false;
	let message = '';
	let errorMsg = '';
	let users: any[] = [];
	let loading = false;
	let editing: Record<string, boolean> = {};
	let editPaypalName: Record<string, string> = {};
	let editPaypalAmount: Record<string, string> = {};
	let editPaypalConfirmed: Record<string, boolean> = {};
	let editPhotosSent: Record<string, boolean> = {};
	let editPaypalSent: Record<string, boolean> = {};

	onMount(async () => {
		try {
			const response = await fetch('/api/check-auth');
			authenticated = response.ok;
			if (authenticated) {
				await syncUsers();
			}
		} catch (e) {
			authenticated = false;
		}
	});

	async function syncUsers() {
		loading = true;
		try {
			const res = await fetch('/api/sync-emails');
			const data = await res.json();
			users = data.users;
			// Reset edit fields
			for (const user of users) {
				editPaypalName[user.email] = user.paypalName || '';
				editPaypalAmount[user.email] = user.paypalAmount ? String(user.paypalAmount) : '';
				editPaypalConfirmed[user.email] = user.paypalConfirmed || false;
				editPhotosSent[user.email] = user.photosSent || false;
				editPaypalSent[user.email] = user.paypalSent || false;
			}
		} catch (e: any) {
			errorMsg = 'Failed to sync users: ' + e.message;
		} finally {
			loading = false;
		}
	}

	async function createPaypalDraft(user: any) {
		try {
			await fetch('/api/send-paypal-request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: user.email, numberOfPhotos: 1 })
			});
			message = `Draft for ${user.email} created.`;
			await syncUsers();
		} catch (e: any) {
			errorMsg = 'Failed to create PayPal draft: ' + e.message;
		}
	}

	async function createPhotosDraft(user: any) {
		const driveLink = prompt('Enter Google Drive link to send:');
		if (!driveLink) return;
		try {
			await fetch('/api/send-photos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: user.email, driveLink })
			});
			message = `Draft for ${user.email} created.`;
			await syncUsers();
		} catch (e: any) {
			errorMsg = 'Failed to create photos draft: ' + e.message;
		}
	}

	async function saveStatus(user: any) {
		try {
			await fetch('/api/sync-emails', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: user.email,
					paypalConfirmed: editPaypalConfirmed[user.email],
					paypalName: editPaypalName[user.email],
					paypalAmount: editPaypalAmount[user.email]
						? Number(editPaypalAmount[user.email])
						: undefined,
					photosSent: editPhotosSent[user.email],
					paypalSent: editPaypalSent[user.email]
				})
			});
			editing = { ...editing, [user.email]: false };
			await syncUsers();
			message = 'Status updated.';
		} catch (e: any) {
			errorMsg = 'Failed to update status: ' + e.message;
		}
	}
</script>

<div class="mx-auto mt-12 max-w-7xl rounded-lg border bg-white p-6 shadow dark:bg-zinc-900">
	<h1 class="mb-6 text-3xl font-bold">Client Status Dashboard</h1>
	{#if !authenticated}
		<p class="mb-4">You need to authenticate with Google to use this app.</p>
		<Button onclick={() => goto('/auth/google')}>Authenticate with Google</Button>
	{:else}
		<div class="mb-4 flex items-center gap-4">
			<Button onclick={syncUsers} disabled={loading}>
				{loading ? 'Syncing...' : 'Sync Client Data'}
			</Button>
		</div>

		{#if loading && users.length === 0}
			<p>Loading users...</p>
		{:else if users.length === 0}
			<p>No users found. Try syncing.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full border text-sm">
					<thead class="bg-zinc-100 dark:bg-zinc-800">
						<tr>
							<th class="px-4 py-2 text-left">Email</th>
							<th class="px-4 py-2 text-center">Form Filled</th>
							<th class="px-4 py-2 text-center">PayPal Request</th>
							
							<th class="px-4 py-2 text-center">Photos</th>
							<th class="px-4 py-2 text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each users as user (user.email)}
							<tr class="border-b last:border-0">
								<td class="px-4 py-2 font-medium">{user.email}</td>
								<td class="px-4 py-2 text-center"><div class="flex justify-center"><Checkbox checked={user.formFilled} disabled /></div></td>
								<td class="px-4 py-2 text-center"><div class="flex justify-center">
									{#if editing[user.email]}
										<Checkbox bind:checked={editPaypalSent[user.email]} />
									{:else}
										<Button
											size="sm"
											variant={user.paypalSent ? 'outline' : 'default'}
											disabled={user.paypalSent}
											onclick={() => createPaypalDraft(user)}
										>
											{user.paypalSent ? 'Sent' : 'Create Draft'}
										</Button>
									{/if}
								</div></td>
								<td class="px-4 py-2 text-center">
									{#if editing[user.email]}
										<div class="flex flex-col items-center gap-2">
											<Input
												class="w-40"
												bind:value={editPaypalName[user.email]}
												placeholder="PayPal Name"
											/>
											<Input
												class="w-24"
												type="number"
												bind:value={editPaypalAmount[user.email]}
												placeholder="Amount"
											/>
										</div>
									{:else}
										{user.paypalName || 'N/A'} ({user.paypalAmount
											? `${user.paypalAmount}`
											: 'N/A'})
									{/if}
								</td>
								<td class="px-4 py-2 text-center"><div class="flex justify-center">
									{#if editing[user.email]}
										<Checkbox bind:checked={editPaypalConfirmed[user.email]} />
									{:else}
										<Checkbox checked={user.paypalConfirmed} disabled />
									{/if}
								</div></td>
								<td class="px-4 py-2 text-center"><div class="flex justify-center">
									{#if editing[user.email]}
										<Checkbox bind:checked={editPhotosSent[user.email]} />
									{:else}
										<Button
											size="sm"
											variant={user.photosSent ? 'outline' : 'default'}
											disabled={user.photosSent || !user.paypalConfirmed}
											onclick={() => createPhotosDraft(user)}
										>
											{user.photosSent ? 'Sent' : 'Create Draft'}
										</Button>
									{/if}
								</div></td>
								<td class="px-4 py-2">
									{#if editing[user.email]}
										<Button onclick={() => saveStatus(user)} size="sm" class="mr-2"
											>Save</Button
										>
										<Button
											onclick={() => (editing[user.email] = false)}
											size="sm"
											variant="secondary">Cancel</Button
										>
									{:else}
										<Button onclick={() => (editing[user.email] = true)} size="sm"
											>Edit Status</Button
										>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
		{#if message}
			<p class="mt-4 text-green-600">{message}</p>
		{/if}
		{#if errorMsg}
			<p class="mt-4 text-red-600">{errorMsg}</p>
		{/if}
	{/if}
</div>
