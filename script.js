document.addEventListener('DOMContentLoaded', () => {
    // Select all necessary elements at the start of DOMContentLoaded.
    // Ensure these IDs match your HTML exactly.
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const parallaxBg = document.getElementById('parallax-bg'); // Only one declaration
    const filamentSectionsContainer = document.getElementById('filament-sections-container');
    const sectionsToReveal = document.querySelectorAll('.fade-in'); // For scroll reveal
    const colorPickerToggle = document.getElementById('color-picker-toggle');
    const colorPickerToggleLi = document.getElementById('color-picker-toggle-li'); // New: reference to the LI
    const colorPickerPopout = document.getElementById('color-picker-popout');
    const popupOverlay = document.getElementById('popup-overlay');
    const mainTitleColorInput = document.getElementById('main-title-color');
    const accentColorInput = document.getElementById('accent-color');
    const propertyBoxColorInput = document.getElementById('property-box-color');

    // All main content sections that the sidebar links to
    const mainSections = document.querySelectorAll('#home-section, #about-section, #filament-types-section, #faq-section');

    // Helper to convert hex to RGB components (e.g., "255, 0, 128")
    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
        // Handle #RRGGBB
        if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `${r}, ${g}, ${b}`;
    }

    // --- Color Customization Logic ---
    const defaultColors = {
        mainTitleGlow: '#00e676',
        accent: '#00e676',
        propertyBoxBg: '#00e676'
    };

    // Function to apply colors to CSS variables
    function applyColors(colors) {
        document.documentElement.style.setProperty('--main-title-glow-color', colors.mainTitleGlow);
        document.documentElement.style.setProperty('--main-title-glow-color-rgb', hexToRgb(colors.mainTitleGlow));

        document.documentElement.style.setProperty('--accent-color', colors.accent);
        document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(colors.accent));

        document.documentElement.style.setProperty('--property-box-bg-color', colors.propertyBoxBg);
        document.documentElement.style.setProperty('--property-box-bg-color-rgb', hexToRgb(colors.propertyBoxBg));
    }

    // Function to load colors from localStorage
    function loadColors() {
        try {
            const savedColors = localStorage.getItem('customThemeColors');
            if (savedColors) {
                const parsedColors = JSON.parse(savedColors);
                // Ensure all default keys are present in parsedColors
                return {
                    mainTitleGlow: parsedColors.mainTitleGlow || defaultColors.mainTitleGlow,
                    accent: parsedColors.accent || defaultColors.accent,
                    propertyBoxBg: parsedColors.propertyBoxBg || defaultColors.propertyBoxBg
                };
            }
        } catch (e) {
            console.error("Error parsing custom theme colors from localStorage:", e);
            localStorage.removeItem('customThemeColors'); // Clear invalid data
        }
        return defaultColors;
    }

    // Function to save colors to localStorage
    function saveColors(colors) {
        try {
            localStorage.setItem('customThemeColors', JSON.stringify(colors));
        } catch (e) {
            console.error("Error saving custom theme colors to localStorage:", e);
        }
    }

    // Initialize colors on page load
    const currentColors = loadColors();
    applyColors(currentColors);
    // Set initial values of color inputs if elements exist
    if (mainTitleColorInput) mainTitleColorInput.value = currentColors.mainTitleGlow;
    if (accentColorInput) accentColorInput.value = currentColors.accent;
    if (propertyBoxColorInput) propertyBoxColorInput.value = currentColors.propertyBoxBg;

    // Event listeners for color input changes
    if (mainTitleColorInput) {
        mainTitleColorInput.addEventListener('input', (e) => {
            currentColors.mainTitleGlow = e.target.value;
            applyColors(currentColors);
            saveColors(currentColors);
        });
    }
    if (accentColorInput) {
        accentColorInput.addEventListener('input', (e) => {
            currentColors.accent = e.target.value;
            applyColors(currentColors);
            saveColors(currentColors);
        });
    }
    if (propertyBoxColorInput) {
        propertyBoxColorInput.addEventListener('input', (e) => {
            currentColors.propertyBoxBg = e.target.value;
            applyColors(currentColors);
            saveColors(currentColors);
        });
    }

    // Toggle color picker pop-out and overlay
    if (colorPickerToggle && colorPickerPopout && popupOverlay) {
        colorPickerToggle.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            e.stopPropagation(); // Stop click from bubbling to document
            colorPickerPopout.classList.toggle('visible');
            popupOverlay.classList.toggle('visible'); // Toggle overlay visibility
        });

        // Close pop-out if clicked anywhere outside popout or on the overlay
        document.addEventListener('click', (e) => {
            // Check if the click occurred inside the popout or on the toggle itself
            const isClickInsidePopout = colorPickerPopout.contains(e.target);
            const isClickOnToggle = colorPickerToggle.contains(e.target) || e.target === colorPickerToggle;

            if (colorPickerPopout.classList.contains('visible') && !isClickInsidePopout && !isClickOnToggle) {
                colorPickerPopout.classList.remove('visible');
                popupOverlay.classList.remove('visible');
            }
        });
    } else {
        console.warn("Color picker toggle, popout, or overlay element not found. This might be normal if 'testing_mode' is false.");
    }


    // --- Scroll Down Arrow functionality ---
    if (scrollDownArrow) {
        scrollDownArrow.addEventListener('click', () => {
            const aboutSection = document.getElementById('about-section');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // Fallback for cases where about-section might not exist, scroll down by a view height
                window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
            }
        });
    } else {
        // console.warn("Scroll down arrow element not found."); // Less critical to warn if intentionally removed
    }

    // --- Sidebar Navigation Smooth Scrolling ---
    if (sidebarLinks.length > 0) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href'); // e.g., "#about-section"
                if (!targetId || targetId === '#') { // Handle cases where href is just '#'
                    return;
                }
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else {
                    console.warn(`Target element for ID '${targetId}' not found.`);
                }
            });
        });
    } else {
        console.warn("Sidebar navigation links not found.");
    }

    // --- Active Navbar State on Scroll ---
    // If no main sections are found, skip observer setup
    if (mainSections.length > 0) {
        const navObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5 // Adjust this threshold if sections aren't highlighting correctly.
        };

        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                // Only update active class if the entry is intersecting
                if (entry.isIntersecting) {
                    sidebarLinks.forEach(link => link.classList.remove('active'));
                    const correspondingLink = document.querySelector(`.sidebar-nav a[href="#${id}"]`);
                    if (correspondingLink) {
                        correspondingLink.classList.add('active');
                    }
                }
            });
        }, navObserverOptions);

        mainSections.forEach(section => {
            navObserver.observe(section);
        });
    } else {
        console.warn("No main sections found for navigation observer.");
    }

    // --- Filament Data Loading & Display ---
    fetch('filaments.json')
        .then(response => {
            if (!response.ok) {
                const errorStatus = response.status;
                const errorText = response.statusText;
                throw new Error(`HTTP error! Status: ${errorStatus} ${errorText || ''} - Failed to load filaments.json. Please ensure the file exists and is accessible.`);
            }
            return response.json();
        })
        .then(data => {
            // --- NEW: Testing Mode Logic ---
            // If testing_mode is true, add a class to the body to show the color picker elements
            if (data.testing_mode === true) {
                document.body.classList.add('testing-mode');
                // The CSS now handles showing/hiding color-picker-toggle-li based on .testing-mode class
                console.log("Testing Mode: Enabled. Color customization icon visible.");
            } else {
                document.body.classList.remove('testing-mode');
                // The CSS now handles showing/hiding color-picker-toggle-li based on .testing-mode class
                console.log("Testing Mode: Disabled. Color customization icon hidden.");
            }


            // Set background image from JSON
            if (parallaxBg && data.background_image) {
                parallaxBg.style.backgroundImage = `url('${data.background_image}')`;
            } else if (!parallaxBg) {
                console.warn("Parallax background element (#parallax-bg) not found in HTML.");
            } else if (!data.background_image) {
                console.warn("Background image URL not found in filaments.json. Using a default background.");
                parallaxBg.style.backgroundImage = 'url("https://source.unsplash.com/random/1920x1080/?futuristic-tech,dark-abstract")';
                parallaxBg.style.filter = 'blur(15px) brightness(0.8)';
            }


            // Set glassiness strength as a CSS custom property
            if (typeof data.glassiness_strength === 'number') {
                document.documentElement.style.setProperty('--glassiness-strength', data.glassiness_strength);
                console.log('Glassiness strength set to:', data.glassiness_strength);
            } else {
                console.warn("glassiness_strength not found or is not a number in filaments.json. Defaulting to 1.0.");
                document.documentElement.style.setProperty('--glassiness-strength', 1.0); // Fallback
            }

            const filaments = data.filaments;

            // Clear loading messages and populate filament sections
            if (filamentSectionsContainer) {
                filamentSectionsContainer.innerHTML = ''; // Clear "Loading filament details..."
                // No need to add filament-grid-container class here if it's already in CSS or not needed
                // filamentSectionsContainer.classList.add('filament-grid-container'); // This might be redundant if already in CSS

                filaments.forEach(filament => {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.classList.add('filament-item');
                    sectionDiv.setAttribute('data-filament-id', filament.id);

                    const colors = Array.isArray(filament.colors) ? filament.colors : [];
                    const colorsHtml = colors.map(colorHex => {
                        return `<span class="color-box" style="background-color: ${colorHex};" title="${colorHex}"></span>`;
                    }).join('');

                    sectionDiv.innerHTML = `
                        <h3>${filament.name}</h3>
                        <p>${filament.description}</p>
                        <div class="filament-properties">
                            <span class="filament-property-item filament-price"><i class="fas fa-money-bill-wave"></i> Price: $${filament.base_price_per_gram.toFixed(2)}/gram</span>
                            <span class="filament-property-item filament-hardness"><i class="fas fa-ruler-combined"></i> Hardness (Shore D): ${filament.hardness_shore_d}</span>
                            <span class="filament-property-item filament-colors colors-list">
                                <i class="fas fa-palette"></i> Colors:
                                <div class="color-boxes-wrapper">
                                    ${colorsHtml}
                                </div>
                            </span>
                        </div>
                    `;
                    filamentSectionsContainer.appendChild(sectionDiv);
                });
            } else {
                console.error("Error: Element with ID 'filament-sections-container' not found. Cannot display filament details.");
                const errorHtml = `<p style="color: #ff6b6b; text-align: center; padding: 20px;">
                                    <strong>Error:</strong> Filament details container missing in HTML.
                                  </p>`;
                // Attempt to insert error message even if container is null
                document.querySelector('#filament-types-section')?.insertAdjacentHTML('beforeend', errorHtml);
            }

            // --- Scroll Reveal Effect (after content is loaded) ---
            if (sectionsToReveal.length > 0) {
                const observerOptions = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.1
                };

                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('show');
                            observer.unobserve(entry.target);
                        }
                    });
                }, observerOptions);

                sectionsToReveal.forEach(section => {
                    observer.observe(section);
                });
            } else {
                console.warn("No elements with class 'fade-in' found for scroll reveal.");
            }

            // --- Parallax Effect ---
            if (parallaxBg) {
                window.addEventListener('scroll', () => {
                    const scrollPosition = window.pageYOffset;
                    // Ensure parallaxBg is not null before trying to access its style
                    if (parallaxBg) {
                        parallaxBg.style.transform = `scale(1.15) translateY(${scrollPosition * 0.3}px)`;
                    }
                });
            }
        })
        .catch(error => {
            console.error('An error occurred during data loading or processing:', error);
            const globalErrorDiv = document.createElement('div');
            globalErrorDiv.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; padding: 15px;
                background-color: rgba(255, 0, 0, 0.8); color: white; text-align: center;
                font-family: sans-serif; z-index: 9999;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
            `;
            globalErrorDiv.innerHTML = `
                <strong>Critical Error:</strong> Could not load essential data. Please check your console (F12) for details.
                <br>Reason: ${error.message || 'Unknown error.'}
            `;
            document.body.prepend(globalErrorDiv);

            // Fallback for background image even if filaments.json fails
            if (parallaxBg) {
                parallaxBg.style.backgroundImage = 'url("https://source.unsplash.com/random/1920x1080/?futuristic-tech,dark-abstract")';
                parallaxBg.style.filter = 'blur(15px) brightness(0.8)';
            }
        });
});
