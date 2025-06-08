/**
 * Azgaar Native Dialog System
 * Modern replacement for jQuery UI dialogs with Android WebView compatibility
 * Version: 1.0.0
 */

(function() {
    'use strict';

    console.log('Azgaar Native Dialog System loading...');

    // Detect Android WebView and mobile environments
    const isAndroidWebView = /Android.*wv\)|.*WebView/i.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isCapacitor = window.Capacitor !== undefined;
    const needsNativeDialogs = isAndroidWebView || isMobile || isCapacitor;

    console.log('Dialog system detection:', { isAndroidWebView, isMobile, isCapacitor, needsNativeDialogs });

    // Z-index management
    let dialogZIndex = 10000;
    let activeDialogs = new Map();

    /**
     * Native Dialog Class - Replacement for jQuery UI Dialog
     */
    class AzgaarDialog {
        constructor(element, options = {}) {
            this.element = typeof element === 'string' ? document.getElementById(element) : element;
            if (!this.element) {
                console.error('Dialog element not found:', element);
                return;
            }

            // Store original display style before hiding
            this.originalElementDisplay = this.element.style.display;

            this.id = this.element.id || 'dialog-' + Date.now();
            this.options = {
                title: options.title || 'Dialog',
                width: options.width || 'auto',
                height: options.height || 'auto',
                minWidth: options.minWidth || 150, // jQuery UI default
                minHeight: options.minHeight || 150, // jQuery UI default
                resizable: options.resizable !== false,
                draggable: options.draggable !== false,
                modal: options.modal || false,
                position: options.position || { my: "center", at: "center" },
                close: options.close || null,
                buttons: options.buttons || null,
                autoOpen: options.autoOpen !== false,
                ...options
            };

            this.isMinimized = false;
            this.originalState = {
                display: '',
                widgetHeight: '',
                widgetWidth: '',
                widgetMinWidth: '',
                widgetMinHeight: '',
                widgetMaxWidth: '',
                widgetMaxHeight: '',
                widgetPosition: '',
                widgetTop: '',
                widgetLeft: '',
                widgetTransform: '',
                contentHeight: '',
                contentOverflow: '',
                buttonPaneDisplay: ''
            };
            this.dialogWidget = null;
            this.isOpen = false;

            // If autoOpen is true (default), initialize and show
            if (this.options.autoOpen) {
                this.init();
            } else {
                // If autoOpen is false, still create the structure but don't show
                this.createDialogStructure(); // Create but don't call show()
                this.setupEventListeners(); // Listeners should be ready
            }
        }

        init() {
            // This check prevents re-initialization if already done by constructor (e.g. if autoOpen was false)
            if (!this.dialogWidget) {
                this.createDialogStructure();
                this.setupEventListeners();
            }
            this.applyPosition();
            this.show(); // This will set isOpen to true and dispatch open event
            activeDialogs.set(this.id, this);
        }

        createDialogStructure() {
            // Create dialog wrapper
            this.dialogWidget = document.createElement('div');
            this.dialogWidget.className = 'azgaar-dialog-widget ui-dialog ui-widget ui-widget-content ui-corner-all'; // Added more jQuery UI classes
            this.dialogWidget.id = `${this.id}-widget`;
            this.dialogWidget.style.cssText = `
                position: fixed; /* Changed from absolute for better viewport handling */
                background: white;
                border: 2px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: ${++dialogZIndex};
                min-width: ${typeof this.options.minWidth === 'number' ? this.options.minWidth + 'px' : this.options.minWidth};
                min-height: ${typeof this.options.minHeight === 'number' ? this.options.minHeight + 'px' : this.options.minHeight};
                max-width: 95vw; /* Default max width */
                max-height: 90vh; /* Default max height */
                display: flex;
                flex-direction: column;
                font-family: Arial, sans-serif;
                font-size: 12px;
                overflow: hidden; /* Prevent content from breaking out during resize/minimize */
            `;

            // Apply initial width and height
            if (this.options.width !== 'auto') {
                this.dialogWidget.style.width = typeof this.options.width === 'number' ? this.options.width + 'px' : this.options.width;
            }
            if (this.options.height !== 'auto') {
                this.dialogWidget.style.height = typeof this.options.height === 'number' ? this.options.height + 'px' : this.options.height;
            }

            // Create title bar
            const titleBar = document.createElement('div');
            titleBar.className = 'azgaar-dialog-titlebar ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix'; // Added more jQuery UI classes
            titleBar.style.cssText = `
                background: linear-gradient(to bottom, #f8f8f8, #e8e8e8);
                padding: 8px 12px;
                border-bottom: 1px solid #ddd;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: ${this.options.draggable ? 'move' : 'default'};
                user-select: none;
                border-radius: 6px 6px 0 0;
            `;

            const titleSpan = document.createElement('span');
            titleSpan.className = 'azgaar-dialog-title ui-dialog-title';
            titleSpan.textContent = this.options.title;
            titleSpan.style.cssText = `
                font-weight: bold;
                font-size: 14px;
                flex: 1;
            `;

            // Create button container
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'azgaar-dialog-buttons';
            buttonContainer.style.cssText = `
                display: flex;
                gap: 4px;
                margin-left: 8px;
            `;

            // Minimize button
            const minimizeBtn = document.createElement('button');
            minimizeBtn.className = 'azgaar-btn azgaar-minimize ui-dialog-titlebar-collapse';
            minimizeBtn.innerHTML = '−';
            minimizeBtn.title = 'Minimize';
            minimizeBtn.style.cssText = this.getButtonStyles();

            // Close button  
            const closeBtn = document.createElement('button');
            closeBtn.className = 'azgaar-btn azgaar-close ui-dialog-titlebar-close';
            closeBtn.innerHTML = '×';
            closeBtn.title = 'Close';
            closeBtn.style.cssText = this.getButtonStyles('#ff4444');

            buttonContainer.appendChild(minimizeBtn);
            buttonContainer.appendChild(closeBtn);

            titleBar.appendChild(titleSpan);
            titleBar.appendChild(buttonContainer);

            // Create content area
            const contentArea = document.createElement('div');
            contentArea.className = 'azgaar-dialog-content ui-dialog-content ui-widget-content'; // Added more jQuery UI classes
            contentArea.style.cssText = `
                padding: 16px;
                overflow: auto; /* Ensure content area itself is scrollable */
                flex: 1;
                min-height: 50px; /* Adjusted min-height */
            `;

            // Move original element content
            while (this.element.firstChild) {
                contentArea.appendChild(this.element.firstChild);
            }

            // Add buttons if specified
            if (this.options.buttons) {
                const buttonPane = this.createButtonPane();
                this.dialogWidget.appendChild(titleBar);
                this.dialogWidget.appendChild(contentArea);
                this.dialogWidget.appendChild(buttonPane);
            } else {
                this.dialogWidget.appendChild(titleBar);
                this.dialogWidget.appendChild(contentArea);
            }

            // Store references
            this.titleBar = titleBar;
            this.contentArea = contentArea;
            this.minimizeBtn = minimizeBtn;
            this.closeBtn = closeBtn;

            // Hide original element and insert dialog
            this.element.style.display = 'none'; // Element is hidden
            document.body.appendChild(this.dialogWidget);
        }

        getButtonStyles(bgColor = '#4CAF50') {
            return `
                width: 44px;
                height: 44px;
                border: none;
                background: ${bgColor};
                color: white;
                border-radius: 4px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                opacity: 0.8;
            `;
        }

        createButtonPane() {
            const buttonPane = document.createElement('div');
            buttonPane.className = 'azgaar-dialog-buttonpane ui-dialog-buttonpane';
            buttonPane.style.cssText = `
                padding: 8px 16px;
                border-top: 1px solid #ddd;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                background: #f8f8f8;
                border-radius: 0 0 6px 6px;
            `;

            Object.entries(this.options.buttons).forEach(([text, callback]) => {
                const button = document.createElement('button');
                button.textContent = text;
                button.className = 'azgaar-dialog-button';
                button.style.cssText = `
                    padding: 8px 16px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    min-width: 80px;
                `;

                button.addEventListener('click', (e) => {
                    if (typeof callback === 'function') {
                        callback.call(this.element, e);
                    }
                });

                button.addEventListener('mouseenter', function() {
                    this.style.background = '#1976D2';
                });

                button.addEventListener('mouseleave', function() {
                    this.style.background = '#2196F3';
                });

                buttonPane.appendChild(button);
            });

            return buttonPane;
        }

        setupEventListeners() {
            // Minimize button
            this.minimizeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMinimize();
            }, { passive: false });

            this.minimizeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.toggleMinimize();
            }, { passive: false });

            // Close button
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.destroy();
            }, { passive: false });

            this.closeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.destroy();
            }, { passive: false });

            // Button hover effects
            [this.minimizeBtn, this.closeBtn].forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    this.style.opacity = '1';
                    this.style.transform = 'scale(1.05)';
                });

                btn.addEventListener('mouseleave', function() {
                    this.style.opacity = '0.8';
                    this.style.transform = 'scale(1)';
                });

                btn.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.95)';
                }, { passive: true });

                btn.addEventListener('touchend', function() {
                    this.style.transform = 'scale(1)';
                }, { passive: true });
            });

            // Dragging (if enabled)
            if (this.options.draggable) {
                this.makeDraggable();
            }

            // ESC key handling
            this.escHandler = (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            };
            document.addEventListener('keydown', this.escHandler);
        }

        makeDraggable() {
            let isDragging = false;
            let startX, startY, startLeft, startTop;
            // Keep track of whether the dialog was dragged, to preserve its position
            let wasDragged = false; 

            const startDrag = (e) => {
                const event = e.type.includes('touch') ? e.touches[0] : e;
                isDragging = true;
                wasDragged = true; // Mark that the dialog has been dragged by the user
                startX = event.clientX;
                startY = event.clientY;
                
                const rect = this.dialogWidget.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;

                // When dragging starts, remove any transform that might conflict with explicit top/left
                this.dialogWidget.style.transform = 'none';

                this.dialogWidget.style.zIndex = ++dialogZIndex;
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
                document.addEventListener('touchmove', drag, { passive: false });
                document.addEventListener('touchend', stopDrag);
                
                e.preventDefault();
            };

            const drag = (e) => {
                if (!isDragging) return;
                
                const event = e.type.includes('touch') ? e.touches[0] : e;
                const deltaX = event.clientX - startX;
                const deltaY = event.clientY - startY;
                
                // Ensure the dialog stays within viewport boundaries
                const newLeft = Math.max(0, Math.min(startLeft + deltaX, window.innerWidth - this.dialogWidget.offsetWidth));
                const newTop = Math.max(0, Math.min(startTop + deltaY, window.innerHeight - this.dialogWidget.offsetHeight));
                
                this.dialogWidget.style.left = newLeft + 'px';
                this.dialogWidget.style.top = newTop + 'px';
                this.dialogWidget.style.position = 'fixed'; // Ensure it remains fixed
                this.dialogWidget.style.transform = 'none'; // Keep transform none during drag
                
                e.preventDefault();
            };

            const stopDrag = () => {
                isDragging = false;
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchmove', drag);
                document.removeEventListener('touchend', stopDrag);

                // After dragging, store the final position in options if needed, or rely on inline styles
                // For simplicity, we rely on the inline styles set during drag.
                // If we wanted to update this.options.position, we'd do it here.
            };

            this.titleBar.addEventListener('mousedown', startDrag);
            this.titleBar.addEventListener('touchstart', startDrag, { passive: false });

            // Add a property to the instance to check if it was dragged
            this.wasDragged = () => wasDragged;
        }

        toggleMinimize() {
            if (this.isMinimized) {
                // Restore
                this.dialogWidget.style.height = this.originalState.widgetHeight || 'auto';
                this.dialogWidget.style.width = this.originalState.widgetWidth || 'auto';
                this.dialogWidget.style.minWidth = this.originalState.widgetMinWidth || (typeof this.options.minWidth === 'number' ? this.options.minWidth + 'px' : this.options.minWidth);
                this.dialogWidget.style.minHeight = this.originalState.widgetMinHeight || (typeof this.options.minHeight === 'number' ? this.options.minHeight + 'px' : this.options.minHeight);
                this.dialogWidget.style.maxWidth = this.originalState.widgetMaxWidth || '95vw';
                this.dialogWidget.style.maxHeight = this.originalState.widgetMaxHeight || '90vh';
                this.dialogWidget.style.overflow = 'hidden';
                
                // Restore position and transform exactly as they were
                this.dialogWidget.style.top = this.originalState.widgetTop;
                this.dialogWidget.style.left = this.originalState.widgetLeft;
                this.dialogWidget.style.transform = this.originalState.widgetTransform;

                this.contentArea.style.display = this.originalState.display || '';
                this.contentArea.style.height = this.originalState.contentHeight || 'auto';
                this.contentArea.style.overflow = this.originalState.contentOverflow || 'auto';
                
                const buttonPane = this.dialogWidget.querySelector('.azgaar-dialog-buttonpane');
                if (buttonPane) {
                    buttonPane.style.display = this.originalState.buttonPaneDisplay || '';
                }

                this.minimizeBtn.innerHTML = '−'; 
                this.minimizeBtn.title = 'Minimize';
                this.titleBar.style.background = 'linear-gradient(to bottom, #f8f8f8, #e8e8e8)';
                this.isMinimized = false;
                this.dialogWidget.style.zIndex = ++dialogZIndex; // Bring to front on restore
            } else {
                // Minimize
                this.originalState.widgetHeight = this.dialogWidget.style.height;
                this.originalState.widgetWidth = this.dialogWidget.style.width;
                this.originalState.widgetMinWidth = this.dialogWidget.style.minWidth;
                this.originalState.widgetMinHeight = this.dialogWidget.style.minHeight;
                this.originalState.widgetMaxWidth = this.dialogWidget.style.maxWidth;
                this.originalState.widgetMaxHeight = this.dialogWidget.style.maxHeight;
                
                // Save current position and transform state *before* altering dimensions
                this.originalState.widgetPosition = this.dialogWidget.style.position; // Should always be fixed
                this.originalState.widgetTop = this.dialogWidget.style.top;
                this.originalState.widgetLeft = this.dialogWidget.style.left;
                this.originalState.widgetTransform = this.dialogWidget.style.transform;

                this.originalState.display = this.contentArea.style.display;
                this.originalState.contentHeight = this.contentArea.style.height;
                this.originalState.contentOverflow = this.contentArea.style.overflow;

                this.contentArea.style.display = 'none';
                
                const buttonPane = this.dialogWidget.querySelector('.azgaar-dialog-buttonpane');
                if (buttonPane) {
                    this.originalState.buttonPaneDisplay = buttonPane.style.display;
                    buttonPane.style.display = 'none';
                }
                
                const titleBarHeight = this.titleBar.offsetHeight;
                this.dialogWidget.style.height = titleBarHeight + 'px';
                this.dialogWidget.style.width = 'auto'; 
                this.dialogWidget.style.minWidth = '150px'; // Smaller min-width when minimized
                this.dialogWidget.style.minHeight = titleBarHeight + 'px'; // Min height is title bar height
                this.dialogWidget.style.maxHeight = titleBarHeight + 'px';
                this.dialogWidget.style.overflow = 'visible'; // Allow title bar to be fully visible if it has shadows/borders

                this.minimizeBtn.innerHTML = '▲'; 
                this.minimizeBtn.title = 'Restore';
                this.titleBar.style.background = 'linear-gradient(to bottom, #4CAF50, #45a049)'; 
                this.isMinimized = true;
            }
        }

        applyPosition() {
            if (!this.options.position || !this.dialogWidget) return;

            // Only apply initial position if the dialog hasn't been dragged by the user
            if (this.wasDragged && this.wasDragged()) {
                // If it was dragged, its position is already set by the drag logic (inline styles)
                // We might still want to update this.options.position if we save it after drag.
                // For now, if dragged, we assume its current inline style is the desired position.
                return; 
            }

            const pos = this.options.position;
            const widget = this.dialogWidget;
            
            // Reset transform before applying new position rules, unless it's center-center
            widget.style.transform = 'none'; 

            if (pos.my === "center" && pos.at === "center") {
                widget.style.left = '50%';
                widget.style.top = '50%';
                widget.style.transform = 'translate(-50%, -50%)';
                // Clear explicit right/bottom that might have been set by other positioning logic
                widget.style.right = 'auto';
                widget.style.bottom = 'auto';
                return;
            }

            // For other specific positions, ensure transform is cleared
            // widget.style.transform = 'none'; // Already done above

            if (typeof pos.my === 'string' && typeof pos.at === 'string') {
                const [atH, atV] = pos.at.split(' ');
                
                let left = 'auto', top = 'auto', right = 'auto', bottom = 'auto';
                
                if (atH.includes('right')) {
                    const offset = atH.match(/-?\d+/) ? parseInt(atH.match(/-?\d+/)[0]) : 0;
                    right = Math.abs(offset) + 'px';
                } else if (atH.includes('left')) {
                    const offset = atH.match(/\+?\d+/) ? parseInt(atH.match(/\+?\d+/)[0]) : 0;
                    left = offset + 'px';
                }
                
                if (atV.includes('top')) {
                    const offset = atV.match(/\+?\d+/) ? parseInt(atV.match(/\+?\d+/)[0]) : 0;
                    top = offset + 'px';
                } else if (atV.includes('bottom')) {
                    const offset = atV.match(/-?\d+/) ? parseInt(atV.match(/-?\d+/)[0]) : 0;
                    bottom = Math.abs(offset) + 'px';
                }

                Object.assign(this.dialogWidget.style, { left, top, right, bottom });
            }
        }

        show() {
            if (!this.dialogWidget) { // If dialog was autoOpen:false, it might not be in DOM yet
                // This case should ideally be handled by ensuring createDialogStructure was called.
                // For now, let's assume init() is called before show if autoOpen was false.
                console.warn("AzgaarDialog: show() called but dialogWidget not fully initialized or appended.");
                // this.init(); // This could lead to double init if not careful
                // return;
            }
            
            // If dialogWidget is not in the DOM (e.g. after destroy then open, or autoOpen:false)
            if (!this.dialogWidget.parentNode) {
                document.body.appendChild(this.dialogWidget);
            }

            this.dialogWidget.style.display = 'flex';
            this.isOpen = true;
            this.moveToTop(); // Bring to front when shown

            // Trigger custom event 'dialogopen'
            const openEvent = new CustomEvent('dialogopen', { detail: { dialog: this } });
            this.element.dispatchEvent(openEvent);

            // Trigger jQuery UI compatible 'open' event if jQuery is present
            if (window.$ && $(this.element).trigger) {
                $(this.element).trigger('dialogopen', { dialog: this });
            }
        }

        close() {
            // Call the close callback if defined, with 'this.element' as context
            if (this.options.close && typeof this.options.close === 'function') {
                // jQuery UI's close callback receives (event, ui)
                // We'll pass a simple event-like object for now.
                const event = { type: 'dialogclose', target: this.element };
                const ui = { dialog: this }; // Or pass 'this' directly if that's more useful
                try {
                    const result = this.options.close.call(this.element, event, ui);
                    if (result === false) return; // Prevent closing if callback returns false
                } catch (e) {
                    console.error("Error in dialog close callback:", e);
                }
            }

            this.isOpen = false; // Set isOpen to false before dispatching event
            
            // Trigger custom event 'dialogclose'
            const closeEvent = new CustomEvent('dialogclose', { detail: { dialog: this } });
            this.element.dispatchEvent(closeEvent);
            
            // Trigger jQuery UI compatible 'close' event if jQuery is present
            if (window.$ && $(this.element).trigger) {
                $(this.element).trigger('dialogclose', { dialog: this });
            }

            if (this.dialogWidget && this.dialogWidget.parentNode) {
                this.dialogWidget.parentNode.removeChild(this.dialogWidget);
            }
            
            // Restore original element display style
            this.element.style.display = this.originalElementDisplay !== undefined ? this.originalElementDisplay : '';
            
            document.removeEventListener('keydown', this.escHandler);
            // Drag handlers are on titleBar or document, remove them in destroy if necessary
            activeDialogs.delete(this.id);
        }

        destroy() {
            if (!this.dialogWidget) return; // Nothing to destroy

            this.close(); // Perform normal close procedure first (runs callbacks, sets isOpen=false)

            // Move content back to original element
            if (this.contentArea) {
                while (this.contentArea.firstChild) {
                    this.element.appendChild(this.contentArea.firstChild);
                }
            }

            // Remove dialog widget from DOM (already done by close if it was open)
            if (this.dialogWidget.parentNode) {
                this.dialogWidget.parentNode.removeChild(this.dialogWidget);
            }
            this.dialogWidget = null; // Clear reference

            // Remove document-level event listeners
            document.removeEventListener('keydown', this.escHandler);
            // If makeDraggable added listeners to document, remove them here.
            // (Currently, makeDraggable's stopDrag removes them, but good to be sure if logic changes)
            // Example: if drag listeners were persistent:
            // document.removeEventListener('mousemove', this.dragHandlerRef); 
            // document.removeEventListener('mouseup', this.stopDragHandlerRef);

            // Restore original element's display (already done by close)
            // this.element.style.display = this.originalElementDisplay !== undefined ? this.originalElementDisplay : '';

            // Clean up jQuery data if used by the integration layer
            if (window.$ && $(this.element).removeData) {
                $(this.element).removeData('azgaar-dialog');
            }
            
            activeDialogs.delete(this.id);
            console.log('AzgaarDialog destroyed:', this.id);
        }

        moveToTop() {
            if (this.dialogWidget) {
                this.dialogWidget.style.zIndex = ++dialogZIndex;
            }
        }

        // jQuery UI compatibility methods
        dialog(methodOrOptions, ...args) {
            if (typeof methodOrOptions === 'string') {
                // Method call
                const method = methodOrOptions;
                switch (method) {
                    case 'open':
                        if (!this.isOpen) { // Only open if not already open
                           if (!this.dialogWidget || !this.dialogWidget.parentNode) {
                                // If dialog was destroyed or autoOpen:false, re-initialize structure if needed
                                // This path assumes createDialogStructure and setupEventListeners were called at least once.
                                // If dialogWidget is null, it means it was fully destroyed.
                                if (!this.dialogWidget) {
                                    this.createDialogStructure();
                                    this.setupEventListeners();
                                }
                            }
                            this.applyPosition(); // Re-apply position before showing
                            this.show();
                        }
                        break;
                    case 'close':
                        if (this.isOpen) { // Only destroy if open
                            this.destroy();
                        }
                        break;
                    case 'isOpen':
                        return this.isOpen;
                    case 'destroy':
                        this.destroy();
                        break;
                    case 'widget':
                        return this.dialogWidget;
                    case 'option':
                        if (args.length === 0 && typeof args[0] === 'string') { // Typo in original: args.length === 1
                             // Getter for all options if only 'option' is passed
                            return {...this.options};
                        }
                        if (args.length === 1 && typeof args[0] === 'string') {
                            // Getter for a specific option
                            return this.options[args[0]];
                        } else if (args.length === 2 && typeof args[0] === 'string') {
                            // Setter for a specific option: option(key, value)
                            const key = args[0];
                            const value = args[1];
                            this.options[key] = value;

                            if (!this.dialogWidget) return this; // Dialog might not be fully initialized (e.g. autoOpen: false)

                            switch (key) {
                                case 'title':
                                    if (this.titleBar) { this.titleBar.querySelector('.azgaar-dialog-title').textContent = value; }
                                    break;
                                case 'width':
                                    this.dialogWidget.style.width = (value === 'auto' || typeof value === 'string' && value.includes('%')) ? value : (value + 'px');
                                    break;
                                case 'height':
                                    this.dialogWidget.style.height = (value === 'auto' || typeof value === 'string' && value.includes('%')) ? value : (value + 'px');
                                    break;
                                case 'minWidth':
                                    this.dialogWidget.style.minWidth = (typeof value === 'number' ? value + 'px' : value);
                                    break;
                                case 'minHeight':
                                    this.dialogWidget.style.minHeight = (typeof value === 'number' ? value + 'px' : value);
                                    break;
                                case 'position':
                                    // When position is set via option, re-evaluate and apply it.
                                    // Reset wasDragged so applyPosition can work if it's a programmatic change.
                                    if (this.wasDragged) { this.wasDragged = () => false; } 
                                    this.applyPosition();
                                    break;
                                case 'buttons':
                                    if (this.dialogWidget) {
                                        const oldButtonPane = this.dialogWidget.querySelector('.azgaar-dialog-buttonpane');
                                        if (oldButtonPane) oldButtonPane.remove();
                                        if (value && Object.keys(value).length > 0) {
                                            const newButtonPane = this.createButtonPane(); // createButtonPane uses this.options.buttons
                                            this.dialogWidget.appendChild(newButtonPane);
                                        }
                                    }
                                    break;
                                case 'draggable':
                                    if (this.titleBar) this.titleBar.style.cursor = value ? 'move' : 'default';
                                    // If turning draggable on/off dynamically, would need to add/remove drag listeners
                                    break;
                                // Add other option handlers as needed (e.g., resizable, modal)
                            }
                        } else if (args.length === 1 && typeof args[0] === 'object') {
                            // Setter for multiple options: option({ key: value, ... })
                            const newOptions = args[0];
                            for (const key in newOptions) {
                                this.dialog('option', key, newOptions[key]);
                            }
                        }
                        break;
                    case 'moveToTop':
                        this.moveToTop();
                        break;
                    default:
                        console.warn('AzgaarDialog: method not fully implemented or unknown -', method);
                }
            } else if (typeof methodOrOptions === 'object') {
                // Re-initializing with new options (jQuery UI behavior)
                const newOptions = methodOrOptions;
                // Update all options. Similar to multiple option setter.
                for (const key in newOptions) {
                    this.dialog('option', key, newOptions[key]);
                }
                // If it was autoOpen:false and now trying to open with new options,
                // ensure it's opened if autoOpen is not explicitly false in newOptions.
                if (newOptions.autoOpen !== false && !this.isOpen) {
                    this.dialog('open');
                }

            }
            return this; // Return 'this' (the AzgaarDialog instance)
        }
    }

    /**
     * jQuery UI Dialog Replacement Function
     */
    function createAzgaarDialog(element, options = {}) {
        if (needsNativeDialogs) {
            console.log('Using native dialog system for:', element);
            return new AzgaarDialog(element, options);
        } else {
            // Fallback to jQuery UI on desktop browsers
            if (window.$ && $.fn.dialog) {
                console.log('Using jQuery UI dialog for:', element);
                const $element = $(element);
                return $element.dialog(options);
            } else {
                console.warn('jQuery UI not available, falling back to native dialogs');
                return new AzgaarDialog(element, options);
            }
        }
    }

    /**
     * jQuery Integration - Override jQuery UI dialog method
     */
    function integrateWithJQuery() {
        if (typeof window.$ !== 'undefined' && typeof $.fn !== 'undefined' && needsNativeDialogs) {
            const originalDialog = $.fn.dialog;
            
            $.fn.dialog = function(optionsOrMethod, ...args) {
                if (this.length === 0) return this; // Return jQuery object for chaining
                
                let returnValue = this; // Default return for jQuery chaining

                this.each(function() { // Use .get(0) for the DOM element
                    const element = this; // 'this' is the DOM element here
                    let dialogInstance = $(element).data('azgaar-dialog');
                    
                    if (typeof optionsOrMethod === 'string') {
                        // Method call
                        if (dialogInstance && typeof dialogInstance.dialog === 'function') {
                            const result = dialogInstance.dialog(optionsOrMethod, ...args);
                            // For getter methods, jQuery UI returns the value from the first element in the set.
                            // We need to handle this if 'this' (jQuery selection) can be multiple elements.
                            // For simplicity, assuming one dialog per call for now or that getters return from first.
                            if (optionsOrMethod === 'isOpen' || (optionsOrMethod === 'option' && args.length <= 1)) {
                                returnValue = result; // Actual return value for getters
                                return false; // Break .each loop for getters, returning value from first element
                            }
                        } else {
                            console.warn("AzgaarDialog: Method call on uninitialized or non-Azgaar dialog:", element, optionsOrMethod);
                            // Optionally, call originalDialog if it exists and this is not an AzgaarDialog
                            // if (originalDialog) { 
                            //     returnValue = originalDialog.apply($(element), [optionsOrMethod, ...args]);
                            // }
                        }
                    } else {
                        // Initialize dialog or update options
                        if (!dialogInstance) {
                            dialogInstance = new AzgaarDialog(element, optionsOrMethod);
                            $(element).data('azgaar-dialog', dialogInstance);
                        } else {
                            // If already initialized, treat as an options update
                            dialogInstance.dialog(optionsOrMethod, ...args); // Pass all args for option updates
                        }
                    }
                });
                return returnValue; // Return jQuery object for chaining or specific value for getters
            };
            
            // Preserve original jQuery UI methods for non-mobile environments
            $.fn.dialog.original = originalDialog;
            
            console.log('jQuery UI dialog method overridden with native implementation');
        }
    }

    /**
     * Initialize the dialog system
     */
    function initDialogSystem() {
        console.log('Initializing Azgaar Dialog System...');
        
        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .azgaar-dialog-widget {
                font-family: Arial, sans-serif !important;
                box-sizing: border-box; /* Ensure box-sizing for widget */
            }
            
            .azgaar-dialog-widget * {
                box-sizing: border-box; /* And for all its children */
            }
            
            .azgaar-btn:hover {
                opacity: 1 !important;
                transform: scale(1.05) !important;
            }
            
            .azgaar-btn:active {
                transform: scale(0.95) !important;
            }
            
            @media (max-width: 768px) {
                .azgaar-dialog-widget {
                    margin: 10px !important;
                    max-width: calc(100vw - 20px) !important;
                    max-height: calc(100vh - 20px) !important;
                }
                
                .azgaar-btn {
                    min-width: 48px !important;
                    min-height: 48px !important;
                }
                
                .azgaar-dialog-content {
                    padding: 12px !important;
                    font-size: 14px !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Wait for jQuery to be available, then integrate
        const checkJQuery = () => {
            if (typeof window.$ !== 'undefined') {
                integrateWithJQuery();
            } else {
                setTimeout(checkJQuery, 100);
            }
        };
        
        // Start integration after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkJQuery);
        } else {
            checkJQuery();
        }
        
        // Expose globally for debugging
        window.AzgaarDialog = AzgaarDialog;
        window.createAzgaarDialog = createAzgaarDialog;
        
        console.log('Azgaar Dialog System initialized successfully');
    }

    // Auto-initialize
    initDialogSystem();

})();
