<script>
	import favicon from '$lib/assets/illusive_サムネ600.png';
	let { children } = $props();
</script>

<svelte:head>
	<title>ネームプレート作成ツール</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
