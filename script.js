// VIRTUOSO TV - Main JavaScript

(function() {
    'use strict';

    // DOM Elements
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const newsletterForm = document.getElementById('newsletter-form');
    const contactForm = document.getElementById('contact-form');

    // Mobile Navigation Toggle
    function initMobileNav() {
        if (!navToggle || !nav) return;

        navToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            navToggle.classList.toggle('active');

            // Update aria-expanded
            const isExpanded = nav.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close mobile nav when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
                nav.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Header Scroll Effect
    function initHeaderScroll() {
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            // Add shadow on scroll
            if (currentScroll > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                header.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // Active Navigation Link on Scroll
    function initActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');

        function updateActiveLink() {
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

                if (correspondingLink) {
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        navLinks.forEach(link => link.classList.remove('active'));
                        correspondingLink.classList.add('active');
                    }
                }
            });
        }

        window.addEventListener('scroll', updateActiveLink, { passive: true });
        updateActiveLink(); // Initial call
    }

    // Smooth Scroll for Anchor Links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Form Handling
    function initForms() {
        // Newsletter Form
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = this.querySelector('input[type="email"]').value;

                // Show success message (in production, this would send to a server)
                showNotification('Thank you for subscribing! You\'ll receive our newsletter at ' + email);
                this.reset();
            });
        }

        // Contact Form - API Integration
        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;

                // Get form data
                const formData = {
                    name: this.querySelector('#name').value.trim(),
                    email: this.querySelector('#email').value.trim(),
                    type: 'media',
                    organization: 'VIRTUOSO TV Enquiry',
                    message: `Subject: ${this.querySelector('#subject').value.trim()}\n\n${this.querySelector('#message').value.trim()}`
                };

                // Validate required fields
                if (formData.name.length < 2) {
                    showNotification('Please enter your name (at least 2 characters).', 'error');
                    return;
                }

                if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    showNotification('Please enter a valid email address.', 'error');
                    return;
                }

                // Set loading state
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                submitBtn.style.opacity = '0.7';
                submitBtn.style.cursor = 'not-allowed';

                try {
                    const response = await fetch('https://contact-form-api.contact-195.workers.dev', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
                        contactForm.reset();
                    } else {
                        const errorMessage = result.error || 'Failed to send message. Please try again.';
                        showNotification(errorMessage, 'error');
                    }
                } catch (error) {
                    console.error('Contact form error:', error);
                    showNotification('Network error. Please check your connection and try again.', 'error');
                } finally {
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                    submitBtn.style.opacity = '';
                    submitBtn.style.cursor = '';
                }
            });
        }
    }

    // Notification System
    function showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Determine colors based on type
        const borderColor = type === 'error' ? '#dc3545' : '#c9a961';
        const iconColor = type === 'error' ? '#dc3545' : '#c9a961';
        const icon = type === 'error'
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <span class="notification-icon" style="color: ${iconColor}; flex-shrink: 0;">${icon}</span>
            <p style="margin: 0; flex: 1;">${message}</p>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            max-width: 400px;
            padding: 1rem 1.5rem;
            background-color: #1a1a1a;
            border: 1px solid ${borderColor};
            border-radius: 8px;
            color: #f5f5f5;
            font-size: 0.9375rem;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #a0a0a0;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;

        // Add animation keyframes
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Close button functionality
        closeBtn.addEventListener('click', () => notification.remove());

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Intersection Observer for Fade-in Animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements
        const animatedElements = document.querySelectorAll('.schedule-item, .featured-card, .stat, .contact-item');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Initialize all functions
    function init() {
        initMobileNav();
        initHeaderScroll();
        initActiveNavigation();
        initSmoothScroll();
        initForms();

        // Only init scroll animations if user prefers motion
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            initScrollAnimations();
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
