document.addEventListener('DOMContentLoaded', () => {
    // Select all necessary elements at the start of DOMContentLoaded.
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const parallaxBg = document.getElementById('parallax-bg');
    const filamentSectionsContainer = document.getElementById('filament-sections-container');
    const sectionsToReveal = document.querySelectorAll('.fade-in');

    // Updated mainSections to only include existing sections with their new IDs
    const mainSections = document.querySelectorAll('#home-section, #about-section, #filament-types-section, #faq-section');

    // --- Scroll Down Arrow functionality ---
    if (scrollDownArrow) {
        // Add a click event listener to the scroll down arrow button
        scrollDownArrow.addEventListener('click', () => {
            // Get the 'about-section' element by its ID
            const aboutSection = document.getElementById('about-section');
            let targetPosition; // Variable to store the final scroll target Y-coordinate

            // Determine the target scroll position
            if (aboutSection) {
                // If the 'about-section' exists, scroll to its absolute top position
                // getBoundingClientRect().top gives position relative to viewport
                // window.scrollY gives current scroll position from top of document
                // Adding them gives the absolute position of the element from the document's top
                targetPosition = aboutSection.getBoundingClientRect().top + window.scrollY;
            } else {
                // If 'about-section' is not found, scroll down by 80% of the current window's height
                // This provides a fallback if the specific section isn't present
                targetPosition = window.scrollY + window.innerHeight * 0.8;
            }

            // Call the custom slow scroll function with the determined target and a duration
            // Adjust the '2000' value (in milliseconds) to control the scroll speed:
            // - 1000ms = 1 second
            // - 3000ms = 3 seconds (slower)
            // - 500ms = 0.5 seconds (faster)
            slowScrollTo(targetPosition, 2000); // Current duration: 2 seconds
        });
    } else {
        // Log a warning to the console if the scroll down arrow element is not found
        console.warn("Scroll down arrow element (ID: 'scroll-down-arrow') not found. Please check your HTML ID and JavaScript selector.");
    }

    /**
     * Smoothly scrolls the window to a specified Y-coordinate over a given duration.
     *
     * @param {number} targetY - The absolute Y-coordinate (in pixels) to scroll to.
     * @param {number} duration - The total duration of the scroll animation in milliseconds.
     */
    function slowScrollTo(targetY, duration) {
        // Get the current scroll position when the animation starts
        const startY = window.scrollY;
        // Calculate the total distance to scroll
        const distance = targetY - startY;
        let startTime = null; // To store the timestamp when the animation begins

        /**
         * The core animation function, called repeatedly by requestAnimationFrame.
         * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
         */
        function animateScroll(currentTime) {
            // Initialize startTime on the first call
            if (startTime === null) startTime = currentTime;

            // Calculate the time elapsed since the animation started
            const timeElapsed = currentTime - startTime;

            // Calculate the progress of the animation (0 to 1)
            // Math.min ensures progress doesn't exceed 1 (100%) even if timeElapsed > duration
            const progress = Math.min(timeElapsed / duration, 1);

            // Calculate the new scroll position using an easing function
            // This makes the scroll start and end smoothly, rather than linearly
            window.scrollTo(0, startY + distance * easeInOutQuad(progress));

            // Continue the animation if the duration has not yet been met
            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
            // If timeElapsed >= duration, the animation stops naturally.
            // No need for an 'else' block, as the last scrollTo would have set the final position.
        }

        /**
         * An easing function for quadratic in-out animation.
         * This creates a smoother acceleration and deceleration curve.
         *
         * @param {number} t - The linear progress (0 to 1).
         * @returns {number} The eased progress (0 to 1).
         */
        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        // Start the animation loop
        requestAnimationFrame(animateScroll);
    }

    // --- Sidebar Navigation Smooth Scrolling ---
    if (sidebarLinks.length > 0) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
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
    const navObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Adjust this threshold if sections aren't highlighting correctly. 0.5 means 50% of the section must be visible.
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
            // Set background image from JSON
            if (parallaxBg && data.background_image) {
                parallaxBg.style.backgroundImage = `url('${data.background_image}')`;
            } else if (!parallaxBg) {
                console.warn("Parallax background element (#parallax-bg) not found in HTML.");
            } else if (!data.background_image) {
                console.warn("Background image URL not found in filaments.json.");
            }

            // Set glassiness strength as a CSS custom property
            if (typeof data.glassiness_strength === 'number') {
                document.documentElement.style.setProperty('--glassiness-strength', data.glassiness_strength);
                console.log('Glassiness strength set to:', data.glassiness_strength); // Log the value
            } else {
                console.warn("glassiness_strength not found or is not a number in filaments.json. Defaulting to 1.0.");
                document.documentElement.style.setProperty('--glassiness-strength', 1.0); // Fallback
            }

            const filaments = data.filaments;

            // Clear loading messages and populate filament sections
            if (filamentSectionsContainer) {
                filamentSectionsContainer.innerHTML = ''; // Clear "Loading filament details..."
                filamentSectionsContainer.classList.add('filament-grid-container');

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
                document.querySelector('#filament-types-section')?.insertAdjacentHTML('beforeend', errorHtml);
            }

            // --- Scroll Reveal Effect (after content is loaded) ---
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

            if (sectionsToReveal.length > 0) {
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
                    parallaxBg.style.transform = `scale(1.15) translateY(${scrollPosition * 0.3}px)`;
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

            if (parallaxBg) {
                parallaxBg.style.backgroundImage = 'url("https://source.unsplash.com/random/1920x1080/?futuristic-tech,dark-abstract")';
                parallaxBg.style.filter = 'blur(10px) brightness(0.7)';
            }
        });
});
