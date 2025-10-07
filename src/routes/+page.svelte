<script>
	// @ts-nocheck

	// リツイート・ハートの色（編集UI用）
	// 色付けON/OFF用チェックボックス
	let retweetColored = true;
	let heartColored = true;
	import coment from '$lib/assets/coment.png';
	import repost from '$lib/assets/repost.png';
	import heart2 from '$lib/assets/heart_2.png';
	import heart from '$lib/assets/heart.png';
	import hyouzi from '$lib/assets/hyouzi.png';
	import bookmark from '$lib/assets/bookmark.png';
	import uploadarrow from '$lib/assets/uploadarrow.png';

	// アイコン画像URL
	let iconUrl = 'https://pbs.twimg.com/profile_images/1883413777074487296/MHN6aWvh_400x400.jpg';
	let iconHistory = [iconUrl];
	const ICON_HISTORY_MAX = 5;
	function addIconHistory(url) {
		if (!url) return;
		iconHistory = [url, ...iconHistory.filter((u) => u !== url)].slice(0, ICON_HISTORY_MAX);
	}
	// アイコン画像URLまたはアップロード
	function handleIconFileChange(event) {
		const file = event.target.files && event.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			iconUrl = e.target.result;
			addIconHistory(iconUrl);
		};
		reader.readAsDataURL(file);
	}
	// キャンバス画像をクリップボードにコピー
	async function copyCanvasToClipboard() {
		if (!canvas) return;
		try {
			// toBlobでPNG画像を取得
			canvas.toBlob(async (blob) => {
				if (!blob) return;
				try {
					await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
					alert('画像をクリップボードにコピーしました');
				} catch (e) {
					alert('クリップボードへのコピーに失敗しました: ' + e);
				}
			}, 'image/png');
		} catch (e) {
			alert('クリップボードAPIが使えません: ' + e);
		}
	}
	// レイアウト選択肢
	const layouts = [
		{ value: 'twitter', label: 'Twitter風' }
		// { value: 'simple', label: 'インスタ風' }
	];
	let selectedLayout = 'twitter';
	import { onMount, afterUpdate } from 'svelte';
	let canvas;
	let name = 'illusive';
	let id = 'illusive_isc';
	let dateText = '現在';
	let title = 'Svelteで画像投稿風キャンバス';
	let body = 'ツイート本文の例です。改行もできます。\nさらに長い文章の場合は自動的に折り返されます';

	// 画像は使わず透明な四角形を描画
	const CANVAS_WIDTH = 500;
	const HEADER_HEIGHT = 80;
	const FOOTER_HEIGHT = 56;
	const IMAGE_MARGIN = 20;
	const CARD_RADIUS = 18;

	function drawCard() {
		// 画像の代わりに透明な四角形を描画
		const imageWidth = CANVAS_WIDTH - IMAGE_MARGIN * 2;
		const imageHeight = imageWidth; // 正方形
		// 本文の高さを計算
		let bodyLines = 0;
		let bodyHeight = 0;
		const lineHeight = 26;
		const bodyX = HEADER_HEIGHT;
		const maxWidth = CANVAS_WIDTH - bodyX - 24;
		if (selectedLayout === 'twitter') {
			const ctxTmp = document.createElement('canvas').getContext('2d');
			ctxTmp.font = '18px sans-serif';
			if (body) {
				const lines = body.split(/\r?\n/);
				for (let line of lines) {
					do {
						let fit = line.length;

						while (ctxTmp.measureText(line.slice(0, fit)).width > maxWidth && fit > 0) fit--;
						bodyLines++;
						line = line.slice(fit);
					} while (line.length > 0);
				}
			} else {
				bodyLines = 1;
			}
			bodyHeight = bodyLines * lineHeight;
		}
		// Twitter風は本文の下に画像を配置
		const twitterImageY = HEADER_HEIGHT + bodyHeight - (selectedLayout === 'twitter' ? 30 : 0);
		// インスタ風は中央揃え
		const instaImageY = Math.round((canvas.height - imageHeight) / 2);
		// キャンバス高さも調整
		const canvasHeight =
			selectedLayout === 'twitter'
				? twitterImageY + imageHeight + FOOTER_HEIGHT + IMAGE_MARGIN
				: HEADER_HEIGHT + imageHeight + FOOTER_HEIGHT + IMAGE_MARGIN * 2;

		canvas.width = CANVAS_WIDTH;
		canvas.height = canvasHeight;

		const ctx = canvas.getContext('2d');

		if (selectedLayout === 'twitter') {
			// Twitter風レイアウト
			// 背景
			ctx.fillStyle = '#fff';
			ctx.strokeStyle = '#e1e8ed';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(CARD_RADIUS, 0);
			ctx.lineTo(CANVAS_WIDTH - CARD_RADIUS, 0);
			ctx.quadraticCurveTo(CANVAS_WIDTH, 0, CANVAS_WIDTH, CARD_RADIUS);
			ctx.lineTo(CANVAS_WIDTH, canvasHeight - CARD_RADIUS);
			ctx.quadraticCurveTo(CANVAS_WIDTH, canvasHeight, CANVAS_WIDTH - CARD_RADIUS, canvasHeight);
			ctx.lineTo(CARD_RADIUS, canvasHeight);
			ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - CARD_RADIUS);
			ctx.lineTo(0, CARD_RADIUS);
			ctx.quadraticCurveTo(0, 0, CARD_RADIUS, 0);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// ユーザーアイコン
			if (iconUrl) {
				const iconImg = new window.Image();
				iconImg.crossOrigin = 'anonymous';
				iconImg.src = iconUrl;
				iconImg.onload = () => {
					ctx.save();
					ctx.beginPath();
					ctx.arc(HEADER_HEIGHT / 2, HEADER_HEIGHT / 2, 28, 0, Math.PI * 2);
					ctx.closePath();
					ctx.clip();
					ctx.drawImage(iconImg, HEADER_HEIGHT / 2 - 28, HEADER_HEIGHT / 2 - 28, 56, 56);
					ctx.restore();
				};
			} else {
				ctx.save();
				ctx.beginPath();
				ctx.arc(HEADER_HEIGHT / 2, HEADER_HEIGHT / 2, 28, 0, Math.PI * 2);
				ctx.closePath();
				ctx.clip();
				ctx.fillStyle = '#1da1f2';
				ctx.fill();
				ctx.restore();
			}

			// 名前・ID・日付を横並びで表示
			const nameX = HEADER_HEIGHT;
			const nameY = 38;

			// 名前
			ctx.font = 'bold 20px sans-serif';
			ctx.fillStyle = '#222';
			ctx.fillText(name, nameX, nameY);
			const nameWidth = ctx.measureText(name).width;

			// ID
			ctx.font = '16px sans-serif';
			ctx.fillStyle = '#555';
			const idX = nameX + nameWidth + 16;
			ctx.fillText('@' + id, idX, nameY);
			const idWidth = ctx.measureText('@' + id).width;

			// 日付（前に「·」を挿入）
			ctx.font = '14px sans-serif';
			ctx.fillStyle = '#888';
			const dot = '·';
			const dotX = idX + idWidth + 12;
			ctx.fillText(dot, dotX, nameY);
			const dotWidth = ctx.measureText(dot).width;
			const dateX = dotX + dotWidth + 4;
			ctx.fillText(dateText, dateX, nameY);

			// 本文テキスト（改行・折り返し対応）
			ctx.font = '18px sans-serif';
			ctx.fillStyle = '#222';
			let bodyY = nameY + 24;
			if (body) {
				const lines = body.split(/\r?\n/);
				for (let line of lines) {
					do {
						let fit = line.length;
						while (ctx.measureText(line.slice(0, fit)).width > maxWidth && fit > 0) fit--;
						ctx.fillText(line.slice(0, fit), bodyX, bodyY);
						line = line.slice(fit);
						bodyY += lineHeight;
					} while (line.length > 0);
				}
			}

			// 画像部分を完全な透過でくり抜く
			// 角丸でくり抜き
			ctx.save();
			ctx.globalCompositeOperation = 'destination-out';
			ctx.beginPath();
			const r = 18; // 角丸半径
			const x = IMAGE_MARGIN + 50;
			const y = twitterImageY;
			const w = imageWidth - 50;
			const h = imageHeight;
			ctx.moveTo(x + r, y);
			ctx.lineTo(x + w - r, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r);
			ctx.lineTo(x + w, y + h - r);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
			ctx.lineTo(x + r, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r);
			ctx.lineTo(x, y + r);
			ctx.quadraticCurveTo(x, y, x + r, y);
			ctx.closePath();
			ctx.fillStyle = 'rgba(0,0,0,1)';
			ctx.fill();
			ctx.restore();

			// ボタン類（PNG画像で描画）
			const buttonY = canvasHeight - FOOTER_HEIGHT / 1.5; // 高さを中央に揃える
			const iconSize = 28;
			// 各アイコンごとに個別のGAP（間隔）を設定
			const iconGaps = [0, 80, 80, 80, 100, 40]; // 例: 1つ目は0px, 2つ目は70px, 3つ目は90px, 4つ目は60px
			const iconPaths = [
				coment,
				repost,
				heartColored ? heart2 : heart,
				hyouzi,
				bookmark,
				uploadarrow
			];

			// アイコン列の全体幅を計算
			const iconsTotalWidth = iconGaps.reduce((a, b) => a + b, 0);
			// キャンバス中央に配置
			const startX = 90;
			iconPaths.forEach((src, i) => {
				const img = new window.Image();
				img.src = src;
				img.onload = () => {
					// サブキャンバスで色分岐して塗りつぶし
					const off = document.createElement('canvas');
					off.width = iconSize;
					off.height = iconSize;
					const offCtx = off.getContext('2d');
					offCtx.clearRect(0, 0, iconSize, iconSize);
					offCtx.drawImage(img, 0, 0, iconSize, iconSize);
					offCtx.globalCompositeOperation = 'source-in';
					if (i === 1) {
						// リツイート: 色付けONなら黄緑、OFFなら黒
						offCtx.fillStyle = retweetColored ? '#7be87b' : '#222';
						offCtx.fillRect(0, 0, iconSize, iconSize);
					} else if (i === 2) {
						// ハート: 色付けONならピンク、OFFなら黒
						offCtx.fillStyle = heartColored ? '#e1306c' : '#222';
						offCtx.fillRect(0, 0, iconSize, iconSize);
					} else {
						offCtx.fillStyle = '#222';
						offCtx.fillRect(0, 0, iconSize, iconSize);
					}
					offCtx.globalCompositeOperation = 'source-over';
					// 各アイコンのX座標はstartX + 各GAPの合計
					const iconX = startX + iconGaps.slice(0, i + 1).reduce((a, b) => a + b, 0) - iconSize / 2;
					ctx.drawImage(off, iconX, buttonY - iconSize / 2, iconSize, iconSize);
				};
			});
		} else if (selectedLayout === 'simple') {
			// インスタグラム風レイアウト
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight);
			ctx.strokeStyle = '#e1e8ed';
			ctx.strokeRect(0.5, 0.5, CANVAS_WIDTH - 1, canvasHeight - 1);

			// アイコン（左上）
			if (iconUrl) {
				const iconImg = new window.Image();
				iconImg.crossOrigin = 'anonymous';
				iconImg.src = iconUrl;
				iconImg.onload = () => {
					ctx.save();
					ctx.beginPath();
					ctx.arc(40, 40, 20, 0, Math.PI * 2);
					ctx.closePath();
					ctx.clip();
					ctx.drawImage(iconImg, 20, 20, 40, 40);
					ctx.restore();
				};
			} else {
				ctx.save();
				ctx.beginPath();
				ctx.arc(40, 40, 20, 0, Math.PI * 2);
				ctx.closePath();
				ctx.clip();
				ctx.fillStyle = '#1da1f2';
				ctx.fill();
				ctx.restore();
			}

			// 名前（アイコン右）
			ctx.font = 'bold 18px sans-serif';
			ctx.fillStyle = '#222';
			ctx.fillText(name, 70, 48);

			// タイトル（名前の下から、アイコン右にずらす）
			ctx.font = 'bold 18px sans-serif';
			ctx.fillStyle = '#222';
			const nameY2 = 48; // インスタ風の名前Y座標
			const bodyY2 = nameY2 + 24;
			const bodyX2 = 70;
			ctx.fillText(title, bodyX2, bodyY2);

			// 画像部分を完全な透過でくり抜く
			const imgX = 32;
			const imgY = 100;
			ctx.save();
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = 'rgba(0,0,0,1)';
			ctx.fillRect(imgX, twitterImageY, imageWidth, imageHeight);
			ctx.restore();
			// 枠線は描画しない

			// アイコン類（画像下に3つ並べる）
			const iconY = imgY + imageHeight + 30;
			const iconBaseX = 32;
			const iconGap = 40;
			// ハート（いいね）
			ctx.save();
			ctx.strokeStyle = '#e1306c';
			ctx.lineWidth = 2.2;
			ctx.beginPath();
			ctx.moveTo(iconBaseX + 12, iconY + 8);
			ctx.bezierCurveTo(
				iconBaseX + 4,
				iconY - 4,
				iconBaseX - 8,
				iconY + 8,
				iconBaseX + 12,
				iconY + 22
			);
			ctx.bezierCurveTo(
				iconBaseX + 32,
				iconY + 8,
				iconBaseX + 20,
				iconY - 4,
				iconBaseX + 12,
				iconY + 8
			);
			ctx.stroke();
			ctx.restore();

			// コメント（吹き出し）
			ctx.save();
			ctx.strokeStyle = '#262626';
			ctx.lineWidth = 2.2;
			ctx.beginPath();
			ctx.arc(iconBaseX + iconGap + 12, iconY + 10, 10, Math.PI * 0.2, Math.PI * 1.8, false);
			ctx.lineTo(iconBaseX + iconGap + 5, iconY + 20);
			ctx.lineTo(iconBaseX + iconGap + 19, iconY + 15);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();

			// シェア（紙飛行機）
			ctx.save();
			ctx.strokeStyle = '#262626';
			ctx.lineWidth = 2.2;
			ctx.beginPath();
			ctx.moveTo(iconBaseX + iconGap * 2, iconY + 8);
			ctx.lineTo(iconBaseX + iconGap * 2 + 20, iconY + 14);
			ctx.lineTo(iconBaseX + iconGap * 2 + 8, iconY + 18);
			ctx.moveTo(iconBaseX + iconGap * 2 + 20, iconY + 14);
			ctx.lineTo(iconBaseX + iconGap * 2 + 12, iconY + 6);
			ctx.stroke();
			ctx.restore();

			// 日付（アイコンの右端下）
			ctx.font = '14px sans-serif';
			ctx.fillStyle = '#888';
			ctx.fillText(dateText, iconBaseX + iconGap * 3, iconY + 18);
		}
	}

	onMount(drawCard);
	afterUpdate(drawCard);
