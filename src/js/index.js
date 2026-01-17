// --------------------------------------------------------------------------
// ---------------------- Glitch effect initialization ----------------------
// --------------------------------------------------------------------------

let glitchEffect = null;

const initGlitch = () => {
	const sizeCursor = window.innerWidth > window.innerHeight ? "100vw" : "150vh";

	glitchEffect = glitchGL({
		target: ".glitchGL",
		intensity: 4.0,
		interaction: {
			enabled: true,
			shape: "square",
			customSize: sizeCursor,
			effects: {
				pixelation: [],
				crt: [
					// "phosphorGlow",
					"curvature",
				],
				glitch: [
					"lineDisplacement",
					"signalDropout",
					"syncErrors",
					"frameGhosting",
					"stutterFreeze",
					"datamoshing",
				],
			},
		},
		effects: {
			pixelation: {
				enabled: true,
				pixelSize: 7,
				pixelShape: "square",
				bitDepth: "none",
				dithering: "bayer",
				pixelDirection: "square",
			},
			crt: {
				enabled: true,
				preset: "computer-monitor",
				curvature: 3,
				lineDirection: "down",
				lineMovement: true,
				lineSpeed: 0.0005,
				brightness: 0.27, // 0.225 is what I had when I used when the mouse affected this
				phosphorGlow: 1.25, // 0.9 is what I had when I used when the mouse affected this
				scanlineDirection: "down",
				scanlineIntensity: 0.3,
				scanlineThickness: 1.5,
				scanlineCount: 350,
				chromaticAberration: 0.7,
			},
			glitch: {
				enabled: true,
				rgbShift: 0,
				digitalNoise: 0.3,
				lineDisplacement: 0,
				bitCrushDepth: 2,
				signalDropoutFreq: 0.0,
				signalDropoutSize: 0.0,
				syncErrorFreq: 0.00, //0.085
				syncErrorAmount: 0.00, //0.141
				interferenceSpeed: 1,
				interferenceIntensity: 0.1,
				frameGhostAmount: 0.68,
				stutterFreq: 0.4,
				datamoshStrength: 1,
			},
		},
	});

	return glitchEffect;
};

// --------------------------------------------------------------------------
// ---------------------- Glitch effect Mouse Boost -------------------------
// --------------------------------------------------------------------------

function setupGlitchBoost() {
	const glitchedAssetContainer = document.querySelector(".hero");
	if (!glitchedAssetContainer) return;

	function applyBoost() {
		if (!glitchEffect) return;

		glitchEffect.updateOptions({
			intensity: 5.0,
			effects: {
				crt: {
					curvature: 2.5,
					chromaticAberration: 1,
					brightness: 0.29,
					phosphorGlow: 1.5,
				},
				glitch: {
					datamoshStrength: 1.2,
					rgbShift: 0.0005,
				},
			},
		});
	}

	function clearBoost() {
		if (!glitchEffect) return;

		glitchEffect.updateOptions({
			intensity: 4.0,
			effects: {
				crt: {
					curvature: 3,
					chromaticAberration: 0.7,
					brightness: 0.27,
					phosphorGlow: 1.25,
				},
				glitch: {
					datamoshStrength: 1,
					rgbShift: 0,
				},
			},
		});
	}

	glitchedAssetContainer.addEventListener("pointerdown", (e) => {
		glitchedAssetContainer.setPointerCapture?.(e.pointerId);
		applyBoost();
	});

	glitchedAssetContainer.addEventListener("pointerup", (e) => {
		glitchedAssetContainer.releasePointerCapture?.(e.pointerId);
		clearBoost();
	});

	glitchedAssetContainer.addEventListener("pointercancel", clearBoost);
	glitchedAssetContainer.addEventListener("pointerleave", clearBoost);
}


// ----------------------------------------------------------------
// ---------------------- Lazy load section  ----------------------
// ----------------------------------------------------------------

const GLITCH_LIBS = {
	// three: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
	three: "./src/js/glitchGLFiles/three.min.js",
	glitch: "./src/js/glitchGLFiles/glitchGL.min.js",
};

const runWhenIdle = (fn, timeout = 2000) => {
	if ("requestIdleCallback" in window) {
		requestIdleCallback(fn, { timeout });
	} else {
		setTimeout(fn, 10);
	}
};

const scriptPromises = new Map();

const loadScript = (src) => {
	if (scriptPromises.has(src)) return scriptPromises.get(src);

	const p = new Promise((resolve, reject) => {
		const s = document.createElement("script");
		s.src = src;
		s.async = false; // keep ordered execution for three -> glitchGL
		s.onload = resolve;
		s.onerror = () => reject(new Error(`Failed to load: ${src}`));
		document.head.appendChild(s);
	});

	scriptPromises.set(src, p);
	return p;
};

