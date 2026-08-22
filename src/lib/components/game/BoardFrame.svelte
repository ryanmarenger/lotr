<!--
  BoardFrame.svelte — Ornate SVG border frame

  Three separate pieces:
  1. L-border (left spine + top shelf + brackets with concave arches + bottom shelves + horn bracket)
  2. Narsil shelf (separate piece along top edge)
  3. Portrait bracket (right edge)

  Coordinates in viewBox 1600x900 (16:9).
  Conversion from board editor %: x = pct × 16, y = pct × 9
-->
<svg class="board-frame" viewBox="0 0 1600 900" preserveAspectRatio="none">
	<defs>
		<!-- Stone/aged-metal texture via fractal noise -->
		<filter id="frame-texture" x="-5%" y="-5%" width="110%" height="110%">
			<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="5" seed="7" result="noise" />
			<feColorMatrix type="saturate" values="0" in="noise" result="grey" />
			<feComponentTransfer in="grey" result="dimNoise">
				<feFuncA type="linear" slope="0.12" />
			</feComponentTransfer>
			<feComposite operator="in" in="dimNoise" in2="SourceGraphic" result="masked" />
			<feBlend mode="overlay" in="SourceGraphic" in2="masked" />
		</filter>

		<!-- Soft gold glow for edge highlights -->
		<filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
			<feMerge>
				<feMergeNode in="blur" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>

		<!-- Border body gradient — dark with subtle warm tone -->
		<linearGradient id="border-body" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="#100e0b" />
			<stop offset="40%" stop-color="#0c0a08" />
			<stop offset="100%" stop-color="#080705" />
		</linearGradient>

		<!-- Gold inlay for decorative lines -->
		<linearGradient id="gold-inlay" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="rgba(180,140,50,0.55)" />
			<stop offset="50%" stop-color="rgba(120,90,30,0.35)" />
			<stop offset="100%" stop-color="rgba(180,140,50,0.55)" />
		</linearGradient>

		<!-- Arch opening ambient glow -->
		<radialGradient id="arch-ambient" cx="0.1" cy="0.5" r="0.6">
			<stop offset="0%" stop-color="rgba(30,50,70,0.15)" />
			<stop offset="100%" stop-color="transparent" />
		</radialGradient>
	</defs>

	<!-- ═══ MAIN L-BORDER ═══ -->
	<g class="l-border">
		<!-- L-border body (single closed path) -->
		<path
			d="
				M 0,0
				L 395,0
				L 395,81
				L 284,81
				C 284,210 130,312 48,312
				L 48,585
				C 130,585 300,690 300,741
				L 618,741
				L 618,819
				L 795,819
				L 795,900
				L 0,900
				Z
			"
			fill="url(#border-body)"
			filter="url(#frame-texture)"
		/>

		<!-- Inner edge contour — the gold trim line facing the landscape -->
		<path
			class="inner-edge"
			d="
				M 395,0
				L 395,81
				L 284,81
				C 284,210 130,312 48,312
				L 48,585
				C 130,585 300,690 300,741
				L 618,741
				L 618,819
				L 795,819
				L 795,900
			"
			fill="none"
			stroke="url(#gold-inlay)"
			stroke-width="1.8"
			filter="url(#edge-glow)"
		/>

		<!-- Secondary inner edge — very faint, wider glow for depth -->
		<path
			d="
				M 395,0
				L 395,81
				L 284,81
				C 284,210 130,312 48,312
				L 48,585
				C 130,585 300,690 300,741
				L 618,741
				L 618,819
				L 795,819
				L 795,900
			"
			fill="none"
			stroke="rgba(80,60,30,0.08)"
			stroke-width="6"
		/>

		<!-- Decorative horizontal bands on the spine -->
		<line x1="0" y1="200" x2="44" y2="200" stroke="rgba(120,90,40,0.2)" stroke-width="0.5" />
		<line x1="0" y1="400" x2="44" y2="400" stroke="rgba(120,90,40,0.15)" stroke-width="0.5" />
		<line x1="0" y1="600" x2="44" y2="600" stroke="rgba(120,90,40,0.2)" stroke-width="0.5" />
		<line x1="0" y1="750" x2="44" y2="750" stroke="rgba(120,90,40,0.15)" stroke-width="0.5" />

		<!-- Gold corner jewels at major junction points -->
		<circle cx="395" cy="81" r="4" fill="rgba(180,140,40,0.35)" filter="url(#edge-glow)" />
		<circle cx="284" cy="81" r="3.5" fill="rgba(180,140,40,0.3)" filter="url(#edge-glow)" />
		<circle cx="618" cy="741" r="3.5" fill="rgba(180,140,40,0.3)" filter="url(#edge-glow)" />
		<circle cx="618" cy="819" r="3" fill="rgba(180,140,40,0.25)" />
		<circle cx="795" cy="819" r="3" fill="rgba(180,140,40,0.25)" />
		<circle cx="795" cy="900" r="3" fill="rgba(180,140,40,0.2)" />

		<!-- Subtle filigree lines on bottom strip -->
		<line x1="60" y1="855" x2="780" y2="855" stroke="rgba(100,75,30,0.12)" stroke-width="0.4" stroke-dasharray="8,12" />
		<line x1="60" y1="865" x2="780" y2="865" stroke="rgba(100,75,30,0.08)" stroke-width="0.3" stroke-dasharray="6,18" />
	</g>

	<!-- ═══ NARSIL SHELF (separate from L-border) ═══ -->
	<g class="narsil-shelf">
		<!-- Shelf body with rounded bottom corners -->
		<path
			d="
				M 558,0
				L 1263,0
				L 1263,38
				Q 1263,70 1231,70
				L 590,70
				Q 558,70 558,38
				Z
			"
			fill="url(#border-body)"
			filter="url(#frame-texture)"
		/>

		<!-- Narsil shelf inner edge (bottom contour) -->
		<path
			d="
				M 558,38
				Q 558,70 590,70
				L 1231,70
				Q 1263,70 1263,38
			"
			fill="none"
			stroke="url(#gold-inlay)"
			stroke-width="1.5"
			filter="url(#edge-glow)"
		/>

		<!-- Thin horizontal accent on shelf -->
		<line x1="600" y1="35" x2="1220" y2="35" stroke="rgba(120,90,40,0.15)" stroke-width="0.4" />
	</g>

	<!-- ═══ RIGHT PORTRAIT BRACKET ═══ -->
	<g class="portrait-bracket">
		<rect
			x="1498" y="312" width="102" height="200"
			rx="6" ry="6"
			fill="url(#border-body)"
			filter="url(#frame-texture)"
		/>

		<!-- Portrait bracket inner edge -->
		<line x1="1498" y1="318" x2="1498" y2="506" stroke="rgba(120,90,40,0.35)" stroke-width="1.2" filter="url(#edge-glow)" />

		<!-- Portrait divider -->
		<line x1="1502" y1="412" x2="1596" y2="412" stroke="rgba(120,90,40,0.2)" stroke-width="0.6" />

		<!-- Portrait placeholder frames -->
		<rect x="1510" y="322" width="78" height="82" rx="3" fill="none" stroke="rgba(100,80,40,0.2)" stroke-width="0.8" />
		<rect x="1510" y="422" width="78" height="82" rx="3" fill="none" stroke="rgba(100,80,40,0.2)" stroke-width="0.8" />
	</g>

	<!-- ═══ AMBIENT GLOW in arch opening ═══ -->
	<rect x="48" y="312" width="240" height="273" fill="url(#arch-ambient)" opacity="0.5" />
</svg>

<style>
	.board-frame {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 10;
		pointer-events: none;
	}

	.inner-edge {
		animation: edge-breathe 8s ease-in-out infinite;
	}

	@keyframes edge-breathe {
		0%, 100% { opacity: 0.85; }
		50% { opacity: 1; }
	}
</style>
