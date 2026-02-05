// Life Command Center - Main Application
// Part 1: Core Data & Routing

const APP_VERSION = '1.0.0';

// Supabase Configuration (anon key is safe to expose - it's a publishable key)
const SUPABASE_URL = 'https://ppjskgvdpyujxtwxrsiq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwanNrZ3ZkcHl1anh0d3hyc2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjczODQsImV4cCI6MjA4NTgwMzM4NH0.NVzQUEJi0wTnBv1_QVtG0Bsgn_7Ghxkrb1o0HheOv2Y';

const defaultData = {
    inbox: [],
    dailyGoals: [],
    academic: { curriculum: [], assignments: [] },
    research: { papers: [], whitepapers: [], patents: [] },
    brand: { asymmetric: [], hybrid: [], linkedin: [], instagram: [], prompts: [] },
    jobs: { resumes: [], applications: [] },
    upskilling: { cfa: [], gaming: [], aiagents: [], pm: [] },
    misc: { home: [], reminders: [] },
    events: { finova: [], competitions: [], 'events-items': [] },
    media: { anime: [], movies: [], shows: [], games: [], manhwa: [] },
    ideas: [],
    network: [],
    reading: { 'to-read': [], 'reading-now': [], finished: [] },
    reflections: [],
    stats: { added: 0, completed: 0, streak: 0, lastActive: null },
    settings: {}
};

// Routing keywords
const routingRules = {
    academic: {
        keywords: ['class', 'lecture', 'curriculum', 'syllabus', 'assignment', 'homework', 'professor', 'course', 'exam', 'quiz', 'semester', 'study', 'submit'],
        subsections: {
            curriculum: ['curriculum', 'syllabus', 'course', 'class'],
            assignments: ['assignment', 'homework', 'submit', 'due', 'deadline']
        }
    },
    research: {
        keywords: ['paper', 'research', 'whitepaper', 'case study', 'patent', 'journal', 'citation', 'methodology', 'hypothesis', 'study', 'analysis'],
        subsections: {
            papers: ['paper', 'research', 'journal'],
            whitepapers: ['whitepaper', 'case study', 'casestudy'],
            patents: ['patent']
        }
    },
    brand: {
        keywords: ['substack', 'asymmetric', 'hybrid economies', 'linkedin', 'instagram', 'post', 'content', 'followers', 'newsletter', 'article', 'tweet'],
        subsections: {
            asymmetric: ['asymmetric', 'asymmetric plays'],
            hybrid: ['hybrid', 'hybrid economies'],
            linkedin: ['linkedin'],
            instagram: ['instagram', 'insta', 'reel']
        }
    },
    jobs: {
        keywords: ['resume', 'job', 'application', 'interview', 'company', 'hiring', 'apply', 'offer', 'rejection', 'cover letter', 'cv'],
        subsections: {
            resumes: ['resume', 'cv'],
            applications: ['application', 'apply', 'interview', 'job', 'company']
        }
    },
    upskilling: {
        keywords: ['cfa', 'gaming economy', 'ai agent', 'product management', 'learn', 'certification', 'skill', 'pm'],
        subsections: {
            cfa: ['cfa', 'finance', 'chartered'],
            gaming: ['gaming', 'game economy', 'gaming economy'],
            aiagents: ['ai agent', 'ai agents', 'agent', 'llm'],
            pm: ['product management', 'pm', 'product']
        }
    },
    misc: {
        keywords: ['home', 'buy', 'grocery', 'remind', 'call', 'pay', 'bill', 'appointment', 'doctor', 'todo', 'task'],
        subsections: {
            home: ['home', 'buy', 'grocery', 'clean'],
            reminders: ['remind', 'reminder', 'call', 'pay', 'bill', 'appointment']
        }
    },
    events: {
        keywords: ['finova', 'fintech club', 'competition', 'hackathon', 'event', 'meetup', 'register', 'club'],
        subsections: {
            finova: ['finova', 'fintech club', 'club'],
            competitions: ['competition', 'hackathon', 'contest'],
            'events-items': ['event', 'meetup', 'conference']
        }
    },
    media: {
        keywords: ['anime', 'movie', 'show', 'series', 'game', 'manhwa', 'manga', 'watch', 'watching', 'played', 'finished watching'],
        subsections: {
            anime: ['anime', 'isekai', 'shonen', 'seinen'],
            movies: ['movie', 'film', 'cinema'],
            shows: ['show', 'series', 'tv', 'kdrama', 'drama'],
            games: ['game', 'played', 'gaming', 'playing'],
            manhwa: ['manhwa', 'manga', 'webtoon', 'manhua']
        }
    }
};

// Date patterns for parsing
const datePatterns = [
    { regex: /\b(today)\b/i, handler: () => new Date() },
    { regex: /\b(tomorrow)\b/i, handler: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
    { regex: /\b(next week)\b/i, handler: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
    { regex: /\bdue\s+(\d{1,2})(st|nd|rd|th)?\b/i, handler: (m) => { const d = new Date(); d.setDate(parseInt(m[1])); if (d < new Date()) d.setMonth(d.getMonth() + 1); return d; } },
    { regex: /\b(\d{1,2})[\/\-](\d{1,2})\b/, handler: (m) => new Date(new Date().getFullYear(), parseInt(m[2]) - 1, parseInt(m[1])) },
    {
        regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})\b/i, handler: (m) => {
            const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
            return new Date(new Date().getFullYear(), months[m[1].toLowerCase().slice(0, 3)], parseInt(m[2]));
        }
    },
    { regex: /\bby\s+(\d{1,2})(st|nd|rd|th)?\b/i, handler: (m) => { const d = new Date(); d.setDate(parseInt(m[1])); if (d < new Date()) d.setMonth(d.getMonth() + 1); return d; } }
];

