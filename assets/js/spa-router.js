// Simple SPA Router - No Reload Navigation
class SPARouter {
    constructor() {
        this.routes = {
            '/': 'home',
            '/home': 'home',
            '/settings': 'settings',
            '/todo': 'todo'
        };

        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
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

        // Load initial page based on URL
        const path = window.location.pathname;
        const page = this.routes[path] || 'home';
        this.loadPage(page, false);
    }

    navigate(route) {
        const page = this.routes[route] || 'home';

        // Update URL
        history.pushState({ page }, '', route);

        // Load page
        this.loadPage(page, true);
    }

    async loadPage(page, playSound = true) {
        if (this.currentPage === page) return;

        // Play click sound
        if (playSound && window.soundManager) {
            window.soundManager.playClick();
        }

        const container = document.getElementById('app-container');
        if (!container) return;

        // Update active nav
        this.updateActiveNav(page);

        // Instant transition (no animation)
        switch (page) {
            case 'home':
                await this.loadHomePage(container);
                break;
            case 'settings':
                await this.loadSettingsPage(container);
                break;
            case 'todo':
                await this.loadTodoPage(container);
                break;
        }

        this.currentPage = page;
    }

    async loadHomePage(container) {
        // Home page is already in the HTML, just show it
        const homeContent = document.getElementById('home-content');
        const settingsContent = document.getElementById('settings-content');
        const statsContent = document.getElementById('stats-content');

        if (homeContent) homeContent.style.display = 'block';
        if (settingsContent) settingsContent.style.display = 'none';
        if (statsContent) statsContent.style.display = 'none';

        // Show FAB on home page and set it to open manual transaction
        const fab = document.getElementById('fab-manual');
        if (fab) {
            fab.style.display = 'flex';
            fab.onclick = () => window.openManualModal && window.openManualModal();
        }

        // Marquee update is now handled by bills.js globally

        // Reinitialize pull-to-refresh for home
        if (window.initHomePTR) {
            window.initHomePTR();
        }
    }

    async loadSettingsPage(container) {
        const homeContent = document.getElementById('home-content');
        const settingsContent = document.getElementById('settings-content');
        const statsContent = document.getElementById('stats-content');

        if (homeContent) homeContent.style.display = 'none';
        if (statsContent) statsContent.style.display = 'none';

        // Hide FAB on settings page
        const fab = document.getElementById('fab-manual');
        if (fab) fab.style.display = 'none';

        if (settingsContent) {
            settingsContent.style.display = 'block';

            // Load settings content (always re-fetch to ensure updates are applied)
            try {
                const response = await fetch('settings.html?t=' + Date.now());
                const html = await response.text();

                // Extract body content from settings.html
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const settingsSection = doc.querySelector('.settings-content');

                if (settingsSection) {
                    settingsContent.innerHTML = settingsSection.outerHTML;
                    settingsContent.setAttribute('data-loaded', 'true');
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
                settingsContent.innerHTML = '<div class="container mt-3"><div class="card"><div class="card-body text-center p-5"><h2>⚙️ PENGATURAN</h2><p class="mt-3">Gagal memuat halaman pengaturan...</p></div></div></div>';
            }
        }

        // Marquee update is now handled by bills.js globally

        // Disable Pull-to-Refresh for Settings
        if (window.disablePTR) {
            window.disablePTR();
        }

        // Reinitialize settings page
        if (window.initSettings) {
            window.initSettings();
        }
    }

    async loadTodoPage(container) {
        const homeContent = document.getElementById('home-content');
        const settingsContent = document.getElementById('settings-content');
        const statsContent = document.getElementById('stats-content');

        if (homeContent) homeContent.style.display = 'none';
        if (settingsContent) settingsContent.style.display = 'none';

        // Show FAB for todo and set it to open bill modal
        const fab = document.getElementById('fab-manual');
        if (fab) {
            fab.style.display = 'flex';
            fab.onclick = () => window.openBillModal && window.openBillModal();
        }

        if (statsContent) {
            statsContent.style.display = 'block';
            try {
                const response = await fetch('todo.html');
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const content = doc.getElementById('todo-content');

                if (content) {
                    statsContent.innerHTML = content.outerHTML;
                } else {
                    statsContent.innerHTML = html; // Fallback
                }
            } catch (error) {
                console.error('Failed to load todo.html:', error);
                statsContent.innerHTML = '<div class="container mt-3"><p>Error loading To-Do page.</p></div>';
            }
        }

        // Marquee update is now handled by bills.js globally

        // Initialize Todo Logic
        if (window.initBills) {
            window.initBills();
        }

        // Disable PTR for Todo (prevent accidental refresh)
        if (window.disablePTR) {
            window.disablePTR();
        }
    }

    updateActiveNav(page) {
        const navItems = document.querySelectorAll('.nav-item-enhanced');
        navItems.forEach(item => {
            item.classList.remove('active');
            const label = item.getAttribute('data-label');
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