const whenVideoCanPlay = (video) => {
	// 0 HAVE_NOTHING | 1 HAVE_METADATA | 2 HAVE_CURRENT_DATA |
	// 3 HAVE_FUTURE_DATA | 4 HAVE_ENOUGH_DATA
	if (video.readyState >= 2) return Promise.resolve();

	return new Promise((resolve) =>
		video.addEventListener("canplay", resolve, { once: true })
	);
};

const setGlitchReady = () => {
	const container = document.querySelector(".glitched-asset-container");

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			container.classList.add("is-ready");
		});
	});
};

runWhenIdle(async () => {
	try {
		const video = document.getElementById("glitched-asset");

		await loadScript(GLITCH_LIBS.three);
		await loadScript(GLITCH_LIBS.glitch);

		await whenVideoCanPlay(video);

		initGlitch();
		setupGlitchBoost();
		setGlitchReady();
	} catch (err) {
		console.error(err);
	}
});

// ----------------------------------------------------------------
// ---------------------- ASCII Shift Effect ----------------------
// ----------------------------------------------------------------

window.initASCIIShift();

// ----------------------------------------------------------------
// ---------------------- Animation Fade Ins ----------------------
// ----------------------------------------------------------------

const fadeEls = document.querySelectorAll(".fade-in");
const fadeObserver = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			const el = entry.target;
			el.classList.add("is-visible");
			fadeObserver.unobserve(el);

			// ASCII hook
			const asciiTargets = el.querySelectorAll(".ascii-on-fade");
			asciiTargets.forEach((t) => {
				window.asciiInstances.get(t)?.triggerWave({
					at: 0.5,
					repeat: 5,
					interval: 100,
				});
			});
		}
	});
});

fadeEls.forEach((el) => fadeObserver.observe(el));

// ---------------------------------------------------------------
// ---------------------- My Links dropdown ----------------------
// ---------------------------------------------------------------

const socialLinksDropdownContainer = document.querySelector(".social-links-dropdown-container");
const socialLinksDropdownContainerBtn = document.querySelector(".social-links-dropdown-container-btn");
const socialMenu = document.querySelector("#social-menu");
let socialLinksDropdownContainerOpen = false;
let suppressNextClickToggle = false;

function setMenu(state) {
	if (socialLinksDropdownContainerOpen === state) return;

	socialLinksDropdownContainer.classList.toggle("is-open", state);
	socialLinksDropdownContainerBtn.setAttribute("aria-expanded", state ? "true" : "false");
	socialMenu.hidden = !state;
	socialLinksDropdownContainerOpen = state;

	// console.log(socialLinksDropdownContainerOpen)
}

socialLinksDropdownContainerBtn.addEventListener("click", () => {
	if (suppressNextClickToggle) {
		suppressNextClickToggle = false;
		return;
	}
	setMenu(!socialLinksDropdownContainerOpen);
});

socialLinksDropdownContainerBtn.addEventListener("mouseenter", () => {
	if (!socialLinksDropdownContainerOpen) suppressNextClickToggle = true;
	setMenu(true);
});

socialLinksDropdownContainer.addEventListener("mouseleave", () => {
	if (!socialLinksDropdownContainerOpen) return;
	setMenu(false);
	suppressNextClickToggle = false;
});

socialLinksDropdownContainer.addEventListener("focusin", () => {
	setMenu(true);
});

socialLinksDropdownContainer.addEventListener("focusout", () => {
	requestAnimationFrame(() => {
		if (!socialLinksDropdownContainer.contains(document.activeElement)) {
			setMenu(false);
		}
	});
});

document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		setMenu(false);
		// socialLinksDropdownContainerBtn.focus(); Note: Once other elements are in, might want to adjust this.
	}
});


// ---------------------------------------------------------------
// ---------------------- Nav Links dropdown ---------------------
// ---------------------------------------------------------------

const navLinksDropdownContainer = document.querySelector(".nav-links-dropdown-container");
const navLinksDropdownContainerBtn = document.querySelector(".nav-links-dropdown-container-btn");
const navMenu = document.querySelector("#nav-menu");
let navLinksDropdownContainerOpen = false;
let suppressNextNavClickToggle = false;

function setNavMenu(state) {
	if (navLinksDropdownContainerOpen === state) return;

	navLinksDropdownContainer.classList.toggle("is-open", state);
	navLinksDropdownContainerBtn.setAttribute("aria-expanded", state ? "true" : "false");
	navMenu.hidden = !state;
	navLinksDropdownContainerOpen = state;

	// console.log(navLinksDropdownContainerOpen)
}

navLinksDropdownContainerBtn.addEventListener("click", () => {
	if (suppressNextNavClickToggle) {
		suppressNextNavClickToggle = false;
		return;
	}
	setNavMenu(!navLinksDropdownContainerOpen);
});