// App State
let appData = {};
let currentSection = 'dashboard';
let currentTab = null;
let supabaseClient = null;
let syncEnabled = false;

// Initialize Supabase client
function initSupabase() {
    try {
        if (typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            syncEnabled = true;
            updateSyncUI();
            console.log('✅ Supabase connected');
        } else {
            console.log('⚠️ Supabase not available - running in local-only mode');
            syncEnabled = false;
        }
    } catch (e) {
        console.error('Supabase init failed:', e);
        syncEnabled = false;
    }
}

// Initialize
function init() {
    loadData();
    initSupabase();
    setupEventListeners();
    renderDashboard();
    updateTodayDate();
    setInterval(updateTodayDate, 60000);
    checkMarinatingArticles();
    setInterval(checkMarinatingArticles, 3600000);

    // Initial sync from cloud on load (async, won't block, silent)
    if (syncEnabled) {
        pullFromCloud(false).catch(e => console.error('Initial sync failed:', e));
    }
}

function loadData() {
    const saved = localStorage.getItem('lifeCommandCenter');
    appData = saved ? JSON.parse(saved) : { ...defaultData };
    appData = { ...defaultData, ...appData };
}

function saveData() {
    localStorage.setItem('lifeCommandCenter', JSON.stringify(appData));
    // Auto-sync to Supabase
    if (syncEnabled) {
        debouncedCloudSync();
    }
}

// Debounced cloud sync to avoid too many API calls
let syncTimeout = null;
function debouncedCloudSync() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => syncToCloud(), 3000);
}

function updateSyncUI() {
    const statusEl = document.getElementById('sync-status');
    const btnEl = document.getElementById('sync-btn');
    if (statusEl) {
        statusEl.textContent = syncEnabled ? 'Connected' : 'Local only';
        statusEl.className = syncEnabled ? 'sync-status synced' : 'sync-status local';
    }
    if (btnEl) {
        btnEl.innerHTML = syncEnabled ? '☁️ Synced' : '☁️ Local Only';
    }
}

