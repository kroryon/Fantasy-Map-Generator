/**
 * Mobile Compatibility Script v2.0 for Fantasy Map Generator
 * Enhanced touch support, dialog fixes, and Android WebView compatibility
 */

(function() {
    'use strict';
    
    console.log('Mobile Compatibility v2.0 loading...');

    // Environment detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isCapacitor = window.Capacitor !== undefined;
    const isAndroidWebView = /Android.*wv\)|.*WebView/i.test(navigator.userAgent);
    const isBlueStacks = navigator.userAgent.includes('BlueStacks') || 
                        window.navigator.platform === 'Win32' && /Android/i.test(navigator.userAgent);
    const isEmulator = isBlueStacks || navigator.userAgent.includes('Emulator');
    const needsMobileEnhancements = isMobile || isCapacitor || isEmulator;

    console.log('Environment detection:', {
        isMobile,
        isCapacitor,
        isAndroidWebView,
        isBlueStacks,
        isEmulator,
        needsMobileEnhancements,
        userAgent: navigator.userAgent
    });

    if (needsMobileEnhancements) {
        initMobileCompatibility();
    }

    function initMobileCompatibility() {
        console.log('Initializing mobile compatibility enhancements...');
        
        // Core improvements
        improveViewport();
        addMobileCSSFixes();
        fixTouchEvents();
        fixMenuClosing();
        fixScrolling();
        improvePerformance();
        
        console.log('Mobile compatibility v2.0 applied successfully');
    }

    function improveViewport() {
        // Enhanced viewport configuration
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
            );
        }
        
        // Prevent zoom on input focus (mobile Safari)
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (parseFloat(getComputedStyle(input).fontSize) < 16) {
                    input.style.fontSize = '16px';
                }
            });
        }
    }

    function addMobileCSSFixes() {
        const mobileCSS = document.createElement('style');
        mobileCSS.id = 'mobile-compatibility-v2-styles';
        mobileCSS.textContent = `
            /* Enhanced Mobile Styles v2.0 */
            
            /* Touch-friendly interactions */
            button, .icon, [onclick], [role="button"], .clickable {
                cursor: pointer !important;
                -webkit-tap-highlight-color: rgba(0,0,0,0.1);
                user-select: none;
                min-height: 44px;
                min-width: 44px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Enhanced touch feedback */
            .touch-active {
                background-color: rgba(0,120,215,0.2) !important;
                transform: scale(0.98);
                transition: all 0.1s ease;
            }
            
            /* Improved scrolling */
            .scrollable, .panel, .dialog, .menu, .ui-dialog-content {
                -webkit-overflow-scrolling: touch !important;
                overflow-y: auto !important;
                overscroll-behavior: contain !important;
            }
            
            /* Dialog improvements */
            .ui-dialog {
                max-width: 95vw !important;
                max-height: 90vh !important;
                font-size: 14px !important;
            }
            
            .ui-dialog-titlebar {
                padding: 12px !important;
                min-height: 44px !important;
                display: flex !important;
                align-items: center !important;
            }
            
            .ui-dialog-titlebar-close,
            .ui-dialog-titlebar-collapse {
                width: 44px !important;
                height: 44px !important;
                right: 8px !important;
                top: 8px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 18px !important;
                border-radius: 4px !important;
                background: rgba(0,0,0,0.1) !important;
            }
            
            .ui-dialog-content {
                padding: 16px !important;
                font-size: 14px !important;
            }
            
            /* Mobile-specific layouts */
            @media (max-width: 768px) {
                .ui-dialog {
                    margin: 10px !important;
                    max-width: calc(100vw - 20px) !important;
                    max-height: calc(100vh - 20px) !important;
                }
                
                input, select, textarea, button {
                    font-size: 16px !important; /* Prevent zoom on iOS */
                    padding: 12px !important;
                    min-height: 44px !important;
                }
                
                .menu, .panel {
                    font-size: 14px !important;
                }
            }
            
            /* High DPI displays */
            @media screen and (-webkit-device-pixel-ratio: 2), 
                   screen and (min-resolution: 192dpi) {
                .ui-dialog {
                    border-width: 1px !important;
                }
                
                button, input, select {
                    border-width: 1px !important;
                }
            }
            
            /* Android WebView specific fixes */
            @supports (-webkit-appearance: none) {
                input[type="range"] {
                    -webkit-appearance: none;
                    height: 44px;
                }
                
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: #2196F3;
                }
            }
        `;
        document.head.appendChild(mobileCSS);
    }

    function fixTouchEvents() {
        console.log('Enhancing touch event handling...');
        
        // Add touch feedback to interactive elements
        const addTouchFeedback = () => {
            const selectors = [
                'button', '.icon', '[onclick]', '[role="button"]', '.clickable',
                '.ui-dialog-titlebar-close', '.ui-dialog-titlebar-collapse'
            ];
            
            selectors.forEach(selector => {
                setTimeout(() => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        if (element.dataset.touchFeedbackAdded) return;
                        element.dataset.touchFeedbackAdded = 'true';
                        
                        element.addEventListener('touchstart', function() {
                            this.classList.add('touch-active');
                        }, { passive: true });
                        
                        element.addEventListener('touchend', function() {
                            setTimeout(() => this.classList.remove('touch-active'), 150);
                        }, { passive: true });
                        
                        element.addEventListener('touchcancel', function() {
                            this.classList.remove('touch-active');
                        }, { passive: true });
                    });
                }, 100);
            });
        };
        
        // Initial application
        addTouchFeedback();
          // Re-apply when DOM changes
        const observer = new MutationObserver(() => {
            addTouchFeedback();
        });
        
        // Wait for document.body to be available
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
            });
        }
        
        // Improve click handling for emulators
        if (isEmulator) {
            document.addEventListener('click', function(e) {
                // Ensure click events work properly in emulators
                const target = e.target;
                if (target && target.style) {
                    target.style.pointerEvents = 'auto';
                }
            }, { passive: true });
        }
    }

    function fixMenuClosing() {
        // Enhanced menu and dialog closing behavior
        document.addEventListener('click', function(e) {
            // Improved click-outside-to-close logic
            const target = e.target;
            const isInsideDialog = target.closest('.ui-dialog, .menu, .panel');
            const isDialogButton = target.closest('.ui-dialog-titlebar-close, .ui-dialog-titlebar-collapse');
            
            if (!isInsideDialog && !isDialogButton) {
                // Close any open menus/dropdowns
                const openMenus = document.querySelectorAll('.menu.open, .dropdown.open');
                openMenus.forEach(menu => {
                    if (menu.style.display !== 'none') {
                        menu.style.display = 'none';
                        menu.classList.remove('open');
                    }
                });
            }
        }, { passive: true });
        
        // ESC key handling
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close topmost dialog or menu
                const dialogs = document.querySelectorAll('.ui-dialog:not([style*="display: none"])');
                if (dialogs.length > 0) {
                    const topDialog = Array.from(dialogs).sort((a, b) => 
                        parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0)
                    )[0];
                    
                    const closeBtn = topDialog.querySelector('.ui-dialog-titlebar-close');
                    if (closeBtn) {
                        closeBtn.click();
                    }
                }
            }
        }, { passive: true });
    }

    function fixScrolling() {
        console.log('Improving scroll behavior...');
        
        // Enhanced scrolling for body
        document.body.style.overscrollBehavior = 'contain';
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Fix momentum scrolling for dialog content
        const applyScrollFixes = () => {
            const scrollableElements = document.querySelectorAll(
                '.ui-dialog-content, .panel, .menu, .scrollable, [style*="overflow"], [style*="scroll"]'
            );
            
            scrollableElements.forEach(element => {
                element.style.webkitOverflowScrolling = 'touch';
                element.style.overscrollBehavior = 'contain';
                
                // Ensure proper overflow handling
                if (getComputedStyle(element).overflow === 'visible') {
                    element.style.overflow = 'auto';
                }
            });
        };
        
        // Apply immediately and on DOM changes
        applyScrollFixes();
        setTimeout(applyScrollFixes, 1000);
        
        const scrollObserver = new MutationObserver(applyScrollFixes);
        scrollObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Enhanced touch scrolling
        if ('ontouchstart' in window) {
            let lastTouchY = 0;
            
            document.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    lastTouchY = e.touches[0].clientY;
                }
            }, { passive: true });
            
            document.addEventListener('touchmove', function(e) {
                if (e.touches.length === 1) {
                    const touchY = e.touches[0].clientY;
                    const deltaY = lastTouchY - touchY;
                    lastTouchY = touchY;
                    
                    // Allow smooth scrolling without interference
                    const target = e.target.closest('.ui-dialog-content, .scrollable');
                    if (target) {
                        // Let the browser handle the scroll naturally
                        return;
                    }
                }
            }, { passive: true });
        }
    }

    function improvePerformance() {
        // Performance optimizations for mobile devices
        
        // Throttle resize events
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Trigger custom resize event for components that need it
                const event = new CustomEvent('mobileResize', {
                    detail: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    }
                });
                window.dispatchEvent(event);
            }, 250);
        }, { passive: true });
        
        // Optimize animations for mobile
        if (isMobile) {
            const style = document.createElement('style');
            style.textContent = `
                * {
                    animation-duration: 0.2s !important;
                    transition-duration: 0.2s !important;
                }
                
                .ui-draggable-dragging {
                    animation: none !important;
                    transition: none !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Memory management
        window.addEventListener('beforeunload', function() {
            // Clean up event listeners and observers
            console.log('Cleaning up mobile compatibility resources...');
        }, { passive: true });
    }

    // Expose utilities globally for debugging
    window.mobileCompatibilityV2 = {
        isMobile,
        isCapacitor,
        isAndroidWebView,
        isEmulator,
        needsMobileEnhancements,
        userAgent: navigator.userAgent,
        viewport: window.innerWidth + 'x' + window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        version: '2.0.0'
    };

    console.log('Mobile Compatibility v2.0 loaded successfully', window.mobileCompatibilityV2);

})();
