/**
 * Universal Scroll Fix for Fantasy Map Generator
 * Comprehensive scrolling solution for all menus, dialogs, and panels on Android
 * Ensures all content is scrollable when it doesn't fit on screen
 */

(function() {
    'use strict';

    // Enhanced mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;

    console.log('Universal Scroll Fix loaded', {
        isMobile, isAndroid, isTablet, isTouch, isSmallScreen,
        viewport: window.innerWidth + 'x' + window.innerHeight,
        userAgent: navigator.userAgent
    });

    // Apply fixes for mobile/touch devices or small screens
    if (isMobile || isAndroid || isTablet || isTouch || isSmallScreen) {
        // Wait for DOM and other scripts to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initUniversalScrollFix);
        } else {
            initUniversalScrollFix();
        }
        
        // Also initialize after a delay to catch dynamically created content
        setTimeout(initUniversalScrollFix, 1000);
        setTimeout(initUniversalScrollFix, 3000);
        setTimeout(initUniversalScrollFix, 5000);
    }    function initUniversalScrollFix() {
        try {
            // 1. Add comprehensive CSS for all scrolling scenarios
            addUniversalScrollCSS();
            
            // 2. Fix all existing UI elements
            fixAllExistingElements();
            
            // 3. Specific fixes for Fantasy Map Generator
            fixFantasyMapGeneratorElements();
            
            // 4. Monitor for new elements and fix them automatically
            setupUniversalMonitoring();
            
            // 5. Override jQuery UI defaults for mobile
            overrideJQueryUIDefaults();
            
            // 6. Add window resize handler
            setupWindowResizeHandler();
            
            // 7. Setup Options menu specific monitoring
            setupOptionsMenuMonitoring();
            
            console.log('Universal scroll fixes applied successfully');
        } catch (error) {
            console.error('Error applying universal scroll fixes:', error);
        }
    }

    function addUniversalScrollCSS() {
        // Remove existing scroll fix CSS to avoid conflicts
        const existingCSS = document.getElementById('mobile-scroll-fix') || document.getElementById('universal-scroll-fix');
        if (existingCSS) {
            existingCSS.remove();
        }

        const scrollCSS = document.createElement('style');
        scrollCSS.id = 'universal-scroll-fix';
        scrollCSS.textContent = `
            /* === UNIVERSAL SCROLL FIXES FOR ALL UI ELEMENTS === */
              /* === FANTASY MAP GENERATOR SPECIFIC FIXES === */
            
            /* Main Options Menu - Critical fix for the reported issue */
            #options {
                position: absolute !important;
                max-width: min(95vw, 400px) !important;
                max-height: 90vh !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                box-sizing: border-box !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Options Tab Header - Keep fixed at top */
            #options .tab {
                flex-shrink: 0 !important;
                border-bottom: 1px solid var(--dark-solid) !important;
                background: var(--bg-light) !important;
                z-index: 10 !important;
                position: sticky !important;
                top: 0 !important;
            }

            /* Options Content Areas - Make scrollable */
            #options .tabcontent {
                flex: 1 !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                max-height: calc(90vh - 60px) !important;
                padding: 0 12px 12px 12px !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior: contain !important;
            }

            /* Specific tab content scrolling */
            #layersContent,
            #styleContent,
            #optionsContent,
            #toolsContent,
            #aboutContent {
                overflow-y: auto !important;
                overflow-x: hidden !important;
                max-height: calc(90vh - 80px) !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior: contain !important;
            }

            /* Tables within options - prevent overflow */
            #options table {
                width: 100% !important;
                max-width: none !important;
                table-layout: fixed !important;
                word-wrap: break-word !important;
            }

            #options table td,
            #options table th {
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                max-width: 0 !important;
            }

            /* Long dropdowns in options */
            #options select {
                max-width: 100% !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }

            /* Style Elements Container - Critical for Style tab */
            #styleElements {
                max-height: calc(90vh - 120px) !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior: contain !important;
            }

            /* Primary UI containers - Apply scroll to EVERYTHING that could contain content */
            .ui-dialog,
            .dialog,
            .menu,
            .panel,
            .window,
            .popup,
            .modal,
            .overlay,
            .dropdown,
            .tooltip,
            .sidebar,
            .toolbar,
            [role="dialog"],
            [role="menu"],
            [role="listbox"],
            [role="tabpanel"],
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
            [id*="settings"],
            [id*="Settings"],
            [id*="tool"],
            [id*="Tool"],
            [class*="dialog"],
            [class*="menu"],
            [class*="panel"],
            [class*="popup"],
            [class*="modal"],
            [class*="overlay"],
            [class*="dropdown"],
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
            #optionsContainer {
                max-width: 95vw !important;
                max-height: 90vh !important;
                overflow: auto !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior: contain !important;
                box-sizing: border-box !important;
            }

            /* Content areas within containers */
            .ui-dialog-content,
            .dialog-content,
            .menu-content,
            .panel-content,
            .popup-content,
            .modal-content,
            .window-content,
            .tab-content,
            .accordion-content,
            .section-content,
            .container,
            .content,
            .body,
            .main {
                max-height: 80vh !important;
                overflow-y: auto !important;
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior: contain !important;
            }

            /* Tables and data containers */
            table,
            .table,
            .grid,
            .matrix,
            .matrix-table,
            .overflow-table,
            .data-table,
            .list,
            .items,
            .entries {
                max-height: 75vh !important;
                max-width: 90vw !important;
                overflow: auto !important;
                -webkit-overflow-scrolling: touch !important;
                display: block !important;
            }

            /* Form containers */
            form,
            .form,
            .form-container,
            .input-group,
            .field-group,
            .control-group {
                max-height: 80vh !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* List containers */
            ul, ol, dl,
            .list-container,
            .item-list,
            .option-list,
            .menu-list,
            select[multiple],
            .select-list {
                max-height: 60vh !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Text areas and content boxes */
            textarea,
            .text-area,
            .content-area,
            .description,
            .details,
            .info,
            .notes {
                max-height: 50vh !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
                resize: vertical !important;
            }

            /* Scrollbar styling for touch devices */
            @media (max-width: 768px), (pointer: coarse) {
                ::-webkit-scrollbar {
                    width: 16px !important;
                    height: 16px !important;
                    background-color: rgba(0,0,0,0.1) !important;
                }

                ::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.5) !important;
                    border-radius: 8px !important;
                    border: 2px solid transparent !important;
                    background-clip: content-box !important;
                    min-height: 30px !important;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(0,0,0,0.7) !important;
                }

                ::-webkit-scrollbar-track {
                    background-color: rgba(0,0,0,0.05) !important;
                    border-radius: 8px !important;
                }

                ::-webkit-scrollbar-corner {
                    background-color: rgba(0,0,0,0.1) !important;
                }

                /* Force scrollbar visibility */
                * {
                    scrollbar-width: auto !important;
                }
            }            /* Mobile-specific positioning and sizing */
            @media (max-width: 768px) {
                /* Options Menu Mobile Fixes */
                #options {
                    position: fixed !important;
                    top: 10px !important;
                    left: 10px !important;
                    right: 10px !important;
                    bottom: auto !important;
                    width: auto !important;
                    height: auto !important;
                    max-height: calc(100vh - 20px) !important;
                    margin: 0 !important;
                    z-index: 1000 !important;
                }

                #options .tabcontent {
                    max-height: calc(100vh - 100px) !important;
                    padding: 8px !important;
                }

                #styleElements {
                    max-height: calc(100vh - 140px) !important;
                }

                /* Make tables more mobile-friendly */
                #options table {
                    font-size: 0.9em !important;
                }

                #options table td {
                    padding: 4px 2px !important;
                    vertical-align: top !important;
                }

                #options input,
                #options select,
                #options button {
                    min-height: 36px !important;
                    touch-action: manipulation !important;
                }

                /* Better dropdown sizing */
                #options select {
                    font-size: 0.85em !important;
                    padding: 4px !important;
                }

                /* Ensure dialogs fit on mobile screens */
                .ui-dialog {
                    position: fixed !important;
                    top: 5vh !important;
                    left: 2.5vw !important;
                    right: 2.5vw !important;
                    bottom: auto !important;
                    width: auto !important;
                    margin: 0 !important;
                }

                /* Make title bars touch-friendly */
                .ui-dialog-titlebar,
                .dialog-header,
                .menu-header,
                .panel-header {
                    touch-action: manipulation !important;
                    min-height: 44px !important;
                }

                /* Prevent horizontal overflow on body */
                body {
                    overflow-x: hidden !important;
                }

                /* Ensure root containers can scroll */
                html, body {
                    height: 100% !important;
                    overflow: auto !important;
                }
            }

            /* Very small screens (phones in portrait) */
            @media (max-width: 480px) {
                .ui-dialog,
                .dialog,
                .menu,
                .panel {
                    max-width: 98vw !important;
                    max-height: 95vh !important;
                    margin: 1vh auto !important;
                }

                .table,
                .matrix-table,
                table {
                    max-height: 70vh !important;
                    max-width: 95vw !important;
                }

                /* Smaller content areas for tiny screens */
                .ui-dialog-content,
                .dialog-content {
                    max-height: 70vh !important;
                }
            }

            /* Touch-friendly scrolling behavior */
            .scrollable,
            .scrollable-content {
                touch-action: pan-y !important;
                -webkit-overflow-scrolling: touch !important;
                overflow-y: auto !important;
                overscroll-behavior: contain !important;
            }

            .scrollable-horizontal {
                touch-action: pan-x !important;
                -webkit-overflow-scrolling: touch !important;
                overflow-x: auto !important;
                overscroll-behavior: contain !important;
            }

            .scrollable-both {
                touch-action: pan-x pan-y !important;
                -webkit-overflow-scrolling: touch !important;
                overflow: auto !important;
                overscroll-behavior: contain !important;
            }

            /* Landscape orientation adjustments */
            @media (orientation: landscape) and (max-height: 500px) {
                .ui-dialog,
                .dialog,
                .menu,
                .panel {
                    max-height: 85vh !important;
                }
                
                .ui-dialog-content,
                .dialog-content {
                    max-height: 65vh !important;
                }
            }
        `;
        
        document.head.appendChild(scrollCSS);
    }

    function fixFantasyMapGeneratorElements() {
        // Fix the main Options menu
        const optionsMenu = document.getElementById('options');
        if (optionsMenu) {
            applyOptionsMenuFix(optionsMenu);
        }

        // Fix all tab content areas
        const tabContents = document.querySelectorAll('.tabcontent');
        tabContents.forEach(tab => {
            applyTabContentFix(tab);
        });

        // Fix style elements container
        const styleElements = document.getElementById('styleElements');
        if (styleElements) {
            applyStyleElementsFix(styleElements);
        }

        // Fix any existing overview panels
        const overviewSelectors = [
            '#burgsOverview', '#militaryOverview', '#statesOverview', 
            '#culturesOverview', '#religionsOverview', '#markersOverview',
            '#notesOverview', '#riversOverview'
        ];
        
        overviewSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                applyScrollFixToElement(element);
            }
        });

        // Fix editor panels
        const editorSelectors = [
            '#burgEditor', '#stateEditor', '#cultureEditor', '#religionEditor',
            '#markerEditor', '#labelEditor', '#routeEditor', '#heightmapEditor',
            '#reliefEditor', '#zonesEditor', '#unitsEditor'
        ];
        
        editorSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                applyScrollFixToElement(element);
            }
        });
    }

    function applyOptionsMenuFix(optionsMenu) {
        if (!optionsMenu) return;

        // Apply flexbox layout for proper scrolling
        optionsMenu.style.display = 'flex';
        optionsMenu.style.flexDirection = 'column';
        optionsMenu.style.maxHeight = '90vh';
        optionsMenu.style.overflow = 'hidden';
        optionsMenu.style.boxSizing = 'border-box';

        // Fix the tab header
        const tabHeader = optionsMenu.querySelector('.tab');
        if (tabHeader) {
            tabHeader.style.flexShrink = '0';
            tabHeader.style.position = 'sticky';
            tabHeader.style.top = '0';
            tabHeader.style.zIndex = '10';
            tabHeader.style.backgroundColor = 'var(--bg-light)';
        }

        // Fix all tab content areas
        const tabContents = optionsMenu.querySelectorAll('.tabcontent');
        tabContents.forEach(tabContent => {
            applyTabContentFix(tabContent);
        });
    }

    function applyTabContentFix(tabContent) {
        if (!tabContent) return;

        tabContent.style.flex = '1';
        tabContent.style.overflowY = 'auto';
        tabContent.style.overflowX = 'hidden';
        tabContent.style.maxHeight = 'calc(90vh - 80px)';
        tabContent.style.webkitOverflowScrolling = 'touch';
        tabContent.style.overscrollBehavior = 'contain';
        tabContent.classList.add('scrollable-content');

        // Fix tables within tab content
        const tables = tabContent.querySelectorAll('table');
        tables.forEach(table => {
            table.style.width = '100%';
            table.style.tableLayout = 'fixed';
            table.style.wordWrap = 'break-word';
            
            // Fix table cells
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
                cell.style.wordWrap = 'break-word';
                cell.style.overflowWrap = 'break-word';
                cell.style.maxWidth = '0';
            });
        });

        // Fix long select elements
        const selects = tabContent.querySelectorAll('select');
        selects.forEach(select => {
            select.style.maxWidth = '100%';
            select.style.whiteSpace = 'nowrap';
            select.style.overflow = 'hidden';
            select.style.textOverflow = 'ellipsis';
        });
    }

    function applyStyleElementsFix(styleElements) {
        if (!styleElements) return;

        styleElements.style.maxHeight = 'calc(90vh - 120px)';
        styleElements.style.overflowY = 'auto';
        styleElements.style.overflowX = 'hidden';
        styleElements.style.webkitOverflowScrolling = 'touch';
        styleElements.style.overscrollBehavior = 'contain';
        styleElements.classList.add('scrollable-content');
    }

    function setupOptionsMenuMonitoring() {
        // Monitor for Options menu visibility changes
        const optionsMenu = document.getElementById('options');
        if (optionsMenu) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const isVisible = optionsMenu.style.display !== 'none' && 
                                        optionsMenu.offsetParent !== null;
                        if (isVisible) {
                            setTimeout(() => applyOptionsMenuFix(optionsMenu), 50);
                        }
                    }
                });
            });

            observer.observe(optionsMenu, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }

        // Monitor for tab changes
        const tabButtons = document.querySelectorAll('#options .tab button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                setTimeout(() => {
                    const activeTab = document.querySelector('.tabcontent[style*="display: block"], .tabcontent[style*="display:block"]');
                    if (activeTab) {
                        applyTabContentFix(activeTab);
                    }
                }, 100);
            });
        });
    }
        // Comprehensive selectors for all possible UI elements
        const uiSelectors = [
            '.ui-dialog', '.dialog', '.menu', '.panel', '.window', '.popup', '.modal',
            '.overlay', '.dropdown', '.tooltip', '.sidebar', '.toolbar',
            '[role="dialog"]', '[role="menu"]', '[role="listbox"]', '[role="tabpanel"]',
            '[id*="dialog"]', '[id*="Dialog"]', '[id*="menu"]', '[id*="Menu"]',
            '[id*="panel"]', '[id*="Panel"]', '[id*="overview"]', '[id*="Overview"]',
            '[id*="editor"]', '[id*="Editor"]', '[id*="options"]', '[id*="Options"]',
            '[id*="settings"]', '[id*="Settings"]', '[id*="tool"]', '[id*="Tool"]',
            '[class*="dialog"]', '[class*="menu"]', '[class*="panel"]',
            '[class*="popup"]', '[class*="modal"]', '[class*="overlay"]',
            '#alert', '#options', '#optionsContainer'
        ];

        uiSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element && isElementVisible(element)) {
                        applyScrollFixToElement(element);
                    }
                });
            } catch (error) {
                console.warn('Error fixing elements with selector:', selector, error);
            }
        });

        // Also fix any tables and lists that might need scrolling
        document.querySelectorAll('table, .table, ul, ol, .list, form').forEach(element => {
            applyScrollFixToElement(element);
        });
    }

    function setupUniversalMonitoring() {
        // Monitor for new elements being added to the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node itself needs scroll fixes
                        if (isUIElement(node)) {
                            setTimeout(() => applyScrollFixToElement(node), 50);
                        }
                        
                        // Check for UI elements within the added node
                        const uiElements = node.querySelectorAll([
                            '.ui-dialog', '.dialog', '.menu', '.panel', '.window', '.popup',
                            '.modal', '.overlay', '.dropdown', '[role="dialog"]', '[role="menu"]',
                            '[id*="dialog"]', '[id*="menu"]', '[id*="panel"]', '[id*="overview"]',
                            '[id*="editor"]', '[id*="options"]', '[id*="tool"]',
                            'table', '.table', 'form', '.form'
                        ].join(','));
                        
                        uiElements.forEach(element => {
                            setTimeout(() => applyScrollFixToElement(element), 50);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also monitor for style/class changes that might affect visibility
        const styleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    const element = mutation.target;
                    if (isUIElement(element) && isElementVisible(element)) {
                        setTimeout(() => applyScrollFixToElement(element), 100);
                    }
                }
            });
        });

        // Observe common containers where dialogs might appear
        ['body', '#dialogs', '#menu', '#options', '#panels'].forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                styleObserver.observe(container, {
                    attributes: true,
                    attributeFilter: ['style', 'class'],
                    subtree: true
                });
            }
        });
    }

    function overrideJQueryUIDefaults() {
        // Wait for jQuery to be available
        const checkJQuery = () => {
            if (window.$ && $.fn && $.fn.dialog) {
                const originalDialog = $.fn.dialog;
                
                $.fn.dialog = function(options) {
                    if (typeof options === 'object' && options !== null) {
                        // Enhance options for mobile
                        const mobileOptions = {
                            maxWidth: '95vw',
                            maxHeight: '90vh',
                            width: 'auto',
                            height: 'auto',
                            modal: false, // Better performance on mobile
                            draggable: window.innerWidth > 768,
                            resizable: window.innerWidth > 768,
                            position: {
                                my: "center top",
                                at: "center top+5vh",
                                of: window
                            }
                        };

                        // Merge options
                        options = $.extend({}, mobileOptions, options);
                        
                        // Ensure mobile-friendly positioning
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
                                applyScrollFixToElement(dialog);
                            }
                        });
                    }, 100);

                    return result;
                };
            } else {
                // Retry if jQuery is not ready yet
                setTimeout(checkJQuery, 500);
            }
        };

        checkJQuery();
    }

    function setupWindowResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Re-apply fixes after resize
                fixAllExistingElements();
            }, 250);
        });
    }

    function applyScrollFixToElement(element) {
        if (!element || !element.style) return;

        try {
            // Apply basic scroll properties
            element.style.maxWidth = '95vw';
            element.style.maxHeight = '90vh';
            element.style.overflow = 'auto';
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overscrollBehavior = 'contain';
            element.style.boxSizing = 'border-box';

            // Add scrollable class for CSS targeting
            element.classList.add('scrollable-content');

            // Find and fix content areas within the element
            const contentSelectors = [
                '.ui-dialog-content', '.dialog-content', '.menu-content', '.panel-content',
                '.popup-content', '.modal-content', '.window-content', '.content', '.body',
                'table', '.table', '.grid', '.list', 'form', '.form', 'ul', 'ol'
            ];

            contentSelectors.forEach(selector => {
                const content = element.querySelector(selector);
                if (content) {
                    content.style.maxHeight = '80vh';
                    content.style.overflowY = 'auto';
                    content.style.overflowX = 'auto';
                    content.style.webkitOverflowScrolling = 'touch';
                    content.style.overscrollBehavior = 'contain';
                    content.classList.add('scrollable-content');
                }
            });

            // Special handling for tables
            const tables = element.querySelectorAll('table');
            tables.forEach(table => {
                if (!table.closest('.table, .scrollable-content')) {
                    // Wrap table in scrollable container
                    const wrapper = document.createElement('div');
                    wrapper.className = 'table scrollable-content';
                    wrapper.style.maxHeight = '75vh';
                    wrapper.style.maxWidth = '90vw';
                    wrapper.style.overflow = 'auto';
                    wrapper.style.webkitOverflowScrolling = 'touch';
                    
                    table.parentNode.insertBefore(wrapper, table);
                    wrapper.appendChild(table);
                }
            });

            // Fix long lists
            const lists = element.querySelectorAll('ul, ol, select[multiple]');
            lists.forEach(list => {
                list.style.maxHeight = '60vh';
                list.style.overflowY = 'auto';
                list.style.webkitOverflowScrolling = 'touch';
            });

        } catch (error) {
            console.warn('Error applying scroll fix to element:', error);
        }
    }

    function isUIElement(element) {
        if (!element || !element.tagName) return false;
        
        const uiIndicators = [
            'dialog', 'menu', 'panel', 'popup', 'modal', 'window', 'overlay',
            'dropdown', 'tooltip', 'sidebar', 'toolbar', 'form'
        ];
        
        const id = element.id ? element.id.toLowerCase() : '';
        const className = element.className ? element.className.toLowerCase() : '';
        const role = element.getAttribute('role') || '';
        
        return uiIndicators.some(indicator => 
            id.includes(indicator) || 
            className.includes(indicator) || 
            role.includes(indicator)
        ) || element.matches('.ui-dialog, .dialog, .menu, .panel, [role="dialog"], [role="menu"]');
    }

    function isElementVisible(element) {
        if (!element) return false;
        
        return element.offsetParent !== null || 
               (element.style.display !== 'none' && 
                element.style.visibility !== 'hidden' &&
                element.clientHeight > 0 &&
                element.clientWidth > 0);
    }    // Expose functions for debugging
    window.UniversalScrollFix = {
        applyScrollFixToElement,
        fixAllExistingElements,
        isUIElement,
        isElementVisible,
        initUniversalScrollFix,
        fixFantasyMapGeneratorElements: fixFantasyMapGeneratorElements,
        applyOptionsMenuFix: applyOptionsMenuFix,
        applyTabContentFix: applyTabContentFix
    };

    // Fantasy Map Generator specific functions
    function fixFantasyMapGeneratorElements() {
        // Fix the main Options menu
        const optionsMenu = document.getElementById('options');
        if (optionsMenu) {
            applyOptionsMenuFix(optionsMenu);
        }

        // Fix all tab content areas
        const tabContents = document.querySelectorAll('.tabcontent');
        tabContents.forEach(tab => {
            applyTabContentFix(tab);
        });

        // Fix style elements container
        const styleElements = document.getElementById('styleElements');
        if (styleElements) {
            applyStyleElementsFix(styleElements);
        }

        // Fix any existing overview panels
        const overviewSelectors = [
            '#burgsOverview', '#militaryOverview', '#statesOverview', 
            '#culturesOverview', '#religionsOverview', '#markersOverview',
            '#notesOverview', '#riversOverview'
        ];
        
        overviewSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                applyScrollFixToElement(element);
            }
        });

        // Fix editor panels
        const editorSelectors = [
            '#burgEditor', '#stateEditor', '#cultureEditor', '#religionEditor',
            '#markerEditor', '#labelEditor', '#routeEditor', '#heightmapEditor',
            '#reliefEditor', '#zonesEditor', '#unitsEditor'
        ];
        
        editorSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                applyScrollFixToElement(element);
            }
        });
    }

    function applyOptionsMenuFix(optionsMenu) {
        if (!optionsMenu) return;

        // Apply flexbox layout for proper scrolling
        optionsMenu.style.display = 'flex';
        optionsMenu.style.flexDirection = 'column';
        optionsMenu.style.maxHeight = '90vh';
        optionsMenu.style.overflow = 'hidden';
        optionsMenu.style.boxSizing = 'border-box';

        // Fix the tab header
        const tabHeader = optionsMenu.querySelector('.tab');
        if (tabHeader) {
            tabHeader.style.flexShrink = '0';
            tabHeader.style.position = 'sticky';
            tabHeader.style.top = '0';
            tabHeader.style.zIndex = '10';
            tabHeader.style.backgroundColor = 'var(--bg-light)';
        }

        // Fix all tab content areas
        const tabContents = optionsMenu.querySelectorAll('.tabcontent');
        tabContents.forEach(tabContent => {
            applyTabContentFix(tabContent);
        });
    }

    function applyTabContentFix(tabContent) {
        if (!tabContent) return;

        tabContent.style.flex = '1';
        tabContent.style.overflowY = 'auto';
        tabContent.style.overflowX = 'hidden';
        tabContent.style.maxHeight = 'calc(90vh - 80px)';
        tabContent.style.webkitOverflowScrolling = 'touch';
        tabContent.style.overscrollBehavior = 'contain';
        tabContent.classList.add('scrollable-content');

        // Fix tables within tab content
        const tables = tabContent.querySelectorAll('table');
        tables.forEach(table => {
            table.style.width = '100%';
            table.style.tableLayout = 'fixed';
            table.style.wordWrap = 'break-word';
            
            // Fix table cells
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
                cell.style.wordWrap = 'break-word';
                cell.style.overflowWrap = 'break-word';
                cell.style.maxWidth = '0';
            });
        });

        // Fix long select elements
        const selects = tabContent.querySelectorAll('select');
        selects.forEach(select => {
            select.style.maxWidth = '100%';
            select.style.whiteSpace = 'nowrap';
            select.style.overflow = 'hidden';
            select.style.textOverflow = 'ellipsis';
        });
    }

    function applyStyleElementsFix(styleElements) {
        if (!styleElements) return;

        styleElements.style.maxHeight = 'calc(90vh - 120px)';
        styleElements.style.overflowY = 'auto';
        styleElements.style.overflowX = 'hidden';
        styleElements.style.webkitOverflowScrolling = 'touch';
        styleElements.style.overscrollBehavior = 'contain';
        styleElements.classList.add('scrollable-content');
    }

    function setupOptionsMenuMonitoring() {
        // Monitor for Options menu visibility changes
        const optionsMenu = document.getElementById('options');
        if (optionsMenu) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const isVisible = optionsMenu.style.display !== 'none' && 
                                        optionsMenu.offsetParent !== null;
                        if (isVisible) {
                            setTimeout(() => applyOptionsMenuFix(optionsMenu), 50);
                        }
                    }
                });
            });

            observer.observe(optionsMenu, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }

        // Monitor for tab changes
        const tabButtons = document.querySelectorAll('#options .tab button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                setTimeout(() => {
                    const activeTab = document.querySelector('.tabcontent[style*="display: block"], .tabcontent[style*="display:block"]');
                    if (activeTab) {
                        applyTabContentFix(activeTab);
                    }
                }, 100);
            });
        });
    }

    console.log('Universal Scroll Fix initialized');

})();
