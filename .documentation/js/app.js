/* ============================================
   CLAUDE TOOLS DOCUMENTATION - APP
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initLanguageSwitch();
    initCopyButtons();
    initMobileMenu();
    initSidebarToc();
    initScrollSpy();
    initInteractiveDiagram();
    initSearch();
    initCopyableCommands();
});

/* ============================================
   SIDEBAR
   ============================================ */

function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.sidebar-toggle');

    if (!sidebar || !toggle) return;

    // Load saved state
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }

    toggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
    });

    // Set active nav item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
}

/* ============================================
   LANGUAGE SWITCH
   ============================================ */

function initLanguageSwitch() {
    const langSelect = document.getElementById('lang-select');

    // Load saved language
    const savedLang = localStorage.getItem('doc-language') || 'fr';
    setLanguage(savedLang);

    // Set dropdown to saved value
    if (langSelect) {
        langSelect.value = savedLang;
    }

    // Setup language button handlers (sidebar footer)
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            setLanguage(lang);
            localStorage.setItem('doc-language', lang);

            // Update active state
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function setLanguage(lang) {
    // Update body class
    document.body.classList.remove('lang-fr', 'lang-en');
    document.body.classList.add('lang-' + lang);

    // Update dropdown value (if exists)
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = lang;
    }

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update search placeholder
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const placeholder = lang === 'en' ? searchInput.dataset.placeholderEn : searchInput.dataset.placeholderFr;
        if (placeholder) {
            searchInput.placeholder = placeholder;
        }
    }
}

/* ============================================
   COPY BUTTONS
   ============================================ */

function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const code = this.closest('.code-block').querySelector('code').textContent;

            try {
                await navigator.clipboard.writeText(code);
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                this.style.background = 'var(--success)';

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

/* ============================================
   MOBILE MENU
   ============================================ */

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    if (!menuBtn || !sidebar) return;

    menuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('active');
    });

    overlay?.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    // Close on nav item click (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
                overlay?.classList.remove('active');
            }
        });
    });
}

/* ============================================
   SIDEBAR TABLE OF CONTENTS
   ============================================ */

