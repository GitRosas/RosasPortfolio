/* Dashboard logic — talks to api.joaomiguelrosa.com */
(function () {
  const API = 'https://api.joaomiguelrosa.com';
  const greeting = document.getElementById('dash-greeting');

  async function api(path, opts) {
    opts = opts || {};
    opts.credentials = 'include';
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const r = await fetch(API + path, opts);
    const ct = r.headers.get('Content-Type') || '';
    const data = ct.includes('application/json') ? await r.json().catch(() => null) : null;
    if (!r.ok) {
      const msg = (data && (data.error || data.message)) || ('HTTP ' + r.status);
      const err = new Error(msg);
      err.status = r.status;
      err.body = data;
      throw err;
    }
    return { data, headers: r.headers, status: r.status };
  }

  let me = null;
  let allMessages = [];

  async function init() {
    try {
      const { data } = await api('/me');
      if (!data || !data.authenticated) {
        window.location.href = '/login.html';
        return;
      }
      me = data;
      greeting.textContent = 'Welcome, ' + (me.email || 'owner') + '.';
    } catch (e) {
      greeting.textContent = 'Auth failed.';
      window.location.href = '/login.html';
      return;
    }
    setupTabs();
    setupModal();
    loadStats();
    loadProjects();
    loadMessages();
    loadNotes();
  }

  /* ---------- Tabs ---------- */
  function setupTabs() {
    document.querySelectorAll('.dash-tab').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('.dash-tab').forEach(x => x.classList.remove('is-active'));
        document.querySelectorAll('.dash-panel').forEach(x => x.classList.remove('is-active'));
        t.classList.add('is-active');
        document.querySelector('.dash-panel[data-panel="' + t.dataset.tab + '"]').classList.add('is-active');
      });
    });
  }

  /* ---------- Modal ---------- */
  const modal = document.getElementById('dash-modal');
  const modalTitle = document.getElementById('dash-modal-title');
  const modalBody = document.getElementById('dash-modal-body');
  function openModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.hidden = false;
  }
  function closeModal() { modal.hidden = true; modalBody.innerHTML = ''; }
  function setupModal() {
    modal.addEventListener('click', e => { if (e.target.dataset.close !== undefined) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  }

  /* ---------- Helpers ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
  const fmtDate = ts => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString();
  };

  /* ---------- STATS ---------- */
  async function loadStats() {
    try {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const sinceQ = '&created_at=gte.' + encodeURIComponent(since);
      const [total, msgsUnread, msgsRead, pubProj, draftProj, pageviews, logins, registers, contacts, cvDls, ipsRes, recent] = await Promise.all([
        countQuery('events', ''),
        countQuery('contact_messages', '?is_read=eq.false'),
        countQuery('contact_messages', '?is_read=eq.true'),
        countQuery('projects', '?status=eq.published'),
        countQuery('projects', '?status=eq.draft'),
        countQuery('events', '?type=eq.pageview' + sinceQ),
        countQuery('events', '?type=eq.login' + sinceQ),
        countQuery('events', '?type=eq.register' + sinceQ),
        countQuery('events', '?type=eq.contact_submit' + sinceQ),
        countQuery('events', '?type=eq.cv_download' + sinceQ),
        api('/db/events?select=ip&type=eq.pageview' + sinceQ + '&ip=not.is.null&limit=10000'),
        api('/db/events?select=type,path,referrer,session_id,user_id,ip,country,user_agent,meta,created_at&type=neq.pageview&order=created_at.desc&limit=50')
      ]);
      const ipSet = new Set();
      (ipsRes.data || []).forEach(r => { if (r.ip) ipSet.add(r.ip); });
      setText('kpi-events', total);
      setText('kpi-msg-unread', msgsUnread);
      setText('kpi-msg-read', msgsRead);
      setText('kpi-proj-pub', pubProj);
      setText('kpi-proj-draft', draftProj);
      setText('kpi-pageviews', pageviews);
      setText('kpi-visitors', ipSet.size);
      setText('kpi-logins', logins);
      setText('kpi-register', registers);
      setText('kpi-contacts', contacts);
      setText('kpi-cv', cvDls);

      const ul = document.getElementById('recent-events');
      const events = recent.data || [];
      if (!events.length) {
        ul.innerHTML = '<li class="dash-empty">No events yet.</li>';
      } else {
        ul.innerHTML = events.map(renderEventRow).join('');
      }

      const badge = document.getElementById('msg-unread-badge');
      if (msgsUnread > 0) { badge.textContent = msgsUnread; badge.hidden = false; } else { badge.hidden = true; }
    } catch (e) {
      console.error('stats failed', e);
    }
  }

  function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

  function renderEventRow(e) {
    const meta = e.meta || {};
    const kindBadge = meta.kind ? ' <span class="ev-kind">' + esc(meta.kind) + '</span>' : '';
    const who = e.user_id ? ('user:' + String(e.user_id).slice(0, 8)) : (e.session_id ? ('sess:' + String(e.session_id).slice(0, 8)) : 'anon');
    const ip = e.ip ? esc(e.ip) : '\u2014';
    const country = e.country ? ' ' + esc(e.country) : '';
    const path = e.path ? esc(e.path) : '';
    const ua = e.user_agent ? esc(String(e.user_agent).slice(0, 40)) : '';
    return '<li class="ev-row">' +
      '<span class="ev-type ev-' + esc(e.type) + '">' + esc(e.type) + '</span>' + kindBadge +
      ' <span class="ev-path">' + path + '</span>' +
      ' <span class="ev-ip" title="IP">' + ip + country + '</span>' +
      ' <span class="ev-who">' + esc(who) + '</span>' +
      (ua ? ' <span class="ev-ua" title="' + ua + '">' + ua + '</span>' : '') +
      ' <span class="meta">' + fmtDate(e.created_at) + '</span>' +
    '</li>';
  }

  async function countQuery(table, qs) {
    const r = await fetch(API + '/db/' + table + qs, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Prefer': 'count=exact', 'Range': '0-0' }
    });
    const range = r.headers.get('Content-Range') || '';
    const m = range.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }

  /* ---------- PROJECTS ---------- */
  async function loadProjects() {
    const list = document.getElementById('projects-list');
    list.innerHTML = '<p>Loading…</p>';
    try {
      const { data } = await api('/db/projects?select=*&order=sort_order.asc,created_at.desc');
      if (!data || !data.length) {
        list.innerHTML = '<p class="dash-empty">No projects yet. Click "+ New" to create one.</p>';
        return;
      }
      list.innerHTML = data.map(p => projectItem(p)).join('');
      list.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openProjectForm(JSON.parse(b.dataset.edit))));
      list.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => deleteProject(b.dataset.delete)));
      list.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => toggleProjectStatus(JSON.parse(b.dataset.toggle))));
    } catch (e) {
      list.innerHTML = '<p class="dash-error">Failed to load: ' + esc(e.message) + '</p>';
    }
  }

  function projectItem(p) {
    const tags = (p.tags || []).map(t => '<span class="dash-tag">' + esc(t) + '</span>').join('');
    return '<div class="dash-list-item">' +
      '<div style="flex:1;min-width:0;">' +
        '<h4>' + esc(p.title) + ' <span class="dash-status ' + esc(p.status) + '">' + esc(p.status) + '</span></h4>' +
        '<div class="meta">' + esc(p.slug) + ' • updated ' + fmtDate(p.updated_at) + '</div>' +
        (p.description ? '<div class="body">' + esc(p.description) + '</div>' : '') +
        (tags ? '<div style="margin-top:.5rem;">' + tags + '</div>' : '') +
      '</div>' +
      '<div class="actions">' +
        '<button data-toggle=\'' + esc(JSON.stringify({id:p.id,status:p.status})) + '\'>' + (p.status === 'published' ? 'Unpublish' : 'Publish') + '</button>' +
        '<button data-edit=\'' + esc(JSON.stringify(p)) + '\'>Edit</button>' +
        '<button class="danger" data-delete="' + esc(p.id) + '">Delete</button>' +
      '</div>' +
    '</div>';
  }

  function openProjectForm(p) {
    p = p || {};
    const isEdit = !!p.id;
    const html =
      '<form class="dash-form" id="proj-form">' +
        '<label>Title<input name="title" required value="' + esc(p.title || '') + '"></label>' +
        '<label>Slug<input name="slug" required value="' + esc(p.slug || '') + '" pattern="[a-z0-9-]+"></label>' +
        '<label>Description<textarea name="description">' + esc(p.description || '') + '</textarea></label>' +
        '<label>Body (Markdown)<textarea name="body_md" rows="8">' + esc(p.body_md || '') + '</textarea></label>' +
        '<label>Cover URL<input name="cover_url" type="url" value="' + esc(p.cover_url || '') + '"></label>' +
        '<label>Tags (comma separated)<input name="tags" value="' + esc((p.tags || []).join(', ')) + '"></label>' +
        '<label>Status<select name="status"><option value="draft"' + (p.status === 'draft' ? ' selected' : '') + '>Draft</option><option value="published"' + (p.status === 'published' ? ' selected' : '') + '>Published</option></select></label>' +
        '<label>Sort order<input name="sort_order" type="number" value="' + (p.sort_order || 0) + '"></label>' +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline" data-close>Cancel</button>' +
          '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Save' : 'Create') + '</button>' +
        '</div>' +
      '</form>';
    openModal(isEdit ? 'Edit project' : 'New project', html);
    document.getElementById('proj-form').addEventListener('submit', async ev => {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      const payload = {
        title: fd.get('title').trim(),
        slug: fd.get('slug').trim(),
        description: fd.get('description').trim() || null,
        body_md: fd.get('body_md').trim() || null,
        cover_url: fd.get('cover_url').trim() || null,
        tags: fd.get('tags').split(',').map(s => s.trim()).filter(Boolean),
        status: fd.get('status'),
        sort_order: parseInt(fd.get('sort_order') || '0', 10)
      };
      try {
        if (isEdit) {
          await api('/db/projects?id=eq.' + encodeURIComponent(p.id), {
            method: 'PATCH',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(payload)
          });
        } else {
          payload.owner_id = me.id;
          await api('/db/projects', {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(payload)
          });
        }
        closeModal();
        loadProjects();
        loadStats();
      } catch (e) {
        alert('Failed: ' + e.message);
      }
    });
  }

  async function toggleProjectStatus(o) {
    const newStatus = o.status === 'published' ? 'draft' : 'published';
    try {
      await api('/db/projects?id=eq.' + encodeURIComponent(o.id), {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ status: newStatus })
      });
      loadProjects(); loadStats();
    } catch (e) { alert('Failed: ' + e.message); }
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await api('/db/projects?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
      loadProjects(); loadStats();
    } catch (e) { alert('Failed: ' + e.message); }
  }

  document.getElementById('btn-new-project').addEventListener('click', () => openProjectForm());

  /* ---------- MESSAGES ---------- */
  async function loadMessages() {
    const list = document.getElementById('messages-list');
    list.innerHTML = '<p>Loading…</p>';
    try {
      const { data } = await api('/db/contact_messages?select=*&order=created_at.desc&limit=200');
      allMessages = data || [];
      if (!allMessages.length) {
        list.innerHTML = '<p class="dash-empty">No messages yet.</p>';
        return;
      }
      list.innerHTML = allMessages.map(m => messageItem(m)).join('');
      list.querySelectorAll('[data-mark-read]').forEach(b => b.addEventListener('click', () => markRead(b.dataset.markRead)));
      list.querySelectorAll('[data-delete-msg]').forEach(b => b.addEventListener('click', () => deleteMessage(b.dataset.deleteMsg)));
    } catch (e) {
      list.innerHTML = '<p class="dash-error">Failed to load: ' + esc(e.message) + '</p>';
    }
  }

  function messageItem(m) {
    return '<div class="dash-list-item ' + (m.is_read ? '' : 'is-unread') + '">' +
      '<div style="flex:1;min-width:0;">' +
        '<h4>' + esc(m.name) + ' &lt;' + esc(m.email) + '&gt;' + (m.subject ? ' — ' + esc(m.subject) : '') + '</h4>' +
        '<div class="meta">' + fmtDate(m.created_at) + (m.is_read ? '' : ' • <strong>UNREAD</strong>') + '</div>' +
        '<div class="body">' + esc(m.body) + '</div>' +
      '</div>' +
      '<div class="actions">' +
        (m.is_read ? '' : '<button data-mark-read="' + esc(m.id) + '">Mark read</button>') +
        '<button class="danger" data-delete-msg="' + esc(m.id) + '">Delete</button>' +
      '</div>' +
    '</div>';
  }

  async function markRead(id) {
    try {
      await api('/db/contact_messages?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ is_read: true })
      });
      loadMessages(); loadStats();
    } catch (e) { alert('Failed: ' + e.message); }
  }

  async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
      await api('/db/contact_messages?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
      loadMessages(); loadStats();
    } catch (e) { alert('Failed: ' + e.message); }
  }

  document.getElementById('btn-refresh-messages').addEventListener('click', () => { loadMessages(); loadStats(); });

  /* ---------- NOTES ---------- */
  async function loadNotes() {
    const list = document.getElementById('notes-list');
    list.innerHTML = '<p>Loading…</p>';
    try {
      const { data } = await api('/db/notes?select=*&order=pinned.desc,updated_at.desc');
      if (!data || !data.length) {
        list.innerHTML = '<p class="dash-empty">No notes yet.</p>';
        return;
      }
      list.innerHTML = data.map(n => noteItem(n)).join('');
      list.querySelectorAll('[data-edit-note]').forEach(b => b.addEventListener('click', () => openNoteForm(JSON.parse(b.dataset.editNote))));
      list.querySelectorAll('[data-pin]').forEach(b => b.addEventListener('click', () => togglePin(JSON.parse(b.dataset.pin))));
      list.querySelectorAll('[data-delete-note]').forEach(b => b.addEventListener('click', () => deleteNote(b.dataset.deleteNote)));
    } catch (e) {
      list.innerHTML = '<p class="dash-error">Failed to load: ' + esc(e.message) + '</p>';
    }
  }

  function noteItem(n) {
    return '<div class="dash-list-item">' +
      '<div style="flex:1;min-width:0;">' +
        '<h4>' + (n.pinned ? '📌 ' : '') + esc(n.title || '(no title)') + '</h4>' +
        '<div class="meta">updated ' + fmtDate(n.updated_at) + '</div>' +
        (n.body_md ? '<div class="body">' + esc(n.body_md) + '</div>' : '') +
      '</div>' +
      '<div class="actions">' +
        '<button data-pin=\'' + esc(JSON.stringify({id:n.id, pinned:n.pinned})) + '\'>' + (n.pinned ? 'Unpin' : 'Pin') + '</button>' +
        '<button data-edit-note=\'' + esc(JSON.stringify(n)) + '\'>Edit</button>' +
        '<button class="danger" data-delete-note="' + esc(n.id) + '">Delete</button>' +
      '</div>' +
    '</div>';
  }

  function openNoteForm(n) {
    n = n || {};
    const isEdit = !!n.id;
    const html =
      '<form class="dash-form" id="note-form">' +
        '<label>Title<input name="title" value="' + esc(n.title || '') + '"></label>' +
        '<label>Body (Markdown)<textarea name="body_md" rows="10">' + esc(n.body_md || '') + '</textarea></label>' +
        '<label><input type="checkbox" name="pinned"' + (n.pinned ? ' checked' : '') + '> Pinned</label>' +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline" data-close>Cancel</button>' +
          '<button type="submit" class="btn btn-primary">' + (isEdit ? 'Save' : 'Create') + '</button>' +
        '</div>' +
      '</form>';
    openModal(isEdit ? 'Edit note' : 'New note', html);
    document.getElementById('note-form').addEventListener('submit', async ev => {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      const payload = {
        title: fd.get('title').trim() || null,
        body_md: fd.get('body_md').trim() || null,
        pinned: fd.get('pinned') === 'on'
      };
      try {
        if (isEdit) {
          await api('/db/notes?id=eq.' + encodeURIComponent(n.id), {
            method: 'PATCH',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(payload)
          });
        } else {
          payload.owner_id = me.id;
          await api('/db/notes', {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(payload)
          });
        }
        closeModal();
        loadNotes();
      } catch (e) { alert('Failed: ' + e.message); }
    });
  }

  async function togglePin(o) {
    try {
      await api('/db/notes?id=eq.' + encodeURIComponent(o.id), {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ pinned: !o.pinned })
      });
      loadNotes();
    } catch (e) { alert('Failed: ' + e.message); }
  }

  async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    try {
      await api('/db/notes?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
      loadNotes();
    } catch (e) { alert('Failed: ' + e.message); }
  }

  document.getElementById('btn-new-note').addEventListener('click', () => openNoteForm());

  /* ---------- Boot ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
