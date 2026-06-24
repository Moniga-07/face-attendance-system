/**
 * DOM Utilities - Vanilla JavaScript DOM manipulation helpers.
 * Demonstrates client-side DOM scripting (Course Topic 3).
 */

const DOM = {
    /**
     * Select a single element
     */
    select: (selector) => document.querySelector(selector),

    /**
     * Select all matching elements
     */
    selectAll: (selector) => document.querySelectorAll(selector),

    /**
     * Create an element with attributes and children
     */
    create: (tag, attrs = {}, children = []) => {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([key, val]) => {
            if (key === 'className') el.className = val;
            else if (key === 'innerHTML') el.innerHTML = val;
            else if (key === 'textContent') el.textContent = val;
            else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
            else el.setAttribute(key, val);
        });
        children.forEach(child => {
            if (typeof child === 'string') el.appendChild(document.createTextNode(child));
            else if (child) el.appendChild(child);
        });
        return el;
    },

    /**
     * Clear all children of an element
     */
    clear: (el) => { el.innerHTML = ''; },

    /**
     * Show/hide elements
     */
    show: (el) => el.classList.remove('hidden'),
    hide: (el) => el.classList.add('hidden'),
    toggle: (el) => el.classList.toggle('hidden'),
};

/**
 * Toast notification system
 */
const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = DOM.create('div', { className: 'toast-container', id: 'toast-container' });
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 4000) {
        this.init();

        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        const toast = DOM.create('div', { className: `toast ${type}` }, [
            DOM.create('span', { className: 'toast-icon', textContent: icons[type] || icons.info }),
            DOM.create('span', { textContent: message }),
            DOM.create('button', {
                className: 'toast-close',
                textContent: '×',
                onClick: () => this.dismiss(toast)
            })
        ]);

        this.container.appendChild(toast);

        setTimeout(() => this.dismiss(toast), duration);
    },

    dismiss(toast) {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    },

    success(msg, dur) { this.show(msg, 'success', dur); },
    error(msg, dur) { this.show(msg, 'error', dur); },
    info(msg, dur) { this.show(msg, 'info', dur); },
    warning(msg, dur) { this.show(msg, 'warning', dur); }
};

/**
 * API utility - Wrapper around fetch for servlet communication
 */
const API = {
    baseUrl: '',  // Same origin — servlets are on the same server

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    async get(url) {
        const resp = await fetch(this.baseUrl + url, { headers: this.getHeaders() });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(err.message || 'Request failed');
        }
        return resp.json();
    },

    async post(url, data) {
        const resp = await fetch(this.baseUrl + url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        const json = await resp.json().catch(() => ({ message: 'Request failed' }));
        if (!resp.ok) {
            const error = new Error(json.message || 'Request failed');
            error.status = resp.status;
            error.data = json;
            throw error;
        }
        return json;
    },

    async put(url, data) {
        const resp = await fetch(this.baseUrl + url, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(err.message || 'Request failed');
        }
        return resp.json();
    },

    async delete(url) {
        const resp = await fetch(this.baseUrl + url, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(err.message || 'Request failed');
        }
        return resp.json();
    }
};

/**
 * Auth utility
 */
const Auth = {
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    getToken() {
        return localStorage.getItem('token');
    },

    login(token, username) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'jsp/login.jsp';
    },

    getUsername() {
        return localStorage.getItem('username') || 'Admin';
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'jsp/login.jsp';
            return false;
        }
        return true;
    }
};

/**
 * Date formatting helpers
 */
const DateUtil = {
    today() {
        const d = new Date();
        return d.toISOString().split('T')[0];
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    formatTime(timeStr) {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        const h = parseInt(parts[0]);
        const m = parts[1];
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    },

    nowTime() {
        const d = new Date();
        return d.toTimeString().split(' ')[0];
    }
};

/**
 * Dynamic table renderer using DOM manipulation
 */
function renderTable(containerId, columns, data, actions = null) {
    const container = document.getElementById(containerId);
    DOM.clear(container);

    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <p>No records found</p>
            </div>`;
        return;
    }

    const table = DOM.create('table', { className: 'data-table' });

    // Header
    const thead = DOM.create('thead');
    const headerRow = DOM.create('tr');
    columns.forEach(col => {
        headerRow.appendChild(DOM.create('th', { textContent: col.label }));
    });
    if (actions) {
        headerRow.appendChild(DOM.create('th', { textContent: 'Actions' }));
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = DOM.create('tbody');
    data.forEach((row, index) => {
        const tr = DOM.create('tr');
        columns.forEach(col => {
            let value = row[col.key];
            if (col.render) value = col.render(value, row);

            const td = DOM.create('td');
            if (col.html) td.innerHTML = value;
            else td.textContent = value || '-';
            tr.appendChild(td);
        });

        if (actions) {
            const actionTd = DOM.create('td', { className: 'flex gap-2' });
            actions.forEach(action => {
                const btn = DOM.create('button', {
                    className: `btn ${action.className || 'btn-ghost'}`,
                    textContent: action.label,
                    onClick: () => action.handler(row, index)
                });
                actionTd.appendChild(btn);
            });
            tr.appendChild(actionTd);
        }

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

/**
 * Modal dialog
 */
function showModal(title, contentHtml, onConfirm = null) {
    const overlay = DOM.create('div', { className: 'modal-overlay', id: 'modal-overlay' });
    const card = DOM.create('div', { className: 'modal-card' });

    card.innerHTML = `<h2>${title}</h2>${contentHtml}`;

    if (onConfirm) {
        const btnRow = DOM.create('div', { className: 'flex gap-3 mt-6 justify-between' });
        btnRow.appendChild(DOM.create('button', {
            className: 'btn btn-ghost',
            textContent: 'Cancel',
            onClick: closeModal
        }));
        btnRow.appendChild(DOM.create('button', {
            className: 'btn btn-primary',
            textContent: 'Confirm',
            onClick: () => { onConfirm(); closeModal(); }
        }));
        card.appendChild(btnRow);
    } else {
        const closeBtn = DOM.create('button', {
            className: 'btn btn-ghost mt-4',
            textContent: 'Close',
            onClick: closeModal
        });
        card.appendChild(closeBtn);
    }

    overlay.appendChild(card);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.remove();
}
