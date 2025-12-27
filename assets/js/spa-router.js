// Simple SPA Router - Hash Based Navigation (Fixes Refresh 404)
class SPARouter {
    constructor() {
        this.routes = {
            '': 'home',
            '#': 'home',
            '#home': 'home',
            '#settings': 'settings',
            '#todo': 'todo'
        };

        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Handle hash changes (Back/Forward/Manual URL change)
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            const page = this.routes[hash] || 'home';
            this.loadPage(page, false);
        });

        // Intercept navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigate(route);
            }
        });

        // Load initial page based on Hash
        const hash = window.location.hash;
        const page = this.routes[hash] || 'home';

        // If no hash, force #home to be clean, but replaceState so no history spam
        if (!hash) {
            history.replaceState(null, null, '#home');
        }

        this.loadPage(page, false);
    }

    navigate(pageName) {
        // Play click sound immediately
        if (window.soundManager) {
            window.soundManager.playClick();
        }

        // Map simple names to hashes
        const hash = `#${pageName}`;

        // Update Hash (Triggers hashchange)
        window.location.hash = hash;
    }

    async loadPage(page, playSound = true) {
        // If we are already on this page generally return, BUT 
        // if user manually refreshed hash, we might need to re-init.
        // Simple optimization: check if container is already visible.

        // Play click sound
        if (playSound && window.soundManager) {
            window.soundManager.playClick();
        }

        // Update active nav
        this.updateActiveNav(page);

        // Hide all pages
        document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');

        // Show target page
        const targetId = `page-${page}`;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.style.display = 'block';
        }

        // Specific Page Logic
        switch (page) {
            case 'home':
                this.initHomePage();
                break;
            case 'settings':
                this.initSettingsPage();
                break;
            case 'todo':
                this.initTodoPage();
                break;
        }

        this.currentPage = page;
    }

    initHomePage() {
        // Show FAB for Manual Transaction
        const fab = document.getElementById('fab-manual');
        if (fab) {
            fab.style.display = 'flex';
            fab.onclick = () => window.openManualModal && window.openManualModal();
        }

        // Refresh PTR
        if (window.initHomePTR) window.initHomePTR();
    }

    initSettingsPage() {
        // Hide FAB
        const fab = document.getElementById('fab-manual');
        if (fab) fab.style.display = 'none';

        // Disable PTR
        if (window.disablePTR) window.disablePTR();

        // Init Settings Logic
        if (window.initSettings) window.initSettings();
    }

    initTodoPage() {
        // Show FAB for Bill
        const fab = document.getElementById('fab-manual');
        if (fab) {
            fab.style.display = 'flex';
            fab.onclick = () => window.openBillModal && window.openBillModal();
        }

        // Disable PTR
        if (window.disablePTR) window.disablePTR();

        // Init Bills Logic
        if (window.initBills) window.initBills();
    }

    updateActiveNav(page) {
        const navItems = document.querySelectorAll('.nav-item-enhanced');
        navItems.forEach(item => {
            item.classList.remove('active');
            let label = item.getAttribute('data-label');
            // Normalize label check
            const route = item.getAttribute('data-route') || '';

            if (
                (page === 'home' && label === 'HOME') ||
                (page === 'settings' && label === 'SETTING') ||
                (page === 'todo' && label === 'TODO')
            ) {
                item.classList.add('active');
            }
        });
    }
}

// Initialize router when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.spaRouter = new SPARouter();
    });
} else {
    window.spaRouter = new SPARouter();
}
