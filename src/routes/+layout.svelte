<script>
	let { children } = $props();
</script>

<svelte:head>
	<title>ネームプレート作成ツール</title>
</svelte:head>

{@render children?.()}
