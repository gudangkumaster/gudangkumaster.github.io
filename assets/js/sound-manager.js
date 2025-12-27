// Web Audio API Sound Generator with Separate Click & Alert Packs
class AudioGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // ===== CLICK SOUNDS (5 Options) =====

    // Click 1: Classic Tap
    playClickClassic() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    // Click 2: Pop
    playClickPop() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(1500, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.03);
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.03);
    }

    // Click 3: Bubble
    playClickBubble() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.08);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.08);
    }

    // Click 4: Retro Beep
    playClickRetro() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 440;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.04);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.04);
    }

    // Click 5: Minimal Tick
    playClickMinimal() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 2000;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.02);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.02);
    }

    // ===== ALERT SOUNDS (5 Options) =====

    // Alert 1: Success Chime
    playAlertSuccess() {
        const notes = [523, 659, 784];
        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = this.audioContext.currentTime + (i * 0.1);
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.2);
        });
    }

    // Alert 2: Donation Cha-ching
    playAlertDonation() {
        const times = [0, 0.05, 0.1, 0.15];
        const frequencies = [1047, 1319, 1568, 2093];

        times.forEach((time, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequencies[i];
            oscillator.type = 'sine';

            const startTime = this.audioContext.currentTime + time;
            gainNode.gain.setValueAtTime(0.4, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    // Alert 3: DeanKT "Hi Dog" Style (Real audio file)
    playAlertHiDog() {
        // Use actual DeanKT Hi Dog audio file
        const audio = new Audio('https://www.myinstants.com/media/sounds/deankt-hi-dog-by-xander.mp3');
        audio.volume = 0.5;
        audio.currentTime = 0.8; // Skip first 0.8 seconds (silence)
        audio.play().catch(err => console.log('Audio play failed:', err));
    }

    // Alert 4: Retro Level Up
    playAlertRetro() {
        const notes = [262, 330, 392, 523];
        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'square';

            const startTime = this.audioContext.currentTime + (i * 0.08);
            gainNode.gain.setValueAtTime(0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.12);
        });
    }

    // Alert 5: Gentle Bell
    playAlertBell() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 1000;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }

    // Error sound
    playError() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
}

// Enhanced Sound Manager with Separate Click & Alert Packs
class SoundManager {
    constructor() {
        this.audioGen = new AudioGenerator();
        this.clickSoundEnabled = this.loadPreference('clickSound', true);
        this.alertSoundEnabled = this.loadPreference('alertSound', true);
        this.bgmEnabled = this.loadPreference('bgmEnabled', false); // Default OFF
        this.selectedClickPack = this.loadPreference('clickSoundPack', 'classic');
        this.selectedAlertPack = this.loadPreference('alertSoundPack', 'hidog');

        // BGM System
        this.bgmAudio = new Audio();
        this.bgmAudio.volume = 0.3; // 30% volume default
        this.currentTrackIndex = -1;
        this.playlist = [
            "Lukrembo - Bread.mp3",
            "Lukrembo - Sunflower.mp3",
            "massobeats - floral.mp3",
            "massobeats - gingersweet.mp3",
            "massobeats - honey jam.mp3"
        ];

        // Handle Track End (Loop next random)
        this.bgmAudio.addEventListener('ended', () => {
            this.playRandomTrack();
        });

        this.clickPacks = {
            classic: {
                name: 'Classic Tap',
                description: 'Simple professional click',
                play: () => this.audioGen.playClickClassic()
            },
            pop: {
                name: 'Pop',
                description: 'Bouncy pop sound',
                play: () => this.audioGen.playClickPop()
            },
            bubble: {
                name: 'Bubble',
                description: 'Playful bubble pop',
                play: () => this.audioGen.playClickBubble()
            },
            retro: {
                name: 'Retro Beep',
                description: '8-bit game click',
                play: () => this.audioGen.playClickRetro()
            },
            minimal: {
                name: 'Minimal Tick',
                description: 'Subtle tick sound',
                play: () => this.audioGen.playClickMinimal()
            }
        };

        this.alertPacks = {
            success: {
                name: 'Success Chime',
                description: 'Cheerful success melody',
                play: () => this.audioGen.playAlertSuccess()
            },
            donation: {
                name: 'Donation Alert',
                description: 'Cha-ching! Money sound',
                play: () => this.audioGen.playAlertDonation()
            },
            hidog: {
                name: '🐕 Hi Dog (DeanKT)',
                description: 'Cute notification like sawer',
                play: () => this.audioGen.playAlertHiDog()
            },
            retro: {
                name: 'Retro Level Up',
                description: '8-bit achievement sound',
                play: () => this.audioGen.playAlertRetro()
            },
            bell: {
                name: 'Gentle Bell',
                description: 'Soft bell notification',
                play: () => this.audioGen.playAlertBell()
            }
        };

        // Initialize BGM if enabled
        if (this.bgmEnabled) {
            // Browser might block auto-play, so we wait for first interaction usually
            // but we'll try to init anyway
            document.addEventListener('click', () => {
                if (this.bgmEnabled && this.bgmAudio.paused) {
                    this.playRandomTrack();
                }
            }, { once: true });
        }
    }

