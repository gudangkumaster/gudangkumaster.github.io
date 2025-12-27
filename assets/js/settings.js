// Initialize Settings Page
window.initSettings = function () {
    const soundManager = window.soundManager;
    if (!soundManager) {
        console.warn('Sound manager not loaded yet');
        return;
    }

    console.log('🎵 Initializing settings page...');

    // Initialize toggles from soundManager (Source of Truth)
    const clickToggleEl = document.getElementById('click-sound-toggle');
    const alertToggleEl = document.getElementById('alert-sound-toggle');

    if (clickToggleEl) {
        const isEnabled = soundManager.isClickSoundEnabled();
        clickToggleEl.checked = isEnabled;
        applyClickSoundVisualState(isEnabled);
    }

    if (alertToggleEl) {
        const isEnabled = soundManager.isAlertSoundEnabled();
        alertToggleEl.checked = isEnabled;
        applyAlertSoundVisualState(isEnabled);
        applyAlertSoundVisualState(isEnabled);
    }

    const bgmToggleEl = document.getElementById('bgm-toggle');
    if (bgmToggleEl) {
        bgmToggleEl.checked = soundManager.isBGMEnabled();
    }

    // Initialize Click Sound Pack Radios
    const clickPacks = soundManager.getClickPacks();
    const selectedClickPack = soundManager.getSelectedClickPack();

    Object.keys(clickPacks).forEach(packId => {
        const radio = document.querySelector(`input[name="click-sound-pack"][value="${packId}"]`);
        if (radio) {
            radio.checked = (packId === selectedClickPack);
        }
    });

    // Initialize Alert Sound Pack Radios
    const alertPacks = soundManager.getAlertPacks();
    const selectedAlertPack = soundManager.getSelectedAlertPack();

    Object.keys(alertPacks).forEach(packId => {
        const radio = document.querySelector(`input[name="alert-sound-pack"][value="${packId}"]`);
        if (radio) {
            radio.checked = (packId === selectedAlertPack);
        }
    });

    // Update Storage Usage
    updateStorageUsage();

    // Init Home Settings UI
    if (window.initHomeSettingsUI) window.initHomeSettingsUI();

    // Clear Cache Listener
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
        clearCacheBtn.onclick = () => {
            if (window.showAppConfirm) {
                window.showAppConfirm("HAPUS SEMUA DATA", "Yakin ingin menghapus semua data? Transaksi dan pengaturan akan di-reset.", () => {
                    localStorage.clear();
                    if (window.showAppModal) {
                        window.showAppModal("BERHASIL", "Data & Cache berhasil dihapus!");
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        alert('✅ Data & Cache berhasil dihapus!');
                        location.reload();
                    }
                });
            } else {
                if (confirm('Yakin ingin menghapus semua data? Transaksi dan pengaturan akan di-reset.')) {
                    localStorage.clear();
                    location.reload();
                }
            }
        };
    }

    console.log('✅ Settings initialized - Click:', selectedClickPack, '| Alert:', selectedAlertPack);
};

// Helper: Update Storage Usage Display
async function updateStorageUsage() {
    const usageEl = document.getElementById('storage-usage');
    if (!usageEl) return;

    let totalBytes = 0;

    // 1. LocalStorage Calculation
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalBytes += ((localStorage[key].length + key.length) * 2);
        }
    }

    // 2. Cache API & Other Storage (if supported)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const estimate = await navigator.storage.estimate();
            if (estimate.usage && estimate.usage > 0) {
                totalBytes = estimate.usage;
            }
        } catch (e) {
            console.warn('Storage estimate failed:', e);
        }
    }

    // Fallback: If estimate is 0 (likely file:// protocol or unsecure context), 
    // manually calculate known caches
    if (totalBytes === 0 && 'caches' in window) {
        try {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                const cache = await caches.open(name);
                const requests = await cache.keys();
                for (const request of requests) {
                    const response = await cache.match(request);
                    if (response) {
                        const blob = await response.blob();
                        totalBytes += blob.size;
                    }
                }
            }
        } catch (e) {
            console.warn('Manual cache calculation failed:', e);
        }
    }

    // formatting
    let displayText = '0 KB';
    if (totalBytes > 1024 * 1024) {
        displayText = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
        displayText = `${(totalBytes / 1024).toFixed(2)} KB`;
    }

    usageEl.textContent = displayText;
}

