
const footerNavHTML = `
<!-- Enhanced Bottom Navigation -->
<div class="bottom-nav-enhanced">
    <div class="nav-items-container">
        <a href="#" class="nav-item-enhanced active" data-route="home" data-label="HOME">
            <div class="nav-icon-enhanced">🏠</div>
            <span class="nav-label">HOME</span>
        </a>
        <a href="#" id="scan-trigger" class="nav-item-enhanced" data-label="SCAN">
            <div class="nav-icon-enhanced scan-icon">📷</div>
            <span class="nav-label">SCAN</span>
        </a>
        <a href="#" class="nav-item-enhanced" data-route="todo" data-label="TODO">
            <div class="nav-icon-enhanced">📝</div>
            <span class="nav-label">TO-DO</span>
        </a>
        <a href="#" class="nav-item-enhanced" data-route="settings" data-label="SETTINGS">
            <div class="nav-icon-enhanced">⚙️</div>
            <span class="nav-label">SETTINGS</span>
        </a>
    </div>
</div>
`;

const footerContainer = document.getElementById('footer-nav-container');
if (footerContainer) {
    footerContainer.innerHTML = footerNavHTML;
}

// Prevent long-press context menu on navigation items
document.addEventListener('DOMContentLoaded', () => {
    // Need a small timeout or verify element existence because innerHTML interaction might be async-ish in some browsers/implementations logic, 
    // but here it is synchronous. However, attaching listeners might need to wait for digest.
    // Actually, since we just set innerHTML, standard DOM access works immediately.

    // We delegate or attach to the newly created elements
    const navItems = document.querySelectorAll('.nav-item-enhanced');
    navItems.forEach(item => {
        // Prevent context menu (right-click and long-press)
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Prevent text selection on long-press
        item.style.userSelect = 'none';
        item.style.webkitUserSelect = 'none';
        item.style.webkitTouchCallout = 'none';
    });
});