    loadPreference(key, defaultValue) {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : defaultValue;
    }

    savePreference(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    toggleClickSound(enabled) {
        this.clickSoundEnabled = enabled;
        this.savePreference('clickSound', enabled);
    }

    toggleAlertSound(enabled) {
        this.alertSoundEnabled = enabled;
        this.savePreference('alertSound', enabled);
    }

    // --- BGM METHODS ---

    toggleBGM(enabled) {
        this.bgmEnabled = enabled;
        this.savePreference('bgmEnabled', enabled);

        if (enabled) {
            if (this.bgmAudio.paused) this.playRandomTrack();
        } else {
            this.bgmAudio.pause();
        }
    }

    async playRandomTrack() {
        if (!this.bgmEnabled) return;

        // Pick random index different from current
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * this.playlist.length);
        } while (nextIndex === this.currentTrackIndex && this.playlist.length > 1);

        this.currentTrackIndex = nextIndex;
        const trackName = this.playlist[this.currentTrackIndex];
        const url = `assets/audio/${trackName}`;

        console.log(`🎵 Preparing to play: ${trackName}`);

        try {
            // Try enabling Cache API
            if ('caches' in window) {
                const cacheName = 'bgm-cache-v1';
                const cache = await caches.open(cacheName);
                const cachedResponse = await cache.match(url);

                if (cachedResponse) {
                    // Serve from cache
                    console.log(`📦 Serving from cache: ${trackName}`);
                    const blob = await cachedResponse.blob();
                    this.bgmAudio.src = URL.createObjectURL(blob);
                } else {
                    // Fetch and cache
                    console.log(`⬇️ Downloading and caching: ${trackName}`);
                    const response = await fetch(url);
                    if (response.ok) {
                        cache.put(url, response.clone());
                        const blob = await response.blob();
                        this.bgmAudio.src = URL.createObjectURL(blob);
                    } else {
                        // Fallback handling
                        this.bgmAudio.src = url;
                    }
                }
            } else {
                // No cache support
                this.bgmAudio.src = url;
            }

            this.bgmAudio.play().catch(e => console.warn("BGM Auto-play blocked:", e));

        } catch (err) {
            console.error("BGM Cache Error:", err);
            // Fallback
            this.bgmAudio.src = url;
            this.bgmAudio.play().catch(e => console.warn("BGM Auto-play blocked:", e));
        }
    }

    initBGM() {
        // Called by app.js on start
        if (this.bgmEnabled && this.bgmAudio.paused) {
            this.playRandomTrack();
        }
    }

    isBGMEnabled() {
        return this.bgmEnabled;
    }

    // --- END BGM ---

    selectClickPack(packId) {
        if (this.clickPacks[packId]) {
            this.selectedClickPack = packId;
            this.savePreference('clickSoundPack', packId);
        }
    }

    selectAlertPack(packId) {
        if (this.alertPacks[packId]) {
            this.selectedAlertPack = packId;
            this.savePreference('alertSoundPack', packId);
        }
    }

    playClick() {
        if (this.clickSoundEnabled && this.clickPacks[this.selectedClickPack]) {
            this.clickPacks[this.selectedClickPack].play();
        }
    }

    playSuccess() {
        if (this.alertSoundEnabled && this.alertPacks[this.selectedAlertPack]) {
            this.alertPacks[this.selectedAlertPack].play();
        }
    }

    playError() {
        if (this.alertSoundEnabled) {
            this.audioGen.playError();
        }
    }

    // Preview sounds (now respect enabled state)
    previewClickPack(packId) {
        if (this.clickSoundEnabled && this.clickPacks[packId]) {
            this.clickPacks[packId].play();
        }
    }

    previewAlertPack(packId) {
        if (this.alertSoundEnabled && this.alertPacks[packId]) {
            this.alertPacks[packId].play();
        }
    }

    getClickPacks() {
        return this.clickPacks;
    }

    getAlertPacks() {
        return this.alertPacks;
    }

    getSelectedClickPack() {
        return this.selectedClickPack;
    }

    getSelectedAlertPack() {
        return this.selectedAlertPack;
    }

    isClickSoundEnabled() {
        return this.clickSoundEnabled;
    }

    isAlertSoundEnabled() {
        return this.alertSoundEnabled;
    }
}

// Export for global use
window.soundManager = new SoundManager();

console.log('🔊 Sound Manager loaded with', Object.keys(window.soundManager.clickPacks).length, 'click sounds and', Object.keys(window.soundManager.alertPacks).length, 'alert sounds');