function initSidebarToc() {
    const sidebarToc = document.querySelector('.sidebar-toc');
    const tocToggle = document.querySelector('.toc-toggle');

    if (!sidebarToc) return;

    // Auto-open TOC on current page
    sidebarToc.classList.add('open');
    if (tocToggle) tocToggle.classList.add('open');

    // Toggle handler
    if (tocToggle) {
        tocToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sidebarToc.classList.toggle('open');
            tocToggle.classList.toggle('open');
        });
    }

    // Smooth scroll for sidebar TOC links
    document.querySelectorAll('.sidebar-toc-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update active state immediately
                document.querySelectorAll('.sidebar-toc-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

/* ============================================
   SCROLL SPY
   ============================================ */

function initScrollSpy() {
    const headings = document.querySelectorAll('h2[id], h3[id]');
    const sidebarTocLinks = document.querySelectorAll('.sidebar-toc-link');

    if (!headings.length || !sidebarTocLinks.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                sidebarTocLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-20% 0px -80% 0px' });

    headings.forEach(heading => observer.observe(heading));
}

/* ============================================
   UTILITIES
   ============================================ */

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add animation class on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .alert, .best-practice').forEach(el => {
    fadeObserver.observe(el);
});

/* ============================================
   INTERACTIVE DIAGRAM
   ============================================ */

function initInteractiveDiagram() {
    const diagram = document.getElementById('gitflow-diagram');
    const tooltip = document.getElementById('diagram-tooltip');

    if (!diagram || !tooltip) return;

    const clickableElements = diagram.querySelectorAll('.clickable-element');
    let activeElement = null;

    // Get current language
    function getLang() {
        return document.body.classList.contains('lang-en') ? 'en' : 'fr';
    }

    // Show tooltip for an element
    function showTooltip(element, event) {
        const lang = getLang();
        const title = element.dataset['title' + lang.charAt(0).toUpperCase() + lang.slice(1)] || element.dataset.titleFr;
        const desc = element.dataset['desc' + lang.charAt(0).toUpperCase() + lang.slice(1)] || element.dataset.descFr;
        const cmd = element.dataset.cmd || '';

        // Set tooltip content
        tooltip.querySelector('.tooltip-title').textContent = title;
        tooltip.querySelector('.tooltip-desc').textContent = desc;

        const cmdElement = tooltip.querySelector('.tooltip-cmd');
        if (cmd) {
            cmdElement.textContent = cmd;
            cmdElement.style.display = 'inline-block';
        } else {
            cmdElement.style.display = 'none';
        }

        // Position tooltip
        const diagramRect = diagram.getBoundingClientRect();
        const svgRect = diagram.querySelector('svg').getBoundingClientRect();

        // Calculate position relative to the diagram
        let left = event.clientX - diagramRect.left + 15;
        let top = event.clientY - diagramRect.top + 15;

        // Make tooltip visible to measure it
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.classList.add('visible');

        // Adjust if overflowing right edge
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > diagramRect.right - 10) {
            left = event.clientX - diagramRect.left - tooltipRect.width - 15;
            tooltip.style.left = left + 'px';
        }

        // Adjust if overflowing bottom edge
        if (tooltipRect.bottom > window.innerHeight - 10) {
            top = event.clientY - diagramRect.top - tooltipRect.height - 15;
            tooltip.style.top = top + 'px';
        }

        // Mark element as active
        if (activeElement) {
            activeElement.classList.remove('active');
        }
        element.classList.add('active');
        activeElement = element;
    }

    // Hide tooltip
    function hideTooltip() {
        tooltip.classList.remove('visible');
        if (activeElement) {
            activeElement.classList.remove('active');
            activeElement = null;
        }
    }

    // Add click handlers to clickable elements
    clickableElements.forEach(element => {
        element.addEventListener('click', function(e) {
            e.stopPropagation();

            // If clicking the same element, toggle off
            if (activeElement === this) {
                hideTooltip();
            } else {
                showTooltip(this, e);
            }
        });
    });

    // Close tooltip when clicking outside
    document.addEventListener('click', function(e) {
        if (!diagram.contains(e.target) || (!e.target.closest('.clickable-element') && !e.target.closest('.diagram-tooltip'))) {
            hideTooltip();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideTooltip();
        }
    });

    // Update tooltip language when language changes
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', function() {
            if (activeElement && tooltip.classList.contains('visible')) {
                // Re-show tooltip with new language
                const event = { clientX: parseFloat(tooltip.style.left) + diagram.getBoundingClientRect().left,
                               clientY: parseFloat(tooltip.style.top) + diagram.getBoundingClientRect().top };
                setTimeout(() => showTooltip(activeElement, event), 50);
            }
        });
    }
}