</script>

<!-- アイコン色編集 -->

<div
	style="display: flex; flex-direction: row; align-items: flex-start; gap: 2.5em; margin-bottom: 2em;"
>
	<canvas bind:this={canvas} style="border-radius:16px; box-shadow:0 2px 8px #0001;"></canvas>
	<div
		style="display: flex; flex-direction: column; gap: 0.9em; max-width: 340px; min-width: 220px;"
	>
		<!-- <div style="margin-bottom: 0.5em;">
			<label style="font-weight: bold;"
				>レイアウト
				<select
					bind:value={selectedLayout}
					style="margin-left:0.7em; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc;"
				>
					{#each layouts as layout}
						<option value={layout.value}>{layout.label}</option>
					{/each}
				</select>
			</label>
		</div> -->
		<label style="display: flex; flex-direction: column; font-weight: bold; gap: 0.2em;">
			アイコン画像
			<input
				type="text"
				placeholder="画像URLを入力"
				bind:value={iconUrl}
				on:blur={() => addIconHistory(iconUrl)}
				style="width:100%; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc; margin-bottom: 0.3em;"
			/>
			<input
				type="file"
				accept="image/*"
				on:change={handleIconFileChange}
				style="padding: 2px 0;"
			/>
			<span style="font-size:0.92em; color:#888;">URLまたは画像ファイルを選択</span>
			{#if iconHistory.length > 1}
				<div style="margin-top:0.4em; display:flex; flex-wrap:wrap; gap:0.5em;">
					<span style="font-size:0.92em; color:#888;">履歴:</span>
					{#each iconHistory as url, i}
						{#if url !== iconUrl}
							<img
								src={url}
								alt="icon"
								width="32"
								height="32"
								style="border-radius:50%; border:1.5px solid #ccc; cursor:pointer; background:#fff; object-fit:cover;"
								on:click={() => (iconUrl = url)}
								title="クリックで復元"
							/>
						{/if}
					{/each}
				</div>
			{/if}
		</label>
		<label style="display: flex; flex-direction: column; font-weight: bold; gap: 0.2em;">
			名前
			<input
				bind:value={name}
				style="width:100%; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc;"
			/>
		</label>
		<label style="display: flex; flex-direction: column; font-weight: bold; gap: 0.2em;">
			ID
			<div style="display: flex; align-items: center; gap: 0.3em;">
				<span style="color:#888; font-size:1.1em;">@</span>
				<input
					bind:value={id}
					style="flex:1; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc; min-width:0;"
				/>
			</div>
		</label>
		<label style="display: flex; flex-direction: column; font-weight: bold; gap: 0.2em;">
			日付
			<input
				bind:value={dateText}
				style="width:100%; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc;"
			/>
		</label>
		<label
			style="flex-direction: column; font-weight: bold; gap: 0.2em; {selectedLayout === 'twitter'
				? 'display:flex;'
				: 'display: none'}"
		>
			本文
			<textarea
				bind:value={body}
				rows="3"
				style="width:100%; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc; resize: vertical; font-family: inherit; font-size: 1em;"
			></textarea>
		</label>
		<label
			style="flex-direction: column; font-weight: bold; gap: 0.2em; {selectedLayout === 'twitter'
				? 'display:none;'
				: 'display: flex'}"
		>
			タイトル
			<input
				bind:value={title}
				style="width:100%; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc;"
			/>
		</label>
		<div style="display:flex; gap:1.5em; align-items:center; margin-bottom:0.5em;">
			<label style="font-weight:bold; display:flex; align-items:center; gap:0.6em;">
				<input type="checkbox" bind:checked={retweetColored} />
				リツイート
			</label>
			<label style="font-weight:bold; display:flex; align-items:center; gap:0.6em;">
				<input type="checkbox" bind:checked={heartColored} />
				いいね
			</label>
		</div>
		<div style="margin-top: 0.7em;">
			<button
				on:click={copyCanvasToClipboard}
				style="padding: 6px 18px; border-radius: 6px; background: #222; color: #fff; border: none; font-weight: bold; cursor: pointer;"
				>画像をクリップボードにコピー</button
			>
		</div>
	</div>
</div>
