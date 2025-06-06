/**
 * Mobile Dialog Scroll Fix for Fantasy Map Generator
 * Adds comprehensive scrolling support for all dialogs, menus, and panels on Android
 */

(function() {
    'use strict';

    // Detect mobile/tablet environments
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    console.log('Mobile Dialog Scroll Fix loaded', {
        isMobile,
        isAndroid,
        isTablet,
        isTouch,
        viewport: window.innerWidth + 'x' + window.innerHeight
    });

    // Apply fixes for mobile/touch devices
    if (isMobile || isAndroid || isTablet || isTouch) {
        initScrollFixes();
    }

    function initScrollFixes() {
        // 1. Add CSS for comprehensive scrolling
        addScrollCSS();
        
        // 2. Fix existing dialogs
        fixExistingDialogs();
        
        // 3. Monitor for new dialogs and fix them
        setupDialogMonitoring();
        
        // 4. Fix jQuery UI dialog options globally
        overrideJQueryDialogDefaults();
        
        console.log('Mobile dialog scroll fixes applied');
    }

    function addScrollCSS() {
        const scrollCSS = document.createElement('style');
        scrollCSS.id = 'mobile-scroll-fix';
        scrollCSS.textContent = `
            /* Universal scroll fixes for all dialogs and menus */
            .ui-dialog,
            .dialog,
            .menu,
            .panel,
            [role="dialog"],
            [id*="dialog"],
            [id*="Dialog"],
            [id*="menu"],
            [id*="Menu"],
            [id*="panel"],
            [id*="Panel"],
            [id*="overview"],
            [id*="Overview"],
            [id*="editor"],
            [id*="Editor"],
            [class*="dialog"],
            [class*="menu"],
            [class*="panel"] {
                max-width: 95vw !important;
                max-height: 90vh !important;
                overflow: auto !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior: contain !important;
            }

            /* Content areas within dialogs */
            .ui-dialog-content,
            .dialog-content,
            .menu-content,
            .panel-content {
                max-height: 80vh !important;
                overflow-y: auto !important;
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Specific dialog types */
            #alert,
            #burgsOverview,
            #militaryOverview,
            #statesOverview,
            #culturesOverview,
            #religionsOverview,
            #markersOverview,
            #notesOverview,
            #riversOverview,
            #burgEditor,
            #stateEditor,
            #cultureEditor,
            #religionEditor,
            #markerEditor,
            #labelEditor,
            #routeEditor,
            #heightmapEditor,
            #reliefEditor,
            #zonesEditor,
            #unitsEditor,
            #transformTool,
            #submapTool,
            #options,
            #optionsContainer {
                max-width: 95vw !important;
                max-height: 90vh !important;
                overflow: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Table containers */
            .table,
            .matrix-table,
            .overflow-table {
                max-height: 75vh !important;
                max-width: 90vw !important;
                overflow: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Scrollbar styling for touch devices */
            @media (max-width: 768px), (pointer: coarse) {
                ::-webkit-scrollbar {
                    width: 14px !important;
                    height: 14px !important;
                    background-color: rgba(0,0,0,0.1) !important;
                }

                ::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.4) !important;
                    border-radius: 7px !important;
                    border: 2px solid transparent !important;
                    background-clip: content-box !important;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(0,0,0,0.6) !important;
                }

                ::-webkit-scrollbar-track {
                    background-color: rgba(0,0,0,0.05) !important;
                    border-radius: 7px !important;
                }

                /* Force scrollbar visibility */
                .ui-dialog,
                .dialog,
                .menu,
                .panel,
                .table {
                    scrollbar-width: auto !important;
                }
            }

            /* Ensure dialog positioning doesn't break on small screens */
            @media (max-width: 768px) {
                .ui-dialog {
                    position: fixed !important;
                    top: 5vh !important;
                    left: 2.5vw !important;
                    right: 2.5vw !important;
                    bottom: auto !important;
                    width: auto !important;
                    max-width: 95vw !important;
                    max-height: 90vh !important;
                }

                .ui-dialog-titlebar {
                    touch-action: manipulation !important;
                }

                /* Prevent horizontal overflow */
                body {
                    overflow-x: hidden !important;
                }
            }

            /* Touch-friendly scrolling areas */
            .scrollable-content {
                touch-action: pan-y !important;
                -webkit-overflow-scrolling: touch !important;
                overflow-y: auto !important;
            }

            /* Handle very small screens */
            @media (max-width: 480px) {
                .ui-dialog,
                .dialog,
                .menu,
                .panel {
                    max-width: 98vw !important;
                    max-height: 85vh !important;
                    margin: 1vh auto !important;
                }

                .table,
                .matrix-table {
                    max-height: 70vh !important;
                    max-width: 95vw !important;
                }
            }
        `;
        
        document.head.appendChild(scrollCSS);
    }

    function fixExistingDialogs() {
        // Find all existing dialogs and apply fixes
        const dialogs = document.querySelectorAll([
            '.ui-dialog',
            '.dialog',
            '.menu',
            '.panel',
            '[role="dialog"]',
            '[id*="dialog"]',
            '[id*="Dialog"]',
            '[id*="menu"]',
            '[id*="Menu"]',
            '[id*="panel"]',
            '[id*="Panel"]',
            '[id*="overview"]',
            '[id*="Overview"]',
            '[id*="editor"]',
            '[id*="Editor"]'
        ].join(','));

        dialogs.forEach(dialog => {
            applyScrollFix(dialog);
        });
    }

    function applyScrollFix(dialog) {
        if (!dialog) return;

        // Set scroll properties
        dialog.style.maxWidth = '95vw';
        dialog.style.maxHeight = '90vh';
        dialog.style.overflow = 'auto';
        dialog.style.webkitOverflowScrolling = 'touch';
        dialog.style.overscrollBehavior = 'contain';

        // Find content area and apply scroll fix
        const contentSelectors = [
            '.ui-dialog-content',
            '.dialog-content',
            '.menu-content',
            '.panel-content',
            '.table',
            '.matrix-table'
        ];

        contentSelectors.forEach(selector => {
            const content = dialog.querySelector(selector);
            if (content) {
                content.style.maxHeight = '80vh';
                content.style.overflowY = 'auto';
                content.style.overflowX = 'auto';
                content.style.webkitOverflowScrolling = 'touch';
                content.classList.add('scrollable-content');
            }
        });

        // Special handling for tables
        const tables = dialog.querySelectorAll('table');
        tables.forEach(table => {
            if (!table.closest('.table')) {
                // Wrap table in scrollable container if not already wrapped
                const wrapper = document.createElement('div');
                wrapper.className = 'table scrollable-content';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    function setupDialogMonitoring() {
        // Monitor for new dialogs being added to the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node itself is a dialog
                        if (isDialogElement(node)) {
                            setTimeout(() => applyScrollFix(node), 100);
                        }
                        
                        // Check for dialogs within the added node
                        const dialogs = node.querySelectorAll([
                            '.ui-dialog',
                            '.dialog',
                            '.menu',
                            '.panel',
                            '[role="dialog"]',
                            '[id*="dialog"]',
                            '[id*="Dialog"]',
                            '[id*="menu"]',
                            '[id*="Menu"]',
                            '[id*="panel"]',
                            '[id*="Panel"]'
                        ].join(','));
                        
                        dialogs.forEach(dialog => {
                            setTimeout(() => applyScrollFix(dialog), 100);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also monitor for style changes that might affect visibility
        const styleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    const element = mutation.target;
                    if (isDialogElement(element) && isVisible(element)) {
                        setTimeout(() => applyScrollFix(element), 50);
                    }
                }
            });
        });

        // Observe all potential dialog containers
        document.querySelectorAll([
            'body',
            '#dialogs',
            '#menu',
            '#options'
        ].join(',')).forEach(container => {
            if (container) {
                styleObserver.observe(container, {
                    attributes: true,
                    attributeFilter: ['style', 'class'],
                    subtree: true
                });
            }
        });
    }

    function isDialogElement(element) {
        if (!element || !element.tagName) return false;
        
        const dialogSelectors = [
            '.ui-dialog',
            '.dialog',
            '.menu',
            '.panel',
            '[role="dialog"]'
        ];

        return dialogSelectors.some(selector => element.matches(selector)) ||
               element.id.includes('dialog') ||
               element.id.includes('Dialog') ||
               element.id.includes('menu') ||
               element.id.includes('Menu') ||
               element.id.includes('panel') ||
               element.id.includes('Panel') ||
               element.id.includes('overview') ||
               element.id.includes('Overview') ||
               element.id.includes('editor') ||
               element.id.includes('Editor');
    }

    function isVisible(element) {
        return element.offsetParent !== null || 
               (element.style.display !== 'none' && element.style.visibility !== 'hidden');
    }

    function overrideJQueryDialogDefaults() {
        // Override jQuery UI dialog defaults to ensure proper sizing
        if (window.$ && $.fn.dialog) {
            const originalDialog = $.fn.dialog;
            
            $.fn.dialog = function(options) {
                if (typeof options === 'object' && options !== null) {
                    // Enhance options for mobile
                    const mobileOptions = {
                        maxWidth: '95vw',
                        maxHeight: '90vh',
                        width: 'auto',
                        height: 'auto',
                        modal: false, // Disable modal backdrop on mobile for better performance
                        draggable: window.innerWidth > 768, // Only draggable on larger screens
                        resizable: window.innerWidth > 768, // Only resizable on larger screens
                        position: {
                            my: "center top",
                            at: "center top+5vh",
                            of: window
                        }
                    };

                    // Merge options
                    options = $.extend({}, mobileOptions, options);
                    
                    // Ensure position is mobile-friendly
                    if (window.innerWidth <= 768) {
                        options.position = {
                            my: "center top",
                            at: "center top+5vh",
                            of: window
                        };
                    }
                }

                // Call original dialog function
                const result = originalDialog.call(this, options);
                
                // Apply scroll fixes after dialog is created
                setTimeout(() => {
                    this.each(function() {
                        const dialog = $(this).closest('.ui-dialog')[0];
                        if (dialog) {
                            applyScrollFix(dialog);
                        }
                    });
                }, 100);

                return result;
            };
        }
    }

    // Expose functions for debugging
    window.MobileScrollFix = {
        applyScrollFix,
        fixExistingDialogs,
        isDialogElement,
        isVisible
    };

})();
