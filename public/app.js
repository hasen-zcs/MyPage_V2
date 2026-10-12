/* =========================================================
   Hasen Personal Homepage — App Logic
   1. Theme toggle (localStorage + system preference)
   2. Active nav detection
   3. Dynamic stats from API
   4. Current date display
   5. Scroll fade-in animations
   6. Mobile hamburger menu
   7. Blog category filter
   8. Project status filter
   ========================================================= */

(function () {
    'use strict';

    // ==================== Theme Toggle ====================
    var root = document.documentElement;
    var toggle = document.getElementById('theme-toggle');

    function setTheme(dark) {
        if (dark) {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        // Update meta theme-color
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', dark ? '#0b1110' : '#fafcfb');
        }
    }

    // Init theme
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved === 'dark' || (!saved && prefersDark));

    // Toggle
    if (toggle) {
        toggle.addEventListener('click', function () {
            var isDark = root.getAttribute('data-theme') === 'dark';
            setTheme(!isDark);
        });
    }

    // Mobile theme toggle
    var mobileToggle = document.getElementById('theme-toggle-mobile');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function () {
            var isDark = root.getAttribute('data-theme') === 'dark';
            setTheme(!isDark);
        });
    }

    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches);
            }
        });
    }

    // ==================== Active Nav ====================
    var path = location.pathname.replace(/^\/+/, '').replace(/\/+$/, '') || 'home.html';
    // Normalize: if path is empty or root, use 'home.html'
    if (path === '' || path === '/') path = 'home.html';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
        var href = (link.getAttribute('href') || '').replace(/^\/+/, '').replace(/\/+$/, '') || 'home.html';
        if (href === path) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ==================== Current Date ====================
    var nowDateEl = document.getElementById('now-date');
    if (nowDateEl) {
        var now = new Date();
        var y = now.getFullYear();
        var m = String(now.getMonth() + 1).padStart(2, '0');
        nowDateEl.textContent = y + '.' + m;
    }

    // ==================== Stats from API ====================
    function loadStats() {
        fetch('/api/meta')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var stats = data.stats || {};
                animateValue('stat-posts', stats.post_count || 0);
                animateValue('stat-likes', stats.like_count || 0);
                animateValue('stat-comments', stats.comment_count || 0);
                animateWords('stat-words', stats.word_count || 0);
            })
            .catch(function () {
                // Fallback: use placeholder values
                document.getElementById('stat-posts').textContent = '0';
                document.getElementById('stat-likes').textContent = '0';
                document.getElementById('stat-comments').textContent = '0';
                document.getElementById('stat-words').textContent = '0';
            });
    }

    function animateValue(id, target, onComplete) {
        var el = document.getElementById(id);
        if (!el) return;
        var duration = 800;
        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(start + (target - start) * eased);
            el.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else if (onComplete) {
                onComplete();
            }
        }
        requestAnimationFrame(step);
    }

    function animateWords(id, target) {
        var el = document.getElementById(id);
        if (!el) return;
        if (target >= 1000) {
            var thousands = Math.floor(target / 1000);
            // Animate 0 → thousands, then append 'K'
            animateValue(id, thousands, function () {
                el.textContent = el.textContent + 'K';
            });
        } else {
            animateValue(id, target);
        }
    }

    loadStats();

    // ==================== Typewriter Animation ====================
    function typewriter(element, text, speed) {
        if (!element) return;
        speed = speed || 80;
        var i = 0;
        element.textContent = '';
        element.classList.add('typing');

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing');
            }
        }
        type();
    }

    // Run typewriter on hero subtitle (only once per user)
    var heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && !localStorage.getItem('_hasen_typewriter_done')) {
        var originalText = heroSubtitle.textContent;
        typewriter(heroSubtitle, originalText, 100);
        localStorage.setItem('_hasen_typewriter_done', '1');
    }

    // ==================== Fade-in on scroll ====================
    var fadeEls = document.querySelectorAll('.project-card, .post-card, .sidebar-card');
    if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        fadeEls.forEach(function (el) {
            observer.observe(el);
        });
    }

    // ==================== Mobile Hamburger Menu ====================
    var hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            var mobileNav = document.getElementById('mobile-nav');
            if (mobileNav) {
                mobileNav.classList.toggle('open');
                document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
            }
        });

        // Close mobile nav when clicking a link
        var mobileLinks = document.querySelectorAll('.mobile-nav a');
        mobileLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                var mobileNav = document.getElementById('mobile-nav');
                if (mobileNav) {
                    mobileNav.classList.remove('open');
                    document.body.style.overflow = '';
                }
            });
        });

        // Update mobile nav active state
        mobileLinks.forEach(function (link) {
            var href = (link.getAttribute('href') || '').replace(/^\/+/, '').replace(/\/+$/, '') || 'home.html';
            if (href === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ==================== Blog Category Filter ====================
    var filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var filter = this.getAttribute('data-filter');

            // Update active button
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');

            // Clear search
            var searchInput = document.getElementById('blog-search');
            if (searchInput) {
                searchInput.value = '';
                applyFilters('all');
            }

            // Filter items
            applyFilters(filter);
        });
    });

    // Apply filters (used by both buttons and search)
    function applyFilters(categoryFilter) {
        var targetContainer = null;
        if (typeof categoryFilter === 'string') {
            targetContainer = document.getElementById('blog-list') || document.getElementById('projects-list');
        }
        if (!targetContainer) return;

        var searchTerm = '';
        var searchInput = document.getElementById('blog-search');
        if (searchInput) {
            searchTerm = searchInput.value.toLowerCase().trim();
        }

        var items = targetContainer.querySelectorAll('.post-card');
        var visibleCount = 0;

        items.forEach(function (item) {
            var category = item.getAttribute('data-category') || '';
            var status = item.getAttribute('data-status') || '';
            var title = item.querySelector('h3 a, h3') ? item.querySelector('h3').textContent : '';
            var desc = item.querySelector('p') ? item.querySelector('p').textContent : '';

            var matchCategory = !categoryFilter || categoryFilter === 'all' || category === categoryFilter;
            var matchSearch = !searchTerm ||
                title.toLowerCase().indexOf(searchTerm) !== -1 ||
                desc.toLowerCase().indexOf(searchTerm) !== -1;

            if (matchCategory && matchSearch) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // Show/hide no results message
        var noResults = document.getElementById('no-results');
        if (noResults) {
            if (visibleCount === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        }
    }

    // Blog search input
    var blogSearch = document.getElementById('blog-search');
    var searchClear = document.getElementById('search-clear');
    if (blogSearch) {
        blogSearch.addEventListener('input', function () {
            // Show/hide clear button
            if (searchClear) {
                searchClear.style.display = this.value ? 'flex' : 'none';
            }
            // Get current filter
            var activeFilter = 'all';
            var activeBtn = document.querySelector('.filter-btn.active');
            if (activeBtn) {
                activeFilter = activeBtn.getAttribute('data-filter');
            }
            applyFilters(activeFilter);
        });

        // Clear search
        if (searchClear) {
            searchClear.addEventListener('click', function () {
                blogSearch.value = '';
                searchClear.style.display = 'none';
                blogSearch.focus();
                var activeBtn = document.querySelector('.filter-btn.active');
                var filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
                applyFilters(filter);
            });
        }
    }

    // Blog card click — navigate to article when clicking anywhere on the card
    var blogCards = document.querySelectorAll('#blog-list .post-card');
    blogCards.forEach(function (card) {
        var link = card.querySelector('a[href*="article.html"]');
        if (link) {
            card.addEventListener('click', function (e) {
                // Only navigate if not clicking the link itself (let default behavior work)
                if (e.target !== link && !link.contains(e.target)) {
                    window.location.href = link.getAttribute('href');
                }
            });
        }
    });

    // Sidebar filter (blog categories, project statuses)
    var sidebarFilterItems = document.querySelectorAll('[data-filter], .status-filter-item');
    sidebarFilterItems.forEach(function (item) {
        item.addEventListener('click', function () {
            var filter = this.getAttribute('data-filter');
            if (!filter) return;

            // Update active filter button
            var mainFilter = document.querySelector('.filter-btn.active');
            if (mainFilter) {
                mainFilter.classList.remove('active');
            }
            var targetBtn = document.querySelector('.filter-btn[data-filter="' + filter + '"]');
            if (targetBtn) {
                targetBtn.classList.add('active');
            } else {
                // "all" button
                var allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
            }

            // Trigger the filter
            if (mainFilter) {
                mainFilter.dispatchEvent(new Event('click'));
            }
        });
    });

    // ==================== Service Worker Registration ====================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js')
                .then(function (reg) {
                    console.log('SW registered:', reg.scope);
                })
                .catch(function (err) {
                    console.log('SW registration failed:', err);
                });
        });
    }

})();
