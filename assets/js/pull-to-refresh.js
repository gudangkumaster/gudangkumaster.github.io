// Pull-to-Refresh Handler with Neobrutalism Style
class PullToRefresh {
    constructor(options = {}) {
        this.onRefresh = options.onRefresh || (() => { });
        this.threshold = options.threshold || 80;
        this.startY = 0;
        this.currentY = 0;
        this.isPulling = false;
        this.isRefreshing = false;

        this.init();
    }

    init() {
        // Create pull-to-refresh container
        this.container = document.createElement('div');
        this.container.className = 'ptr-container';
        this.container.innerHTML = `
            <div class="ptr-content">
                <div class="ptr-text">TARIK UNTUK REFRESH</div>
            </div>
        `;
        document.body.insertBefore(this.container, document.body.firstChild);

        // Bind events
        this.bindEvents();
    }

    bindEvents() {
        // Mobile touch events - Store bound functions to references for removal
        this._handleTouchStart = this.handleTouchStart.bind(this);
        this._handleTouchMove = this.handleTouchMove.bind(this);
        this._handleTouchEnd = this.handleTouchEnd.bind(this);

        document.addEventListener('touchstart', this._handleTouchStart, { passive: true });
        document.addEventListener('touchmove', this._handleTouchMove, { passive: false });
        document.addEventListener('touchend', this._handleTouchEnd);
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
        document.removeEventListener('touchstart', this._handleTouchStart);
        document.removeEventListener('touchmove', this._handleTouchMove);
        document.removeEventListener('touchend', this._handleTouchEnd);
    }

    handleTouchStart(e) {
        if (window.scrollY === 0 && !this.isRefreshing) {
            this.startY = e.touches[0].clientY;
            this.isPulling = true;
        }
    }

    handleTouchMove(e) {
        if (!this.isPulling || this.isRefreshing) return;

        this.currentY = e.touches[0].clientY;
        const pullDistance = this.currentY - this.startY;

        if (pullDistance > 0 && window.scrollY === 0) {
            e.preventDefault();

            if (pullDistance >= this.threshold) {
                this.container.classList.add('pulling');
                this.updateText('LEPAS UNTUK REFRESH');
            } else {
                this.container.classList.remove('pulling');
                this.updateText('TARIK UNTUK REFRESH');
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.isPulling || this.isRefreshing) return;

        const pullDistance = this.currentY - this.startY;

        if (pullDistance >= this.threshold) {
            this.triggerRefresh();
        } else {
            this.reset();
        }

        this.isPulling = false;
    }

    async triggerRefresh() {
        if (this.isRefreshing) return;

        this.isRefreshing = true;
        this.container.classList.add('refreshing');
        this.updateText('SEDANG REFRESH...');

        try {
            await this.onRefresh();
        } catch (error) {
            console.error('Refresh error:', error);
        }

        // Show success message briefly
        this.updateText('REFRESH BERHASIL!');

        setTimeout(() => {
            this.reset();
        }, 800);
    }

    updateText(text) {
        const textEl = this.container.querySelector('.ptr-text');
        if (textEl) textEl.textContent = text;
    }

    reset() {
        this.container.classList.remove('pulling', 'refreshing');
        this.updateText('TARIK UNTUK REFRESH');
        this.isRefreshing = false;
        this.startY = 0;
        this.currentY = 0;
    }
}

// Export for use in app.js
window.PullToRefresh = PullToRefresh;