// Sync to Supabase
async function syncToCloud() {
    if (!supabaseClient || !syncEnabled) {
        showToast('warning', 'Cloud sync not configured');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('user_data')
            .upsert({
                id: 'default_user',
                data: appData,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;

        showToast('success', '☁️ Synced to cloud!');
        console.log('✅ Data synced to Supabase');
    } catch (e) {
        console.error('Sync failed:', e);
        showToast('error', 'Sync failed: ' + e.message);
    }
}

// Pull from Supabase
async function pullFromCloud(showErrors = true) {
    if (!supabaseClient || !syncEnabled) {
        if (showErrors) showToast('warning', 'Cloud sync not configured');
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('user_data')
            .select('data, updated_at')
            .eq('id', 'default_user')
            .single();

        // Handle various error cases gracefully
        if (error) {
            // PGRST116 = no rows found, 42P01 = table doesn't exist
            if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
                console.log('⚠️ No cloud data yet or table not set up');
                return;
            }
            throw error;
        }

        if (data?.data && Object.keys(data.data).length > 0) {
            appData = { ...defaultData, ...data.data };
            localStorage.setItem('lifeCommandCenter', JSON.stringify(appData));
            renderDashboard();
            if (showErrors) showToast('success', '⬇️ Data loaded from cloud!');
            console.log('✅ Data pulled from Supabase');
        }
    } catch (e) {
        console.error('Pull failed:', e);
        if (showErrors) showToast('error', 'Pull failed: ' + e.message);
    }
}

// Marinating Articles Feature - Nudge users to read stale articles
function checkMarinatingArticles() {
    const toRead = appData.reading?.['to-read'] || [];
    const now = new Date();
    const MARINATE_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days

    const marinatingArticles = toRead.filter(article => {
        const addedDate = new Date(article.createdAt);
        return (now - addedDate) > MARINATE_THRESHOLD && !article.dismissed;
    });

    if (marinatingArticles.length > 0 && currentSection === 'dashboard') {
        showMarinatingModal(marinatingArticles);
    }
}

function showMarinatingModal(articles) {
    // Only show once per day
    const lastShown = localStorage.getItem('lastMarinatingReminder');
    const today = new Date().toDateString();
    if (lastShown === today) return;

    localStorage.setItem('lastMarinatingReminder', today);

    const modal = document.getElementById('marinating-modal');
    const list = document.getElementById('marinating-list');
    const count = document.getElementById('marinating-count');

    if (!modal || !list) return;

    count.textContent = articles.length;
    list.innerHTML = articles.slice(0, 5).map(a => `
        <div class="marinating-item">
            <div class="marinating-title">${escapeHtml(a.text || a.title)}</div>
            <div class="marinating-age">${getDaysAgo(a.createdAt)} days old</div>
            <div class="marinating-actions">
                <button class="btn btn-sm btn-primary" onclick="readNow('${a.id}')">📖 Read Now</button>
                <button class="btn btn-sm btn-secondary" onclick="snoozeArticle('${a.id}')">⏰ +3 Days</button>
                <button class="btn btn-sm btn-ghost" onclick="dismissArticle('${a.id}')">✕ Dismiss</button>
            </div>
        </div>
    `).join('');

    modal.classList.remove('hidden');
}

function getDaysAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

function readNow(id) {
    const article = appData.reading['to-read'].find(a => a.id === id);
    if (article) {
        // Move to reading-now
        appData.reading['to-read'] = appData.reading['to-read'].filter(a => a.id !== id);
        article.startedReading = new Date().toISOString();
        appData.reading['reading-now'].push(article);
        saveData();
        closeMarinatingModal();
        navigateTo('reading');
        showToast('success', 'Moved to Reading Now! 📖');
    }
}

function snoozeArticle(id) {
    const article = appData.reading['to-read'].find(a => a.id === id);
    if (article) {
        // Reset the created date to give it 3 more days
        const snoozed = new Date();
        snoozed.setDate(snoozed.getDate() - 4); // 4 days ago, so 3 more days until 7
        article.createdAt = snoozed.toISOString();
        saveData();
        closeMarinatingModal();
        showToast('info', 'Snoozed for 3 days');
    }
}

function dismissArticle(id) {
    const article = appData.reading['to-read'].find(a => a.id === id);
    if (article) {
        article.dismissed = true;
        saveData();
        closeMarinatingModal();
    }
}

function closeMarinatingModal() {
    document.getElementById('marinating-modal')?.classList.add('hidden');
}

// Smart Router
function routeThought(text) {
    const lowerText = text.toLowerCase();
    let bestMatch = { section: 'ideas', subsection: 'ideas', score: 0 };

    for (const [section, rules] of Object.entries(routingRules)) {
        let sectionScore = 0;
        let matchedSubsection = Object.keys(rules.subsections)[0];

        for (const keyword of rules.keywords) {
            if (lowerText.includes(keyword)) sectionScore += keyword.length;
        }

        if (sectionScore > 0) {
            let bestSubScore = 0;
            for (const [sub, subKeywords] of Object.entries(rules.subsections)) {
                let subScore = 0;
                for (const kw of subKeywords) {
                    if (lowerText.includes(kw)) subScore += kw.length;
                }
                if (subScore > bestSubScore) {
                    bestSubScore = subScore;
                    matchedSubsection = sub;
                }
            }
            if (sectionScore > bestMatch.score) {
                bestMatch = { section, subsection: matchedSubsection, score: sectionScore };
            }
        }
    }
    return bestMatch;
}

function parseDate(text) {
    for (const pattern of datePatterns) {
        const match = text.match(pattern.regex);
        if (match) {
            try {
                const date = pattern.handler(match);
                if (date && !isNaN(date.getTime())) {
                    return date;
                }
            } catch (e) { }
        }
    }
    return null;
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatShortDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item, .mobile-nav-item, .section-card').forEach(el => {
        el.addEventListener('click', (e) => {
            const section = el.dataset.section;
            if (section) {
                e.preventDefault();
                navigateTo(section);
            }
        });
    });

    // Mobile menu
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    document.getElementById('sidebar-close')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });

    document.getElementById('mobile-sections-btn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
    });

    // Quick input
    const quickInput = document.getElementById('quick-input');
    quickInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleQuickInput();
        }
    });

    document.getElementById('quick-submit')?.addEventListener('click', handleQuickInput);

    // Auto-resize textarea
    quickInput?.addEventListener('input', () => {
        quickInput.style.height = 'auto';
        quickInput.style.height = Math.min(quickInput.scrollHeight, 150) + 'px';
    });

    // Command palette 
    document.getElementById('search-btn')?.addEventListener('click', openCommandPalette);
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openCommandPalette();
        }
        if (e.key === 'Escape') {
            closeCommandPalette();
            closeInboxModal();
            closeModal();
        }
    });

    document.querySelector('.command-palette-backdrop')?.addEventListener('click', closeCommandPalette);
    document.getElementById('command-input')?.addEventListener('input', handleCommandSearch);

    // Inbox modal
    document.querySelector('.inbox-modal-backdrop')?.addEventListener('click', closeInboxModal);
    document.getElementById('accept-routing')?.addEventListener('click', acceptRouting);
    document.getElementById('change-routing')?.addEventListener('click', showSectionPicker);

    // Modal
    document.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
    document.getElementById('modal-close')?.addEventListener('click', closeModal);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            const container = btn.closest('section');
            container.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            container.querySelector(`.tab-content[data-tab="${tab}"]`)?.classList.add('active');
            currentTab = tab;
        });
    });

    // Add item buttons
    document.querySelectorAll('.add-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            const subsection = btn.dataset.subsection;
            openAddModal(section, subsection);
        });
    });

    // Special buttons
    document.getElementById('add-goal-btn')?.addEventListener('click', () => openAddModal('dailyGoals'));
    document.getElementById('add-daily-goal')?.addEventListener('click', () => openAddModal('dailyGoals'));
    document.getElementById('add-prompt-btn')?.addEventListener('click', () => openAddModal('brand', 'prompts'));
    document.getElementById('add-resume-btn')?.addEventListener('click', () => openAddModal('jobs', 'resumes'));
    document.getElementById('add-contact-btn')?.addEventListener('click', () => openAddModal('network'));
    document.getElementById('export-btn')?.addEventListener('click', exportBrain);
    document.getElementById('save-reflection')?.addEventListener('click', saveReflection);

    // Hash change
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1) || 'dashboard';
        navigateTo(hash);
    });

    // Initial hash
    const initialHash = window.location.hash.slice(1);
    if (initialHash) navigateTo(initialHash);
}

// Navigation
function navigateTo(section) {
    currentSection = section;

    // Update nav active states
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.section === section);
    });

    // Show correct view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(`view-${section}`);
    if (view) view.classList.add('active');

    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('open');

    // Render section content
    renderSection(section);

    // Update URL without scroll
    history.replaceState(null, null, `#${section}`);
}