// Internal Helper for Click Sound Visuals
function applyClickSoundVisualState(enabled) {
    const clickPackSelector = document.querySelectorAll('input[name="click-sound-pack"]');
    clickPackSelector.forEach(radio => {
        radio.disabled = !enabled;
        const option = radio.closest('.sound-pack-option');
        if (option) {
            option.style.opacity = enabled ? '1' : '0.4';
            option.style.pointerEvents = enabled ? 'auto' : 'none';
            option.style.filter = enabled ? 'none' : 'grayscale(1)';
        }
    });
}

// Internal Helper for Alert Sound Visuals
function applyAlertSoundVisualState(enabled) {
    const alertPackSelector = document.querySelectorAll('input[name="alert-sound-pack"]');
    alertPackSelector.forEach(radio => {
        radio.disabled = !enabled;
        const option = radio.closest('.sound-pack-option');
        if (option) {
            option.style.opacity = enabled ? '1' : '0.4';
            option.style.pointerEvents = enabled ? 'auto' : 'none';
            option.style.filter = enabled ? 'none' : 'grayscale(1)';
        }
    });
}

// Toggle Click Sound (Called from HTML onchange)
window.toggleClickSound = function (enabled) {
    if (window.soundManager) {
        window.soundManager.toggleClickSound(enabled);
    }
    applyClickSoundVisualState(enabled);
    console.log('🔊 Click sound:', enabled ? 'enabled' : 'disabled');
};

// Toggle Alert Sound (Called from HTML onchange)
window.toggleAlertSound = function (enabled) {
    if (window.soundManager) {
        window.soundManager.toggleAlertSound(enabled);
    }
    applyAlertSoundVisualState(enabled);
    console.log('🔔 Alert sound:', enabled ? 'enabled' : 'disabled');
};

// Toggle BGM (Called from HTML onchange)
window.toggleBGM = function (enabled) {
    if (window.soundManager) {
        window.soundManager.toggleBGM(enabled);
    }
    console.log('🎵 BGM:', enabled ? 'playing' : 'paused');
};

// --- Home Visibility Logic ---
const DEFAULT_HOME_CONFIG = {
    stats: true,
    recent: true,
    budget: true,
    analytics: true
};

function getHomeConfig() {
    try {
        const stored = localStorage.getItem('home_config');
        return stored ? { ...DEFAULT_HOME_CONFIG, ...JSON.parse(stored) } : DEFAULT_HOME_CONFIG;
    } catch (e) {
        return DEFAULT_HOME_CONFIG;
    }
}

window.toggleHomeSection = function (section, isVisible) {
    const config = getHomeConfig();
    config[section] = isVisible;
    localStorage.setItem('home_config', JSON.stringify(config));
    console.log(`👁️ Toggle ${section}:`, isVisible);

    // Apply immediately if elements exist (SPA)
    // We can assume Home View elements might be in DOM or not.
    // We'll use a global Apply function.
    if (window.applyHomeSettings) window.applyHomeSettings();
};

window.applyHomeSettings = function () {
    console.log('👁️ Applying Home Visibility Settings');
    const config = getHomeConfig();
    const map = {
        stats: 'section-stats',
        recent: 'section-recent',
        budget: 'section-budget',
        analytics: 'section-analytics'
    };

    Object.keys(map).forEach(key => {
        const el = document.getElementById(map[key]);
        if (el) {
            if (config[key]) {
                el.style.display = ''; // Reset to default (block/flex)
            } else {
                el.style.display = 'none';
            }
        }
    });
};

window.initHomeSettingsUI = function () {
    const config = getHomeConfig();
    // Set checkboxes
    const map = {
        stats: 'toggle-section-stats',
        recent: 'toggle-section-recent',
        budget: 'toggle-section-budget',
        analytics: 'toggle-section-analytics'
    };

    Object.keys(map).forEach(key => {
        const el = document.getElementById(map[key]);
        if (el) el.checked = config[key];
    });
};

// Budget Config Removed per user request


// Initialize on DOMContentLoaded (for direct file access)
document.addEventListener('DOMContentLoaded', () => {
    window.initSettings();
});
