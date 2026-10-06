<script lang="ts">
	import { onMount } from 'svelte';

	// Example {#each} migration:
	// These three repeated “big links” become data + a loop.
	const bigLinks = [
		{ label: 'Projects', href: 'https://apps.elouan.xyz', colorVar: '--fuchsia' },
		{ label: 'Photos', href: '/photos/', colorVar: '--green' },
		{ label: 'Feed', href: '/feed/', colorVar: '--rss' }
	] as const;

	const keepAndroidOpenBannerSrc =
		'https://keepandroidopen.org/banner.js?size=minimal&animation=off';

	onMount(async () => {
		// Load the Keep Android Open banner (your old HTML had this script tag in the homepage body).
		// In Svelte, you can't sprinkle raw <script> tags in the markup, so we inject it on mount.
		if (!document.querySelector(`script[data-keepandroidopen="true"]`)) {
			const script = document.createElement('script');
			script.src = keepAndroidOpenBannerSrc;
			script.defer = true;
			script.dataset.keepandroidopen = 'true';
			document.head.appendChild(script);
		}

		try {
			const res = await fetch(
				'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=elouan.xyz',
				{ cache: 'force-cache' }
			);

			const data = await res.json();

			if (data.followersCount !== undefined) {
				const count = document.getElementById('bluesky-follower-count');
				const container = document.getElementById('bluesky-follower-container');

				if (count && container) {
					count.innerText = data.followersCount;
					container.style.display = 'inline';
				}
			}
		} catch (err) {
			console.error('Failed to fetch Bluesky followers:', err);
		}
	});
</script>

<main>
	<h1 class="heading top-title">
		<a href="/">elouan.xyz</a>
	</h1>

	<p class="description">
		Hi, I'm <span class="has-hidden-tooltip" data-tooltip="/ɛl.oʊ.w.ɒn/, He/Him">Elouan Grimm</span>
		and I'm
		<span
			data-roller="a web developer; a software engineer; a nerd; a nerd; terminally online; terminally online"
			>a web developer</span
		>. I really love
		<a
			href="https://bsky.app/profile/elouan.xyz"
			style="--color: var(--c050); text-decoration: none;">Open Source</a
		>,
		<a
			href="https://bsky.app/profile/elouan.xyz"
			style="--color: var(--c050); text-decoration: none;"
			aria-hidden="true"
			tabindex="-1">Bluesky</a
		>, plain HTML5 websites, and more. I currently live in Saint Nazaire, France, am fluent in
		French and English, and other than tech, I enjoy
		<a href="/photos/" style="--color: var(--c050)" aria-hidden="true" tabindex="-1">photography</a>
		(with my <span class="has-hidden-tooltip" data-tooltip="Canon EOS 1200D">DSLR</span>), and
		♪｡singing˚♬! Hit me up on
		<a
			href="https://bsky.app/profile/elouan.xyz"
			style="--color: var(--c050); text-decoration: none;">Bluesky</a
		>,
		<a
			href="https://discord.com/users/939697576419131462"
			style="--color: var(--c050); text-decoration: none;"
			aria-hidden="true"
			tabindex="-1">Discord</a
		>, or by
		<a
			href="mailto:hello@elouan.xyz"
			style="--color: var(--c050); text-decoration: none;"
			aria-hidden="true"
			tabindex="-1">email</a
		> (I will respond ASAP)!
	</p>

	{#each bigLinks as link (link.href)}
		<a class="big" style={`--color: var(${link.colorVar})`} href={link.href}>
			{link.label}
		</a>
	{/each}

	<ul>
		<li>
			<a href="https://github.com/elouangrimm" style="--color: var(--github)" target="_blank"
				><span class="has-hidden-tooltip" data-tooltip="elouangrimm">GitHub</span></a
			>
		</li>
		<li>
			<a
				href="https://bsky.app/profile/elouan.xyz"
				style="--color: var(--bluesky); text-decoration: none;"
				target="_blank"
				><span
					class="has-hidden-tooltip"
					data-tooltip="@elouan.xyz"
					style="text-decoration: underline;">Bluesky</span
				>
				<sup
					id="bluesky-follower-container"
					style="display: none; font-size: 0.7em; opacity: 0.7; text-decoration: none;"
					>(<span id="bluesky-follower-count"></span>)</sup
				></a
			>
		</li>
		<li>
			<a href="mailto:hello@elouan.xyz" style="--color: var(--email)">
				<span class="has-hidden-tooltip" data-tooltip="hello@elouan.xyz">Email</span>
			</a>
		</li>
		<li>
			<a href="/ping" style="--color: var(--emerald)">
				<span class="has-hidden-tooltip" data-tooltip="Send me a notification">Ping me</span>
			</a>
		</li>
		<li>
			<a
				href="https://discord.com/users/939697576419131462"
				style="--color: var(--discord)"
				target="_blank"
				><span class="has-hidden-tooltip" data-tooltip="@elouangrimm">Discord</span></a
			>
		</li>
		<li>
			<a
				href="https://signal.me/#eu/ZaPIPBrJletYXYv14DVMJK7c49QtCQG9QtDAHwGGhX_Biie58BNI8Kt34z9uDAmR"
				style="--color: var(--signal)"
				target="_blank"><span class="has-hidden-tooltip" data-tooltip="@elouan.01">Signal</span></a
			>
		</li>
	</ul>

	<ul>
		<li>
			<a href="/feed" style="--color: var(--rss)">RSS</a>
		</li>
	</ul>

	<br />
	<br />
	<br />

	<div id="github-profile-commit-status">Loading last commit info...</div>

	<div id="tooltip-display" class="tooltip" role="tooltip"></div>
</main>