function updateTodayDate() {
    const el = document.getElementById('today-date');
    if (el) el.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Pending routing data
let pendingItem = null;

// Quick Input Handler
function handleQuickInput() {
    const input = document.getElementById('quick-input');
    const text = input.value.trim();
    if (!text) return;

    const routing = routeThought(text);
    const detectedDate = parseDate(text);

    pendingItem = {
        id: generateId(),
        text: text,
        section: routing.section,
        subsection: routing.subsection,
        date: detectedDate ? detectedDate.toISOString() : null,
        completed: false,
        createdAt: new Date().toISOString()
    };

    // Show inbox modal for confirmation
    document.getElementById('inbox-thought').textContent = text;
    document.getElementById('suggested-section').textContent = getSectionLabel(routing.section);
    document.getElementById('suggested-subsection').textContent = routing.subsection;

    const dateEl = document.getElementById('detected-date');
    if (detectedDate) {
        dateEl.classList.remove('hidden');
        document.getElementById('detected-date-text').textContent = `Deadline: ${formatDate(detectedDate)}`;
    } else {
        dateEl.classList.add('hidden');
    }

    document.getElementById('section-picker').classList.add('hidden');
    document.getElementById('inbox-modal').classList.remove('hidden');
    input.value = '';
    input.style.height = 'auto';
}

function getSectionLabel(section) {
    const labels = {
        academic: '📚 Academic', research: '📄 Research', brand: '🎯 Personal Brand',
        jobs: '💼 Job Apps', upskilling: '📈 Upskilling', misc: '🏠 Misc & Daily',
        events: '🎪 Events', ideas: '💡 Ideas', network: '👥 Network', reading: '📚 Reading'
    };
    return labels[section] || section;
}

function acceptRouting() {
    if (!pendingItem) return;
    addItemToSection(pendingItem.section, pendingItem.subsection, pendingItem);
    closeInboxModal();
    showToast('success', 'Added to ' + getSectionLabel(pendingItem.section));
    pendingItem = null;
    renderDashboard();
}

function showSectionPicker() {
    const picker = document.getElementById('section-picker');
    picker.innerHTML = '';

    const sections = [
        { id: 'academic', label: '📚 Academic' },
        { id: 'research', label: '📄 Research' },
        { id: 'brand', label: '🎯 Brand' },
        { id: 'jobs', label: '💼 Jobs' },
        { id: 'upskilling', label: '📈 Upskilling' },
        { id: 'misc', label: '🏠 Misc' },
        { id: 'events', label: '🎪 Events' },
        { id: 'ideas', label: '💡 Ideas' }
    ];

    sections.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'section-picker-item';
        btn.textContent = s.label;
        btn.onclick = () => {
            pendingItem.section = s.id;
            pendingItem.subsection = Object.keys(routingRules[s.id]?.subsections || {})[0] || s.id;
            acceptRouting();
        };
        picker.appendChild(btn);
    });

    picker.classList.remove('hidden');
}

function closeInboxModal() {
    document.getElementById('inbox-modal')?.classList.add('hidden');
}

function addItemToSection(section, subsection, item) {
    if (section === 'ideas' || section === 'network' || section === 'dailyGoals') {
        if (!appData[section]) appData[section] = [];
        appData[section].push(item);
    } else if (appData[section] && appData[section][subsection]) {
        appData[section][subsection].push(item);
    } else if (appData[section]) {
        const firstSub = Object.keys(appData[section])[0];
        if (firstSub) appData[section][firstSub].push(item);
    }
    appData.stats.added++;
    saveData();
}

// Rendering
function renderSection(section) {
    switch (section) {
        case 'dashboard': renderDashboard(); break;
        case 'inbox': renderInbox(); break;
        case 'daily': renderDaily(); break;
        case 'academic': renderAcademic(); break;
        case 'research': renderResearch(); break;
        case 'brand': renderBrand(); break;
        case 'jobs': renderJobs(); break;
        case 'upskilling': renderUpskilling(); break;
        case 'misc': renderMisc(); break;
        case 'events': renderEvents(); break;
        case 'ideas': renderIdeas(); break;
        case 'network': renderNetwork(); break;
        case 'reading': renderReading(); break;
        case 'media': renderMedia(); break;
        case 'review': renderReview(); break;
    }
}

function renderDashboard() {
    renderDailyGoals();
    renderTodayFocus();
    renderUpcomingAlerts();
    renderStats();
    updateSectionCounts();
}

function renderDailyGoals() {
    const container = document.getElementById('daily-goals');
    if (!container) return;

    const today = new Date().toDateString();
    const goals = (appData.dailyGoals || []).filter(g => new Date(g.createdAt).toDateString() === today);

    if (goals.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding: 2rem;"><p>No goals yet today. Add one!</p></div>`;
        return;
    }

    container.innerHTML = goals.map(g => `
        <div class="goal-card ${g.completed ? 'completed' : ''}" data-id="${g.id}">
            <div class="goal-checkbox ${g.completed ? 'checked' : ''}" onclick="toggleGoal('${g.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="goal-content">
                <div class="goal-text">${escapeHtml(g.text)}</div>
            </div>
        </div>
    `).join('');
}

function toggleGoal(id) {
    const goal = appData.dailyGoals.find(g => g.id === id);
    if (goal) {
        goal.completed = !goal.completed;
        if (goal.completed) appData.stats.completed++;
        saveData();
        renderDailyGoals();
    }
}

function renderTodayFocus() {
    const container = document.getElementById('today-focus');
    if (!container) return;

    const today = new Date();
    const upcoming = getAllItemsWithDates().filter(item => {
        const d = new Date(item.date);
        return d.toDateString() === today.toDateString();
    }).slice(0, 4);

    if (upcoming.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding: 2rem;"><p>Nothing scheduled for today</p></div>`;
        return;
    }

    container.innerHTML = upcoming.map(item => `
        <div class="focus-card">
            <div class="focus-card-header">
                <div class="focus-icon">${getSectionIcon(item.section)}</div>
                <span class="focus-section">${item.section}</span>
            </div>
            <div class="focus-title">${escapeHtml(item.text)}</div>
            <div class="focus-deadline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Today
            </div>
        </div>
    `).join('');
}