/* ============================================
   SEARCH (Full-Text with Static Fallback)
   ============================================ */

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    // Static search index (works without server, file:// protocol)
    const staticIndex = [
        // Index - Accueil
        { page: 'index.html', icon: '🏠', title: { fr: 'Accueil', en: 'Home' }, section: '', anchor: '',
          keywords: 'accueil home documentation claude tools atlashub cli automatisation gitflow apex ef core migration hooks agents commandes installation npm' },

        // Installation
        { page: 'installation.html', icon: '📦', title: { fr: 'Installation', en: 'Installation' }, section: '', anchor: '',
          keywords: 'installation install npm registry nodejs node prérequis requirements setup configuration package global' },
        { page: 'installation.html', icon: '📦', title: { fr: 'Installation', en: 'Installation' }, section: { fr: 'Prérequis', en: 'Prerequisites' }, anchor: 'prerequisites',
          keywords: 'prérequis prerequisites nodejs node version 18 npm git' },
        { page: 'installation.html', icon: '📦', title: { fr: 'Installation', en: 'Installation' }, section: { fr: 'Installation globale', en: 'Global Installation' }, anchor: 'global-install',
          keywords: 'npm install global atlashub claude-tools registry package' },

        // GitFlow
        { page: 'gitflow.html', icon: '🔀', title: { fr: 'GitFlow', en: 'GitFlow' }, section: '', anchor: '',
          keywords: 'gitflow git workflow branch branche feature release hotfix develop main master merge fusion version semver' },
        { page: 'gitflow.html', icon: '🔀', title: { fr: 'GitFlow', en: 'GitFlow' }, section: { fr: 'Branches principales', en: 'Main Branches' }, anchor: 'main-branches',
          keywords: 'main master develop development production branches principales' },
        { page: 'gitflow.html', icon: '🔀', title: { fr: 'GitFlow', en: 'GitFlow' }, section: { fr: 'Feature branches', en: 'Feature branches' }, anchor: 'feature',
          keywords: 'feature branch nouvelle fonctionnalité develop merge création git checkout' },
        { page: 'gitflow.html', icon: '🔀', title: { fr: 'GitFlow', en: 'GitFlow' }, section: { fr: 'Release branches', en: 'Release branches' }, anchor: 'release',
          keywords: 'release branch version livraison production tag semver minor major patch' },
        { page: 'gitflow.html', icon: '🔀', title: { fr: 'GitFlow', en: 'GitFlow' }, section: { fr: 'Hotfix branches', en: 'Hotfix branches' }, anchor: 'hotfix',
          keywords: 'hotfix branch correction bug urgent production patch fix' },
        { page: 'gitflow.html', icon: '🔀', title: { fr: 'GitFlow', en: 'GitFlow' }, section: { fr: 'Commandes', en: 'Commands' }, anchor: 'commands',
          keywords: 'commandes commands gitflow init start finish status plan exec commit abort' },
        { page: 'gitflow.html', icon: '🔀', title: { fr: 'GitFlow', en: 'GitFlow' }, section: { fr: 'Versioning SemVer', en: 'SemVer Versioning' }, anchor: 'semver',
          keywords: 'semver semantic versioning version major minor patch auto increment package.json' },

        // EF Core
        { page: 'efcore.html', icon: '📄', title: { fr: 'EF Core', en: 'EF Core' }, section: '', anchor: '',
          keywords: 'ef core entity framework migration database dotnet .net sql model orm microsoft' },
        { page: 'efcore.html', icon: '📄', title: { fr: 'EF Core', en: 'EF Core' }, section: { fr: 'Structure des migrations', en: 'Migration Structure' }, anchor: 'structure',
          keywords: 'migration structure fichier file timestamp designer snapshot model context dbcontext' },
        { page: 'efcore.html', icon: '📄', title: { fr: 'EF Core', en: 'EF Core' }, section: { fr: 'Conflits', en: 'Conflicts' }, anchor: 'conflicts',
          keywords: 'conflit conflict merge migration snapshot résolution resolution gitflow' },
        { page: 'efcore.html', icon: '📄', title: { fr: 'EF Core', en: 'EF Core' }, section: { fr: 'Bonnes pratiques', en: 'Best Practices' }, anchor: 'best-practices',
          keywords: 'bonnes pratiques best practices migration naming convention idempotent script sql' },
        { page: 'efcore.html', icon: '📄', title: { fr: 'EF Core', en: 'EF Core' }, section: { fr: 'Commandes', en: 'Commands' }, anchor: 'commands',
          keywords: 'commandes commands dotnet ef migrations add remove update database script' },

        // APEX
        { page: 'apex.html', icon: '🎯', title: { fr: 'APEX', en: 'APEX' }, section: '', anchor: '',
          keywords: 'apex methodology méthodologie analyze plan execute examine implementation implémentation workflow' },
        { page: 'apex.html', icon: '🎯', title: { fr: 'APEX', en: 'APEX' }, section: { fr: 'Analyze', en: 'Analyze' }, anchor: 'analyze',
          keywords: 'analyze analyse context contexte codebase exploration recherche understanding' },
        { page: 'apex.html', icon: '🎯', title: { fr: 'APEX', en: 'APEX' }, section: { fr: 'Plan', en: 'Plan' }, anchor: 'plan',
          keywords: 'plan planning planification strategy stratégie architecture design conception' },
        { page: 'apex.html', icon: '🎯', title: { fr: 'APEX', en: 'APEX' }, section: { fr: 'Execute', en: 'Execute' }, anchor: 'execute',
          keywords: 'execute exécution implementation implémentation code coding développement development' },
        { page: 'apex.html', icon: '🎯', title: { fr: 'APEX', en: 'APEX' }, section: { fr: 'Examine', en: 'Examine' }, anchor: 'examine',
          keywords: 'examine test testing validation vérification review revue quality qualité' },

        // BA - Best Practices
        { page: 'ba.html', icon: '📊', title: { fr: 'Bonnes Pratiques', en: 'Best Practices' }, section: '', anchor: '',
          keywords: 'bonnes pratiques best practices ba business analysis guidelines standards quality qualité' },

        // Agents
        { page: 'agents.html', icon: '🤖', title: { fr: 'Agents', en: 'Agents' }, section: '', anchor: '',
          keywords: 'agents subagent task tool automation automatisation ai ia claude specialized spécialisé' },
        { page: 'agents.html', icon: '🤖', title: { fr: 'Agents', en: 'Agents' }, section: { fr: 'GitFlow Agents', en: 'GitFlow Agents' }, anchor: 'gitflow-agents',
          keywords: 'gitflow agents plan exec commit status abort rollback recovery' },
        { page: 'agents.html', icon: '🤖', title: { fr: 'Agents', en: 'Agents' }, section: { fr: 'Explore Agent', en: 'Explore Agent' }, anchor: 'explore',
          keywords: 'explore agent codebase search recherche exploration quick thorough' },

        // Commands
        { page: 'commands.html', icon: '⚡', title: { fr: 'Commandes', en: 'Commands' }, section: '', anchor: '',
          keywords: 'commandes commands slash cli terminal prompt gitflow apex commit review deploy' },
        { page: 'commands.html', icon: '⚡', title: { fr: 'Commandes', en: 'Commands' }, section: { fr: 'GitFlow Commands', en: 'GitFlow Commands' }, anchor: 'gitflow-commands',
          keywords: 'gitflow commands init start finish status commit plan exec' },
        { page: 'commands.html', icon: '⚡', title: { fr: 'Commandes', en: 'Commands' }, section: { fr: 'APEX Commands', en: 'APEX Commands' }, anchor: 'apex-commands',
          keywords: 'apex commands analyze plan execute examine quick' },
        { page: 'commands.html', icon: '⚡', title: { fr: 'Commandes', en: 'Commands' }, section: { fr: 'Commit', en: 'Commit' }, anchor: 'commit',
          keywords: 'commit git message conventional commits push' },
        { page: 'commands.html', icon: '⚡', title: { fr: 'Commandes', en: 'Commands' }, section: { fr: 'Deploy', en: 'Deploy' }, anchor: 'deploy',
          keywords: 'deploy deployment déploiement build test lint push production' },

        // Hooks
        { page: 'hooks.html', icon: '🔗', title: { fr: 'Hooks', en: 'Hooks' }, section: '', anchor: '',
          keywords: 'hooks pre-commit post-commit validation automation automatisation script event événement' },
        { page: 'hooks.html', icon: '🔗', title: { fr: 'Hooks', en: 'Hooks' }, section: { fr: 'Types de hooks', en: 'Hook Types' }, anchor: 'types',
          keywords: 'types hooks PreToolUse PostToolUse Stop SessionStart UserPromptSubmit' },
        { page: 'hooks.html', icon: '🔗', title: { fr: 'Hooks', en: 'Hooks' }, section: { fr: 'Configuration', en: 'Configuration' }, anchor: 'configuration',
          keywords: 'configuration hooks settings.json matcher command timeout' }
    ];

    let searchIndex = null;
    let activeIndex = -1;

    function getLang() {
        return document.body.classList.contains('lang-en') ? 'en' : 'fr';
    }

    // Build search index from static data
    function buildIndex() {
        const lang = getLang();

        return staticIndex.map(item => {
            const pageTitle = typeof item.title === 'object' ? item.title[lang] : item.title;
            const sectionTitle = typeof item.section === 'object' ? item.section[lang] : item.section;

            return {
                page: item.page,
                pageTitle: pageTitle,
                icon: item.icon,
                sectionTitle: sectionTitle || '',
                content: (pageTitle + ' ' + sectionTitle + ' ' + item.keywords).toLowerCase(),
                contentRaw: item.keywords,
                anchor: item.anchor,
                url: item.anchor ? `${item.page}#${item.anchor}` : item.page
            };
        });
    }

    // Search through index
    function search(query) {
        if (!query || query.length < 2) return [];

        // Build index if not ready
        if (!searchIndex) {
            searchIndex = buildIndex();
        }

        const normalizedQuery = query.toLowerCase().trim();
        const words = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
        const results = [];
        const seenPages = new Set();

        searchIndex.forEach(item => {
            // Check if any word matches
            const anyWordMatch = words.some(word => item.content.includes(word));
            if (!anyWordMatch) return;

            // Calculate relevance score
            let score = 0;
            words.forEach(word => {
                if (item.content.includes(word)) {
                    // Title match is worth more
                    if (item.pageTitle.toLowerCase().includes(word)) score += 10;
                    if (item.sectionTitle.toLowerCase().includes(word)) score += 5;
                    // Count occurrences in content
                    const matches = (item.content.match(new RegExp(word, 'g')) || []).length;
                    score += matches;
                }
            });

            // Generate excerpt from keywords
            let excerpt = item.contentRaw;
            if (excerpt.length > 80) {
                // Find first matching word position
                const firstWord = words.find(w => item.contentRaw.toLowerCase().includes(w));
                if (firstWord) {
                    const idx = item.contentRaw.toLowerCase().indexOf(firstWord);
                    const start = Math.max(0, idx - 20);
                    const end = Math.min(item.contentRaw.length, idx + 60);
                    excerpt = (start > 0 ? '...' : '') + item.contentRaw.substring(start, end) + (end < item.contentRaw.length ? '...' : '');
                } else {
                    excerpt = item.contentRaw.substring(0, 80) + '...';
                }
            }

            // Avoid duplicate pages for same section
            const key = item.page + '#' + item.anchor;
            if (!seenPages.has(key)) {
                seenPages.add(key);
                results.push({
                    ...item,
                    score,
                    excerpt
                });
            }
        });

        // Sort by score and limit results
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    // Escape regex special chars
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Highlight matches in text
    function highlightMatch(text, query) {
        const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
        let result = text;
        words.forEach(word => {
            const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
            result = result.replace(regex, '<mark>$1</mark>');
        });
        return result;
    }

    function renderResults(results, query) {
        const lang = getLang();

        if (results.length === 0) {
            const emptyMsg = lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found';
            searchResults.innerHTML = `<div class="search-results-empty">${emptyMsg}</div>`;
        } else {
            searchResults.innerHTML = results.map((item, index) => `
                <a href="${item.url}" class="search-result-item${index === activeIndex ? ' active' : ''}" data-index="${index}">
                    <div class="search-result-icon">${item.icon}</div>
                    <div class="search-result-content">
                        <div class="search-result-title">${highlightMatch(item.pageTitle, query)}${item.sectionTitle ? ' <span class="search-result-section">› ' + highlightMatch(item.sectionTitle, query) + '</span>' : ''}</div>
                        <div class="search-result-excerpt">${highlightMatch(item.excerpt, query)}</div>
                        <div class="search-result-path">${item.url}</div>
                    </div>
                </a>
            `).join('');
        }

        searchResults.classList.add('visible');
    }

    function hideResults() {
        searchResults.classList.remove('visible');
        activeIndex = -1;
    }

    // Input handler with debounce
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim();

        if (query.length >= 2) {
            debounceTimer = setTimeout(() => {
                const results = search(query);
                activeIndex = -1;
                renderResults(results, query);
            }, 150);
        } else {
            hideResults();
        }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const items = searchResults.querySelectorAll('.search-result-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            updateActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            updateActiveItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && items[activeIndex]) {
                window.location.href = items[activeIndex].getAttribute('href');
            }
        } else if (e.key === 'Escape') {
            hideResults();
            searchInput.blur();
        }
    });

    function updateActiveItem(items) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeIndex);
        });

        if (items[activeIndex]) {
            items[activeIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    // Focus handler
    searchInput.addEventListener('focus', function() {
        if (this.value.length >= 2) {
            const results = search(this.value);
            renderResults(results, this.value);
        }
    });

    // Click outside to close
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.header-search')) {
            hideResults();
        }
    });

    // Keyboard shortcut (Ctrl/Cmd + K)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });
}

