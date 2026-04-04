/**
 * js/admin.js — Admin Dashboard logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // ── Security Check ───────────────────────────────────────────────────────
    if (!token || !user || user.role !== 'admin') {
        alert('Access Denied. Admins only.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('adminName').textContent = `Hello, ${user.first_name}`;

    // ── Navigation Logic ──────────────────────────────────────────────────────
    const tabs = document.querySelectorAll('.sidebar li');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === target) content.classList.add('active');
            });

            if (target === 'overview') fetchStats();
            if (target === 'users') fetchUsers();
            if (target === 'doubts') fetchDoubts();
        });
    });

    document.getElementById('backToApp').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    // ── API Fetchers ──────────────────────────────────────────────────────────
    async function fetchStats() {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            document.getElementById('totalUsers').textContent = data.users;
            document.getElementById('totalDoubts').textContent = data.doubts;
            document.getElementById('totalComments').textContent = data.comments;
        } catch (err) {
            console.error('Stats fetch error:', err);
        }
    }

    async function fetchUsers() {
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const users = await res.json();
            
            const tbody = document.getElementById('userTableBody');
            tbody.innerHTML = '';

            users.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.first_name} ${u.last_name}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td><span class="role-badge ${u.role}">${u.role}</span></td>
                    <td>${u.stars}</td>
                    <td>${new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteUser(${u.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Users fetch error:', err);
        }
    }

    async function fetchDoubts() {
        try {
            const res = await fetch('/api/admin/doubts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const doubts = await res.json();
            
            const tbody = document.getElementById('doubtTableBody');
            tbody.innerHTML = '';

            doubts.forEach(d => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${d.asker_username}</td>
                    <td>${d.subject}</td>
                    <td>${d.question ? d.question.substring(0, 50) : ''}...</td>
                    <td>${new Date(d.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteDoubt(${d.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Doubts fetch error:', err);
        }
    }

    // ── Action Handlers ───────────────────────────────────────────────────────
    window.deleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user? This action is IRREVERSIBLE.')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) alert(data.error);
            else fetchUsers();
        } catch (err) {
            console.error('Delete user error:', err);
        }
    };

    window.deleteDoubt = async (id) => {
        if (!confirm('Are you sure you want to delete this doubt?')) return;
        try {
            const res = await fetch(`/api/admin/doubts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) alert(data.error);
            else fetchDoubts();
        } catch (err) {
            console.error('Delete doubt error:', err);
        }
    }

    // Initial Load
    fetchStats();
});