function getAllItemsWithDates() {
    const items = [];
    for (const [section, data] of Object.entries(appData)) {
        if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
            for (const [sub, arr] of Object.entries(data)) {
                if (Array.isArray(arr)) {
                    arr.forEach(item => {
                        if (item.date) items.push({ ...item, section, subsection: sub });
                    });
                }
            }
        } else if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.date) items.push({ ...item, section });
            });
        }
    }
    return items.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getSectionIcon(section) {
    const icons = { academic: '📚', research: '📄', brand: '🎯', jobs: '💼', upskilling: '📈', misc: '🏠', events: '🎪', ideas: '💡', network: '👥', reading: '📚' };
    return icons[section] || '📌';
}

function renderUpcomingAlerts() {
    const container = document.getElementById('upcoming-alerts');
    if (!container) return;

    const today = new Date();
    const upcoming = getAllItemsWithDates().filter(item => new Date(item.date) >= today).slice(0, 5);

    if (upcoming.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding: 1rem;"><p>No upcoming deadlines</p></div>`;
        return;
    }

    container.innerHTML = upcoming.map(item => {
        const d = new Date(item.date);
        const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
        const urgentClass = diff <= 1 ? 'alert-urgent' : diff <= 3 ? 'alert-warning' : '';
        return `
            <div class="alert-item ${urgentClass}">
                <div class="alert-date">
                    <span class="alert-date-day">${d.getDate()}</span>
                    <span class="alert-date-month">${d.toLocaleString('en', { month: 'short' })}</span>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${escapeHtml(item.text)}</div>
                    <div class="alert-section">${getSectionLabel(item.section)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderStats() {
    document.getElementById('stat-added').textContent = appData.stats.added || 0;
    document.getElementById('stat-completed').textContent = appData.stats.completed || 0;
    const pending = countAllItems() - (appData.stats.completed || 0);
    document.getElementById('stat-pending').textContent = Math.max(0, pending);
    document.getElementById('stat-streak').textContent = appData.stats.streak || 0;
}

function countAllItems() {
    let count = 0;
    for (const [key, data] of Object.entries(appData)) {
        if (Array.isArray(data)) count += data.length;
        else if (typeof data === 'object' && data !== null) {
            for (const arr of Object.values(data)) {
                if (Array.isArray(arr)) count += arr.length;
            }
        }
    }
    return count;
}

function updateSectionCounts() {
    const counts = {
        academic: countSectionItems('academic'),
        research: countSectionItems('research'),
        brand: countSectionItems('brand'),
        jobs: countSectionItems('jobs'),
        upskilling: countSectionItems('upskilling'),
        misc: countSectionItems('misc'),
        events: countSectionItems('events')
    };

    for (const [s, c] of Object.entries(counts)) {
        const el = document.getElementById(`count-${s}`);
        if (el) el.textContent = `${c} items`;
    }
}

function countSectionItems(section) {
    const data = appData[section];
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    let count = 0;
    for (const arr of Object.values(data)) {
        if (Array.isArray(arr)) count += arr.length;
    }
    return count;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

// Section Renderers
function renderInbox() {
    const container = document.getElementById('inbox-list');
    const emptyEl = document.getElementById('inbox-empty');
    const items = appData.inbox || [];

    if (items.length === 0) {
        container.innerHTML = '';
        emptyEl?.classList.remove('hidden');
        return;
    }
    emptyEl?.classList.add('hidden');
    container.innerHTML = items.map(item => createItemCard(item, 'inbox')).join('');
}

function renderDaily() {
    renderDailyGoals();
    const goalsList = document.getElementById('daily-goals-list');
    const deadlinesList = document.getElementById('today-deadlines');

    const today = new Date().toDateString();
    const goals = (appData.dailyGoals || []).filter(g => new Date(g.createdAt).toDateString() === today);

    if (goalsList) {
        goalsList.innerHTML = goals.length ? goals.map(g => `
            <div class="item-card ${g.completed ? 'completed' : ''}">
                <div class="item-checkbox ${g.completed ? 'checked' : ''}" onclick="toggleGoal('${g.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="item-title">${escapeHtml(g.text)}</div>
            </div>
        `).join('') : '<div class="empty-state"><p>No goals for today</p></div>';
    }

    if (deadlinesList) {
        const todayItems = getAllItemsWithDates().filter(i => new Date(i.date).toDateString() === today);
        deadlinesList.innerHTML = todayItems.length ? todayItems.map(item => `
            <div class="item-card"><div class="item-title">${escapeHtml(item.text)}</div></div>
        `).join('') : '<div class="empty-state"><p>Nothing due today</p></div>';
    }
}

function renderAcademic() {
    renderSubsection('curriculum-list', appData.academic?.curriculum, 'academic');
    renderSubsection('assignments-list', appData.academic?.assignments, 'academic');
}

function renderResearch() {
    renderSubsection('papers-list', appData.research?.papers, 'research');
    renderSubsection('whitepapers-list', appData.research?.whitepapers, 'research');
    renderSubsection('patents-list', appData.research?.patents, 'research');
}

function renderBrand() {
    renderSubsection('asymmetric-list', appData.brand?.asymmetric, 'brand');
    renderSubsection('hybrid-list', appData.brand?.hybrid, 'brand');
    renderSubsection('linkedin-list', appData.brand?.linkedin, 'brand');
    renderSubsection('instagram-list', appData.brand?.instagram, 'brand');
    renderPrompts();
}

function renderPrompts() {
    const container = document.getElementById('prompts-list');
    if (!container) return;
    const prompts = appData.brand?.prompts || [];

    if (prompts.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No prompt templates yet</p></div>';
        return;
    }

    container.innerHTML = prompts.map(p => `
        <div class="prompt-card">
            <div class="prompt-header">
                <span class="prompt-title">${escapeHtml(p.title || 'Untitled')}</span>
                <button class="item-action delete" onclick="deleteItem('brand', 'prompts', '${p.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
            <div class="prompt-text">${escapeHtml(p.text)}</div>
            <button class="btn btn-secondary btn-sm prompt-copy-btn" onclick="copyToClipboard('${escapeHtml(p.text.replace(/'/g, "\\'"))}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy
            </button>
        </div>
    `).join('');
}

function renderJobs() {
    renderResumes();
    renderSubsection('applications-list', appData.jobs?.applications, 'jobs');
}

function renderResumes() {
    const container = document.getElementById('resumes-list');
    if (!container) return;
    const resumes = appData.jobs?.resumes || [];

    if (resumes.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No resumes yet</p></div>';
        return;
    }

    container.innerHTML = resumes.map(r => `
        <div class="resume-card ${r.selected ? 'selected' : ''}" onclick="selectResume('${r.id}')">
            <div class="resume-icon">📄</div>
            <div class="resume-name">${escapeHtml(r.name || 'Resume')}</div>
            <div class="resume-role">${escapeHtml(r.role || 'General')}</div>
            <div class="resume-actions">
                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); deleteItem('jobs', 'resumes', '${r.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function selectResume(id) {
    appData.jobs?.resumes?.forEach(r => r.selected = r.id === id);
    saveData();
    renderResumes();
    showToast('success', 'Resume selected');
}

function renderUpskilling() {
    ['cfa', 'gaming', 'aiagents', 'pm'].forEach(skill => {
        const items = appData.upskilling?.[skill] || [];
        renderSubsection(`${skill}-list`, items, 'upskilling');
        updateProgress(skill, items);
    });
}

function updateProgress(skill, items) {
    const completed = items.filter(i => i.completed).length;
    const total = items.length || 1;
    const percent = Math.round((completed / total) * 100);
    const bar = document.getElementById(`${skill}-progress-bar`);
    const text = document.getElementById(`${skill}-progress-percent`);
    if (bar) bar.style.width = `${percent}%`;
    if (text) text.textContent = `${percent}%`;
}

function renderMisc() {
    renderSubsection('home-list', appData.misc?.home, 'misc', true);
    renderSubsection('reminders-list', appData.misc?.reminders, 'misc', true);
}

function renderEvents() {
    renderSubsection('finova-list', appData.events?.finova, 'events');
    renderSubsection('competitions-list', appData.events?.competitions, 'events');
    renderSubsection('events-items-list', appData.events?.['events-items'], 'events');
}

function renderIdeas() {
    const container = document.getElementById('ideas-list');
    if (!container) return;
    const items = appData.ideas || [];

    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No ideas yet. Brain dump away!</p></div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="idea-card item-card">
            <div class="item-header">
                <div class="item-title">${escapeHtml(item.text)}</div>
                <div class="item-actions">
                    <button class="item-action delete" onclick="deleteFromArray('ideas', '${item.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
            ${item.date ? `<div class="item-meta"><span class="item-date">${formatShortDate(item.date)}</span></div>` : ''}
        </div>
    `).join('');
}

function renderNetwork() {
    const container = document.getElementById('network-list');
    if (!container) return;
    const contacts = appData.network || [];

    if (contacts.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No contacts added yet</p></div>';
        return;
    }

    container.innerHTML = contacts.map(c => `
        <div class="contact-card">
            <div class="contact-header">
                <div class="contact-avatar">${(c.name || 'U')[0].toUpperCase()}</div>
                <div class="contact-info">
                    <h4>${escapeHtml(c.name || 'Unknown')}</h4>
                    <p>${escapeHtml(c.context || '')}</p>
                </div>
            </div>
            ${c.notes ? `<div class="contact-notes">${escapeHtml(c.notes)}</div>` : ''}
            ${c.followup ? `<div class="contact-followup"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Follow up: ${formatShortDate(c.followup)}</div>` : ''}
        </div>
    `).join('');
}

function renderReading() {
    renderSubsection('to-read-list', appData.reading?.['to-read'], 'reading');
    renderSubsection('reading-now-list', appData.reading?.['reading-now'], 'reading');
    renderSubsection('finished-list', appData.reading?.finished, 'reading');
}

function renderMedia() {
    renderSubsection('anime-list', appData.media?.anime, 'media');
    renderSubsection('movies-list', appData.media?.movies, 'media');
    renderSubsection('shows-list', appData.media?.shows, 'media');
    renderSubsection('games-list', appData.media?.games, 'media');
    renderSubsection('manhwa-list', appData.media?.manhwa, 'media');
}

function renderReview() {
    document.getElementById('review-added').textContent = appData.stats.added || 0;
    document.getElementById('review-completed').textContent = appData.stats.completed || 0;
    document.getElementById('review-deadlines-met').textContent = '0';
    document.getElementById('review-deadlines-missed').textContent = '0';

    const lastReflection = appData.reflections?.[appData.reflections.length - 1];
    if (lastReflection) {
        document.getElementById('reflection-good').value = lastReflection.good || '';
        document.getElementById('reflection-improve').value = lastReflection.improve || '';
        document.getElementById('reflection-priorities').value = lastReflection.priorities || '';
    }
}

function saveReflection() {
    const reflection = {
        id: generateId(),
        date: new Date().toISOString(),
        good: document.getElementById('reflection-good').value,
        improve: document.getElementById('reflection-improve').value,
        priorities: document.getElementById('reflection-priorities').value
    };
    if (!appData.reflections) appData.reflections = [];
    appData.reflections.push(reflection);
    saveData();
    showToast('success', 'Reflection saved!');
}

// Helper to render subsection lists
function renderSubsection(containerId, items, section, isChecklist = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    items = items || [];

    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 1rem;"><p>No items yet</p></div>';
        return;
    }

    container.innerHTML = items.map(item => isChecklist ?
        createChecklistItem(item, section, containerId) :
        createItemCard(item, section)
    ).join('');
}

function createItemCard(item, section) {
    return `
        <div class="item-card" data-id="${item.id}">
            <div class="item-header">
                <div class="item-title">${escapeHtml(item.text || item.title || '')}</div>
                <div class="item-actions">
                    <button class="item-action delete" onclick="deleteItemGeneric('${section}', '${item.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
            <div class="item-meta">
                ${item.date ? `<span class="item-date"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg> ${formatShortDate(item.date)}</span>` : ''}
                ${item.subsection ? `<span class="item-tag">${item.subsection}</span>` : ''}
            </div>
        </div>
    `;
}

function createChecklistItem(item, section, containerId) {
    const subsection = containerId.replace('-list', '');
    return `
        <div class="item-card ${item.completed ? 'completed' : ''}">
            <div class="item-checkbox ${item.completed ? 'checked' : ''}" onclick="toggleItemComplete('${section}', '${subsection}', '${item.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="item-title">${escapeHtml(item.text)}</div>
            <div class="item-actions">
                <button class="item-action delete" onclick="deleteItem('${section}', '${subsection}', '${item.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
    `;
}

function toggleItemComplete(section, subsection, id) {
    const items = appData[section]?.[subsection];
    if (!items) return;
    const item = items.find(i => i.id === id);
    if (item) {
        item.completed = !item.completed;
        if (item.completed) appData.stats.completed++;
        saveData();
        renderSection(section);
    }
}

function deleteItem(section, subsection, id) {
    if (!appData[section]?.[subsection]) return;
    appData[section][subsection] = appData[section][subsection].filter(i => i.id !== id);
    saveData();
    renderSection(section);
    showToast('success', 'Item deleted');
}

function deleteFromArray(section, id) {
    if (!Array.isArray(appData[section])) return;
    appData[section] = appData[section].filter(i => i.id !== id);
    saveData();
    renderSection(section);
    showToast('success', 'Item deleted');
}

function deleteItemGeneric(section, id) {
    if (Array.isArray(appData[section])) {
        deleteFromArray(section, id);
    } else {
        for (const sub of Object.keys(appData[section] || {})) {
            if (Array.isArray(appData[section][sub])) {
                const idx = appData[section][sub].findIndex(i => i.id === id);
                if (idx > -1) {
                    appData[section][sub].splice(idx, 1);
                    saveData();
                    renderSection(section);
                    showToast('success', 'Item deleted');
                    return;
                }
            }
        }
    }
}

// Command Palette
function openCommandPalette() {
    document.getElementById('command-palette').classList.remove('hidden');
    document.getElementById('command-input').focus();
    document.getElementById('command-input').value = '';
    renderCommandResults('');
}

function closeCommandPalette() {
    document.getElementById('command-palette')?.classList.add('hidden');
}

function handleCommandSearch() {
    const query = document.getElementById('command-input').value;
    renderCommandResults(query);
}

function renderCommandResults(query) {
    const container = document.getElementById('command-results');
    if (!container) return;

    const results = [];
    const lowerQuery = query.toLowerCase();

    // Search all items
    for (const [section, data] of Object.entries(appData)) {
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.text?.toLowerCase().includes(lowerQuery) || item.title?.toLowerCase().includes(lowerQuery)) {
                    results.push({ ...item, section });
                }
            });
        } else if (typeof data === 'object' && data !== null) {
            for (const [sub, arr] of Object.entries(data)) {
                if (Array.isArray(arr)) {
                    arr.forEach(item => {
                        if (item.text?.toLowerCase().includes(lowerQuery) || item.title?.toLowerCase().includes(lowerQuery)) {
                            results.push({ ...item, section, subsection: sub });
                        }
                    });
                }
            }
        }
    }

    // Add navigation commands if no query
    if (!query) {
        const navItems = [
            { icon: '📊', title: 'Go to Dashboard', action: () => navigateTo('dashboard') },
            { icon: '📥', title: 'Go to Inbox', action: () => navigateTo('inbox') },
            { icon: '⏰', title: "Go to Today's Focus", action: () => navigateTo('daily') },
            { icon: '📚', title: 'Go to Academic', action: () => navigateTo('academic') },
            { icon: '💡', title: 'Go to Ideas', action: () => navigateTo('ideas') }
        ];
        container.innerHTML = navItems.map((item, i) => `
            <div class="command-result" onclick="navigateTo('${item.title.split(' ').pop().toLowerCase()}'); closeCommandPalette();">
                <div class="command-result-icon">${item.icon}</div>
                <div class="command-result-info"><div class="command-result-title">${item.title}</div></div>
                <span class="command-result-action">Navigate</span>
            </div>
        `).join('');
        return;
    }

    if (results.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 1rem;"><p>No results found</p></div>';
        return;
    }

    container.innerHTML = results.slice(0, 10).map(item => `
        <div class="command-result" onclick="navigateTo('${item.section}'); closeCommandPalette();">
            <div class="command-result-icon">${getSectionIcon(item.section)}</div>
            <div class="command-result-info">
                <div class="command-result-title">${escapeHtml(item.text || item.title || '')}</div>
                <div class="command-result-section">${getSectionLabel(item.section)}${item.subsection ? ' → ' + item.subsection : ''}</div>
            </div>
        </div>
    `).join('');
}

// Modal
function openAddModal(section, subsection) {
    const modal = document.getElementById('add-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    let formHtml = '';

    if (section === 'dailyGoals') {
        title.textContent = 'Add Daily Goal';
        formHtml = `
            <div class="form-group"><label>Goal</label><input type="text" id="modal-text" placeholder="What do you want to accomplish?"></div>
            <div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitDailyGoal()">Add Goal</button></div>
        `;
    } else if (section === 'network') {
        title.textContent = 'Add Contact';
        formHtml = `
            <div class="form-group"><label>Name</label><input type="text" id="modal-name" placeholder="Contact name"></div>
            <div class="form-group"><label>Context</label><input type="text" id="modal-context" placeholder="Where you met"></div>
            <div class="form-group"><label>Notes</label><textarea id="modal-notes" placeholder="Notes about this person"></textarea></div>
            <div class="form-group"><label>Follow-up Date</label><input type="date" id="modal-followup"></div>
            <div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitContact()">Add Contact</button></div>
        `;
    } else if (section === 'brand' && subsection === 'prompts') {
        title.textContent = 'Add Prompt Template';
        formHtml = `
            <div class="form-group"><label>Title</label><input type="text" id="modal-title-input" placeholder="e.g., Cold Outreach"></div>
            <div class="form-group"><label>Prompt Text</label><textarea id="modal-text" placeholder="Your prompt template..." rows="6"></textarea></div>
            <div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitPrompt()">Add Prompt</button></div>
        `;
    } else if (section === 'jobs' && subsection === 'resumes') {
        title.textContent = 'Add Resume';
        formHtml = `
            <div class="form-group"><label>Resume Name</label><input type="text" id="modal-name" placeholder="e.g., PM Resume v2"></div>
            <div class="form-group"><label>Target Role</label><input type="text" id="modal-role" placeholder="e.g., Product Manager"></div>
            <div class="form-group"><label>Link (optional)</label><input type="text" id="modal-link" placeholder="Drive/Dropbox link"></div>
            <div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitResume()">Add Resume</button></div>
        `;
    } else {
        title.textContent = 'Add Item';
        formHtml = `
            <div class="form-group"><label>Content</label><textarea id="modal-text" placeholder="What's on your mind?"></textarea></div>
            <div class="form-group"><label>Due Date (optional)</label><input type="date" id="modal-date"></div>
            <input type="hidden" id="modal-section" value="${section}">
            <input type="hidden" id="modal-subsection" value="${subsection}">
            <div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitGenericItem()">Add</button></div>
        `;
    }

    body.innerHTML = formHtml;
    modal.classList.remove('hidden');
    setTimeout(() => body.querySelector('input, textarea')?.focus(), 100);
}

function closeModal() {
    document.getElementById('add-modal')?.classList.add('hidden');
}

function submitDailyGoal() {
    const text = document.getElementById('modal-text').value.trim();
    if (!text) return;

    const goal = { id: generateId(), text, completed: false, createdAt: new Date().toISOString() };
    if (!appData.dailyGoals) appData.dailyGoals = [];
    appData.dailyGoals.push(goal);
    appData.stats.added++;
    saveData();
    closeModal();
    renderDashboard();
    showToast('success', 'Goal added!');
}

function submitContact() {
    const name = document.getElementById('modal-name').value.trim();
    if (!name) return;

    const contact = {
        id: generateId(),
        name,
        context: document.getElementById('modal-context').value.trim(),
        notes: document.getElementById('modal-notes').value.trim(),
        followup: document.getElementById('modal-followup').value || null,
        createdAt: new Date().toISOString()
    };
    if (!appData.network) appData.network = [];
    appData.network.push(contact);
    appData.stats.added++;
    saveData();
    closeModal();
    renderNetwork();
    showToast('success', 'Contact added!');
}

function submitPrompt() {
    const title = document.getElementById('modal-title-input').value.trim();
    const text = document.getElementById('modal-text').value.trim();
    if (!text) return;

    const prompt = { id: generateId(), title: title || 'Untitled', text, createdAt: new Date().toISOString() };
    if (!appData.brand.prompts) appData.brand.prompts = [];
    appData.brand.prompts.push(prompt);
    saveData();
    closeModal();
    renderBrand();
    showToast('success', 'Prompt template added!');
}

function submitResume() {
    const name = document.getElementById('modal-name').value.trim();
    if (!name) return;

    const resume = {
        id: generateId(),
        name,
        role: document.getElementById('modal-role').value.trim(),
        link: document.getElementById('modal-link').value.trim(),
        selected: false,
        createdAt: new Date().toISOString()
    };
    if (!appData.jobs.resumes) appData.jobs.resumes = [];
    appData.jobs.resumes.push(resume);
    saveData();
    closeModal();
    renderJobs();
    showToast('success', 'Resume added!');
}

function submitGenericItem() {
    const text = document.getElementById('modal-text').value.trim();
    if (!text) return;

    const section = document.getElementById('modal-section').value;
    const subsection = document.getElementById('modal-subsection').value;
    const dateVal = document.getElementById('modal-date').value;

    const item = {
        id: generateId(),
        text,
        date: dateVal || null,
        completed: false,
        createdAt: new Date().toISOString()
    };

    addItemToSection(section, subsection, item);
    closeModal();
    renderSection(section);
    showToast('success', 'Item added!');
}

// Utilities
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('success', 'Copied to clipboard!');
    }).catch(() => {
        showToast('error', 'Failed to copy');
    });
}

function showToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✓', error: '✗', warning: '⚠' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ'}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

function exportBrain() {
    const data = JSON.stringify(appData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-command-center-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Brain exported successfully!');
}
