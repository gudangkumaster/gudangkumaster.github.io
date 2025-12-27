
const settingsHTML = `
<div id="settings-content">
    <div class="settings-content" style="padding: 15px; display: flex; flex-direction: column; gap: 20px;">
        <!-- Click Sound Panel -->
        <div class="card" style="margin-bottom: 0;">
            <div class="card-header"
                style="background: transparent; border-bottom: none; padding: 15px 15px 0 15px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">🖱️</span>
                    <h2
                        style="margin: 0; font-size: 1.1rem; letter-spacing: 2px; font-weight: 900; color: #555; font-family: 'Courier New', Courier, monospace;">
                        CLICK SOUNDS</h2>
                </div>
                <label class="toggle-switch" style="scale: 0.9; margin: 0;">
                    <input type="checkbox" id="click-sound-toggle"
                        onchange="window.toggleClickSound(this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="card-body" style="padding: 15px; padding-top: 5px;">
                <div class="setting-item"
                    style="flex-direction: column; align-items: flex-start; box-shadow: none; border: none; background: transparent; padding: 0; border-radius: 0;">
                    <p
                        style="margin: 0 0 15px 0; font-size: 0.85rem; opacity: 0.8; font-weight: bold; line-height: 1.4;">
                        Enable sounds when clicking buttons and navigating menus.</p>

                    <div id="click-pack-selector" class="sound-pack-options" style="width: 100%; gap: 8px;">
                        <p
                            style="font-size: 0.75rem; font-weight: 900; margin-bottom: 8px; text-transform: uppercase; opacity: 0.6;">
                            Select Variation:</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <label class="sound-pack-option"
                                style="padding: 10px; border-width: 2px; margin-bottom: 0;">
                                <input type="radio" name="click-sound-pack" value="classic"
                                    onclick="window.soundManager && window.soundManager.previewClickPack('classic')"
                                    onchange="window.soundManager && window.soundManager.selectClickPack('classic')">
                                <span class="pack-info"><strong>Classic</strong></span>
                            </label>
                            <label class="sound-pack-option"
                                style="padding: 10px; border-width: 2px; margin-bottom: 0;">
                                <input type="radio" name="click-sound-pack" value="pop"
                                    onclick="window.soundManager && window.soundManager.previewClickPack('pop')"
                                    onchange="window.soundManager && window.soundManager.selectClickPack('pop')">
                                <span class="pack-info"><strong>Pop</strong></span>
                            </label>
                            <label class="sound-pack-option"
                                style="padding: 10px; border-width: 2px; margin-bottom: 0;">
                                <input type="radio" name="click-sound-pack" value="bubble"
                                    onclick="window.soundManager && window.soundManager.previewClickPack('bubble')"
                                    onchange="window.soundManager && window.soundManager.selectClickPack('bubble')">
                                <span class="pack-info"><strong>Bubble</strong></span>
                            </label>
                            <label class="sound-pack-option"
                                style="padding: 10px; border-width: 2px; margin-bottom: 0;">
                                <input type="radio" name="click-sound-pack" value="retro"
                                    onclick="window.soundManager && window.soundManager.previewClickPack('retro')"
                                    onchange="window.soundManager && window.soundManager.selectClickPack('retro')">
                                <span class="pack-info"><strong>Retro</strong></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Alert Sound Panel -->
        <div class="card" style="margin-bottom: 0;">
            <div class="card-header"
                style="background: transparent; border-bottom: none; padding: 15px 15px 0 15px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">🔔</span>
                    <h2
                        style="margin: 0; font-size: 1.1rem; letter-spacing: 2px; font-weight: 900; color: #555; font-family: 'Courier New', Courier, monospace;">
                        ALERT SOUNDS</h2>
                </div>
                <label class="toggle-switch" style="scale: 0.9; margin: 0;">
                    <input type="checkbox" id="alert-sound-toggle"
                        onchange="window.toggleAlertSound(this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="card-body" style="padding: 15px; padding-top: 5px;">
                <div class="setting-item"
                    style="flex-direction: column; align-items: flex-start; box-shadow: none; border: none; background: transparent; padding: 0; border-radius: 0;">
                    <p
                        style="margin: 0 0 15px 0; font-size: 0.85rem; opacity: 0.8; font-weight: bold; line-height: 1.4;">
                        Sound effects for success, failure, and new transaction notifications.</p>

                    <div id="alert-pack-selector" class="sound-pack-options" style="width: 100%; gap: 8px;">
                        <p
                            style="font-size: 0.75rem; font-weight: 900; margin-bottom: 8px; text-transform: uppercase; opacity: 0.6;">
                            Select Variation:</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <label class="sound-pack-option"
                                style="padding: 10px; border-width: 2px; margin-bottom: 0;">
                                <input type="radio" name="alert-sound-pack" value="success"
                                    onclick="window.soundManager && window.soundManager.previewAlertPack('success')"
                                    onchange="window.soundManager && window.soundManager.selectAlertPack('success')">
                                <span class="pack-info"><strong>Success</strong></span>
                            </label>
                            <label class="sound-pack-option"
                                style="padding: 10px; border-width: 2px; margin-bottom: 0;">
                                <input type="radio" name="alert-sound-pack" value="donation"
                                    onclick="window.soundManager && window.soundManager.previewAlertPack('donation')"
                                    onchange="window.soundManager && window.soundManager.selectAlertPack('donation')">
                                <span class="pack-info"><strong>Chaching</strong></span>
                            </label>
                            <label class="sound-pack-option"
                                style="padding: 10px; border-width: 2px; margin-bottom: 0;">
                                <input type="radio" name="alert-sound-pack" value="hidog"
                                    onclick="window.soundManager && window.soundManager.previewAlertPack('hidog')"
                                    onchange="window.soundManager && window.soundManager.selectAlertPack('hidog')">
                                <span class="pack-info"><strong>Hi Dog!</strong></span>
                            </label>
                            <label class="sound-pack-option"
                                style="padding: 10px; border-width: 2px; margin-bottom: 0;">
                                <input type="radio" name="alert-sound-pack" value="retro"
                                    onclick="window.soundManager && window.soundManager.previewAlertPack('retro')"
                                    onchange="window.soundManager && window.soundManager.selectAlertPack('retro')">
                                <span class="pack-info"><strong>Retro</strong></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Background Music Panel -->
        <div class="card" style="margin-bottom: 0;">
            <div class="card-header"
                style="background: transparent; border-bottom: none; padding: 15px 15px 0 15px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">🎵</span>
                    <h2
                        style="margin: 0; font-size: 1.1rem; letter-spacing: 2px; font-weight: 900; color: #555; font-family: 'Courier New', Courier, monospace;">
                        BACKGROUND MUSIC</h2>
                </div>
                <label class="toggle-switch" style="scale: 0.9; margin: 0;">
                    <input type="checkbox" id="bgm-toggle"
                        onchange="window.toggleBGM(this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="card-body" style="padding: 15px; padding-top: 5px;">
                <p style="margin: 0; font-size: 0.85rem; opacity: 0.8; font-weight: bold; line-height: 1.4;">
                    Play relaxing Lo-Fi beats to stay focused.
                </p>
            </div>
        </div>

        <!-- Home Visibility Panel (New) -->
        <div class="card" style="margin-bottom: 0;">
            <div class="card-header"
                style="background: transparent; border-bottom: none; padding: 15px 15px 0 15px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">👁️</span>
                    <h2
                        style="margin: 0; font-size: 1.1rem; letter-spacing: 2px; font-weight: 900; color: #555; font-family: 'Courier New', Courier, monospace;">
                        HOME APPEARANCE</h2>
                </div>
            </div>
            <div class="card-body" style="padding: 15px; padding-top: 5px;">
                 <p style="margin: 0 0 15px 0; font-size: 0.85rem; opacity: 0.8; font-weight: bold; line-height: 1.4;">
                        Customize which sections to show on the home page.
                 </p>
                 
                 <!-- Stat Carousel -->
                 <div class="nb-flex-between mb-3">
                    <span style="font-weight: 900;">STATS CAROUSEL</span>
                    <label class="toggle-switch" style="scale: 0.8; margin: 0;">
                        <input type="checkbox" id="toggle-section-stats" onchange="window.toggleHomeSection('stats', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                 </div>

                 <!-- Transaction List -->
                 <div class="nb-flex-between mb-3">
                    <span style="font-weight: 900;">TRANSACTION HISTORY</span>
                     <label class="toggle-switch" style="scale: 0.8; margin: 0;">
                        <input type="checkbox" id="toggle-section-recent" onchange="window.toggleHomeSection('recent', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                 </div>

                 <!-- Budget Tracker -->
                 <div class="nb-flex-between mb-3">
                    <span style="font-weight: 900;">BUDGET TRACKER</span>
                     <label class="toggle-switch" style="scale: 0.8; margin: 0;">
                        <input type="checkbox" id="toggle-section-budget" onchange="window.toggleHomeSection('budget', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                 </div>
                 
                 <!-- Analytics -->
                 <div class="nb-flex-between mb-1">
                    <span style="font-weight: 900;">ANALYTICS</span>
                     <label class="toggle-switch" style="scale: 0.8; margin: 0;">
                        <input type="checkbox" id="toggle-section-analytics" onchange="window.toggleHomeSection('analytics', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                 </div>
            </div>
        </div>

        <!-- Budget Config Panel Removed -->

        <!-- Clean Memory Panel -->
        <div class="card" style="margin-bottom: 0;">
            <div class="card-header"
                style="background: transparent; border-bottom: none; padding: 15px 15px 0 15px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">🧹</span>
                    <h2
                        style="margin: 0; font-size: 1.1rem; letter-spacing: 2px; font-weight: 900; color: #555; font-family: 'Courier New', Courier, monospace;">
                        CLEAN MEMORY</h2>
                </div>
            </div>
            <div class="card-body" style="padding: 15px;">
                <div
                    style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; border-bottom: 2px dashed #000; padding-bottom: 5px;">
                    <p style="margin: 0; font-size: 0.85rem; font-weight: bold; opacity: 1;">DATA USAGE:</p>
                    <span id="storage-usage"
                        style="font-family: 'Courier New', monospace; font-weight: 900; background: #000; color: #fff; padding: 2px 8px; font-size: 0.9rem;">0.00
                        KB</span>
                </div>
                <p
                    style="font-size: 0.75rem; opacity: 0.7; margin-bottom: 15px; font-weight: bold; line-height: 1.4;">
                    Clearing memory will permanently delete all your local transaction data.</p>
                <button id="clear-cache-btn" class="btn btn-danger btn-block py-3 text-bold"
                    style="font-size: 1rem; border: 3px solid #000; box-shadow: none; background: #FF4D4D; color: white;">
                    CLEAR DATA & CACHE
                </button>
            </div>
        </div>

        <!-- Simplified Text-Only Credits -->
        <div style="padding: 40px 15px; text-align: center;">
            <p
                style="margin: 0; font-size: 0.8rem; font-weight: 900; letter-spacing: 1px; opacity: 0.6; text-transform: uppercase;">
                This web app is built using modern technologies:
            </p>
            <p style="margin: 10px 0 0 0; font-size: 0.9rem; font-weight: 900; letter-spacing: 0.5px;">
                HTML5 + CSS3 + JAVASCRIPT + FIREBASE + GEMINI AI
            </p>
        </div>
    </div>
</div>
`;

const settingsContainer = document.getElementById('page-settings');
if (settingsContainer) {
    settingsContainer.innerHTML = settingsHTML;
}