/* ============================================
   COPYABLE COMMANDS (SVG Diagram)
   ============================================ */

function initCopyableCommands() {
    const copyableElements = document.querySelectorAll('.cmd-copyable');

    if (copyableElements.length === 0) return;

    // Get current language
    function getLang() {
        return document.body.classList.contains('lang-en') ? 'en' : 'fr';
    }

    // Create floating tooltip for feedback
    const tooltip = document.createElement('div');
    tooltip.className = 'copy-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        background: #22c55e;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(tooltip);

    copyableElements.forEach(element => {
        // Add hover effect
        element.addEventListener('mouseenter', function() {
            const rect = this.querySelector('rect');
            if (rect) {
                rect.style.filter = 'brightness(1.2)';
                rect.style.transition = 'filter 0.2s ease';
            }
        });

        element.addEventListener('mouseleave', function() {
            const rect = this.querySelector('rect');
            if (rect) {
                rect.style.filter = '';
            }
        });

        // Add click handler
        element.addEventListener('click', function(e) {
            e.stopPropagation();

            const cmd = this.dataset.cmd;
            if (!cmd) return;

            // Copy to clipboard
            navigator.clipboard.writeText(cmd).then(() => {
                // Show tooltip
                const lang = getLang();
                tooltip.textContent = lang === 'fr' ? '✓ Copié !' : '✓ Copied!';

                // Position tooltip near cursor
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY - 30 + 'px';
                tooltip.style.opacity = '1';

                // Flash effect on element
                const rect = this.querySelector('rect');
                if (rect) {
                    const originalStroke = rect.getAttribute('stroke');
                    rect.setAttribute('stroke', '#22c55e');
                    rect.style.filter = 'brightness(1.4)';

                    setTimeout(() => {
                        rect.setAttribute('stroke', originalStroke);
                        rect.style.filter = '';
                    }, 300);
                }

                // Hide tooltip after delay
                setTimeout(() => {
                    tooltip.style.opacity = '0';
                }, 1500);
            }).catch(err => {
                console.error('Failed to copy:', err);
                const lang = getLang();
                tooltip.textContent = lang === 'fr' ? '✗ Erreur' : '✗ Error';
                tooltip.style.background = '#ef4444';
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY - 30 + 'px';
                tooltip.style.opacity = '1';

                setTimeout(() => {
                    tooltip.style.opacity = '0';
                    tooltip.style.background = '#22c55e';
                }, 1500);
            });
        });
    });
}
