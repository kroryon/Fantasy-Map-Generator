/**
 * Azgaar Touch Enhancements - Clean Version
 * Safe improvements for Fantasy Map Generator mobile experience
 * No interference with core event handling
 */

// Wait for DOM and main app to load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initAzgaarTouchEnhancementsSafe, 3000);
});

function initAzgaarTouchEnhancementsSafe() {
    console.log('Initializing Azgaar Touch Enhancements (Safe Mode)...');
    
    // Only apply completely safe enhancements
    improveTouchTargetsSafe();
    enhanceTooltipsSafe();
    addMobileCSSEnhancements();
    
    console.log('Azgaar Touch Enhancements applied safely');
}

function improveTouchTargetsSafe() {
    // Enhance small buttons and icons without interfering with events
    const selectors = ['.icon', 'button', '[onclick]', 'select'];
    
    selectors.forEach(selector => {
        setTimeout(() => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Only improve visual styling, don't add event listeners
                const rect = element.getBoundingClientRect();
                if (rect.width < 44 || rect.height < 44) {
                    element.style.minWidth = '44px';
                    element.style.minHeight = '44px';
                    element.style.padding = '8px';
                    element.style.boxSizing = 'border-box';
                }
            });
        }, 1000);
    });
}

function enhanceTooltipsSafe() {
    // Simple tooltip improvements without complex event handling
    const style = document.createElement('style');
    style.textContent = `
        [title]:hover::after {
            content: attr(title);
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            white-space: nowrap;
        }
    `;
    document.head.appendChild(style);
}

function addMobileCSSEnhancements() {
    // Add mobile-specific CSS improvements
    const azgaarMobileCSS = document.createElement('style');
    azgaarMobileCSS.textContent = `        @media (max-width: 768px) {
            /* Better menu panels - enhanced for universal scrolling */
            #menu, .panel, [id$="Menu"], [id$="Panel"], .ui-dialog, .dialog {
                max-width: 95vw !important;
                max-height: 90vh !important;
                overflow: auto !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior: contain !important;
            }
            
            /* Improve buttons in toolbars */
            #toolbar button, #options button, .icon {
                min-width: 44px !important;
                min-height: 44px !important;
                margin: 2px !important;
            }
            
            /* Better input fields */
            input, select, textarea {
                font-size: 16px !important;
                padding: 12px !important;
                min-height: 44px !important;
            }
            
            /* Improve close buttons */
            .icon-times, .close {
                min-width: 48px !important;
                min-height: 48px !important;
                font-size: 18px !important;
            }
              /* Better scrollbars - enhanced for touch */
            ::-webkit-scrollbar {
                width: 14px !important;
                height: 14px !important;
                background-color: rgba(0,0,0,0.1) !important;
            }
            
            ::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.4) !important;
                border-radius: 7px !important;
                border: 2px solid transparent !important;
                background-clip: content-box !important;
                min-height: 30px !important;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.6) !important;
            }
            
            ::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.05) !important;
                border-radius: 7px !important;
            }
            
            /* Prevent text selection on UI elements */
            .icon, button, .toolbar, #options {
                -webkit-user-select: none !important;
                user-select: none !important;
            }
            
            /* Better canvas interaction */
            #map {
                touch-action: pan-zoom !important;
            }
        }
        
        /* Touch-specific styles */
        @media (hover: none) and (pointer: coarse) {
            /* Add touch feedback without JavaScript */
            button:active, .icon:active, [onclick]:active {
                background: rgba(255, 255, 255, 0.2) !important;
                transform: scale(0.95) !important;
                opacity: 0.8 !important;
            }
        }
        
        /* BlueStacks and emulator specific fixes */
        .bluestacks-fix button, .bluestacks-fix .icon, .bluestacks-fix [onclick] {
            cursor: pointer !important;
            -webkit-tap-highlight-color: rgba(0,0,0,0.1) !important;
        }
    `;
    
    document.head.appendChild(azgaarMobileCSS);
    
    // Add BlueStacks detection class
    if (navigator.userAgent.includes('BlueStacks') || 
        (window.navigator.platform === 'Win32' && /Android/i.test(navigator.userAgent))) {
        document.body.classList.add('bluestacks-fix');
        console.log('BlueStacks detected - applying compatibility fixes');
    }
}