navLinksDropdownContainerBtn.addEventListener("mouseenter", () => {
	if (!navLinksDropdownContainerOpen) suppressNextNavClickToggle = true;
	setNavMenu(true);
});

navLinksDropdownContainer.addEventListener("mouseleave", () => {
	if (!navLinksDropdownContainerOpen) return;
	setNavMenu(false);
	suppressNextNavClickToggle = false;
});

navLinksDropdownContainer.addEventListener("focusin", () => {
	setNavMenu(true);
});

navLinksDropdownContainer.addEventListener("focusout", () => {
	requestAnimationFrame(() => {
		if (!navLinksDropdownContainer.contains(document.activeElement)) {
			setNavMenu(false);
		}
	});
}); 

navMenu.addEventListener("click", (e) => {
	const link = e.target.closest('a[href^="#"]');
	if (!link) return;

	// Only close in mobile mode
	if (!navDesktopMQ.matches) {
		setNavMenu(false);
		suppressNextNavClickToggle = false;
	}
});

document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		setNavMenu(false);
		navLinksDropdownContainerBtn.focus(); 	
	}
});

const navDesktopMQ = window.matchMedia("(min-width: 40rem)");

function syncNavDropdownToViewport() {
	if (navDesktopMQ.matches) {
		// Desktop: menu is always visible
		navLinksDropdownContainer.classList.remove("is-open");
		navLinksDropdownContainerOpen = true;

		navMenu.hidden = false;
		navLinksDropdownContainerBtn.setAttribute("aria-expanded", "true");
	} else {
		// Mobile: start closed (JS controls open/close)
		navLinksDropdownContainer.classList.remove("is-open");
		navLinksDropdownContainerOpen = false;

		navMenu.hidden = true;
		navLinksDropdownContainerBtn.setAttribute("aria-expanded", "false");
		suppressNextNavClickToggle = false;
	}
}

// Set initial state on load
syncNavDropdownToViewport();

// Keep it correct if the user resizes / rotates
navDesktopMQ.addEventListener("change", syncNavDropdownToViewport);

// -------------------------------------------------------------------
// ---------------------- Logo Scroll Animation ----------------------
// -------------------------------------------------------------------

const logoImg = document.querySelector(".logo");
let ticking = false;

// Trying to make it so on mobile the scrolling isn't janky
let stableVH = window.innerHeight;

const updateLogoRotation = () => {
	const scrollTop =
		window.scrollY || document.documentElement.scrollTop;
	const maxScroll =
		document.documentElement.scrollHeight - stableVH || 1;

	const progress = scrollTop / maxScroll; // 0 -> 1
	const turns = 1; // 1 = 360°, 2 = 720°, etc.
	const deg = progress * 360 * turns;

	logoImg.style.setProperty("--logo-rot", `${deg}deg`);
	ticking = false;
};

const onScroll = () => {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(updateLogoRotation);
};

updateLogoRotation(); 
window.addEventListener("scroll", onScroll, { passive: true });

window.addEventListener("resize", () => {
	stableVH = window.innerHeight;
	updateLogoRotation();
});



// -------------------------------------------------------------------
// ------------------- Section Tabbing / Active ----------------------
// -------------------------------------------------------------------

const navAnchorLinks = document.querySelectorAll('.nav-link');
let tabNavigationMode = false;

const sectionById = new Map(); // id -> section element
const linkById = new Map();    // id -> link element

// These apparently will prevent double scrolling
// Need to test if it's even needed, but better safe than sorry
document.addEventListener("keydown", (e) => {
	if (e.key === "Tab") tabNavigationMode = true;
});
document.addEventListener("pointerdown", () => {
	tabNavigationMode = false;
});

navAnchorLinks.forEach((link) => {

	const id = link.getAttribute("href").slice(1);
	if (!id) return;
	const target = document.getElementById(id);
	if (!target) return;
	
	sectionById.set(id, target);
	linkById.set(id, link);

	link.addEventListener("focus", (e) => {
		e.preventDefault()
		if (!tabNavigationMode) return;

		target.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	});

	link.addEventListener("click", (e) => {
		e.preventDefault()

		target.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	});
});

// -----------------------------------------
//  Active Tabs ----------------------------
// -----------------------------------------

let lastActiveId = null;

const sectionObserver = new IntersectionObserver((entries) => {
	entries.forEach(entry=>{
		if (!entry.isIntersecting) return;

		const id = entry.target.id;
		if (id === lastActiveId) return;
		lastActiveId = id;

		// I know a loop inside a loop, but it's small and this works without pulling my hair out
		navAnchorLinks.forEach((l) => l.classList.remove("is-active"));

		const link = linkById.get(id);
		link?.classList.add("is-active");

	})
}, 
{
	threshold: 0.05,
	rootMargin: "-50% 0px -30% 0px"
})


sectionById.forEach((section) => sectionObserver.observe(section));

