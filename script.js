document.addEventListener('DOMContentLoaded', () => {
    // Select all necessary elements at the start of DOMContentLoaded.
    // Use 'let' for elements that might be conditionally assigned or used.
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const parallaxBg = document.getElementById('parallax-bg'); // Ensure this ID exists in HTML
    const filamentSectionsContainer = document.getElementById('filament-sections-container'); // Ensure this ID exists in HTML
    const pricingListContainer = document.getElementById('pricing-list-container'); // Ensure this ID exists in HTML
    const sectionsToReveal = document.querySelectorAll('.fade-in');

    // --- Scroll Down Arrow functionality ---
    if (scrollDownArrow) {
        scrollDownArrow.addEventListener('click', () => {
            // Smoothly scroll to the top of the 'About Us' section
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // Fallback: scroll down a certain amount if 'about' section not found
                window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
            }
        });
    } else {
        console.warn("Scroll down arrow element not found.");
    }

    // --- Sidebar Navigation Smooth Scrolling ---
    if (sidebarLinks.length > 0) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href'); // e.g., "#about"
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

    // --- Filament Data Loading & Display ---
    fetch('filaments.json')
        .then(response => {
            if (!response.ok) {
                // If the HTTP response is not OK, throw an error with more context
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

            const filaments = data.filaments; // Access the filaments array from the data object

            // Clear loading messages and populate filament sections
            if (filamentSectionsContainer) {
                filamentSectionsContainer.innerHTML = ''; // Clear "Loading filament details..."
                filaments.forEach(filament => {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.classList.add('filament-section');
                    sectionDiv.id = filament.id; // Assign ID for potential navigation

                    const colorsHtml = filament.colors.map(colorHex => {
                        return `<span class="color-box" style="background-color: ${colorHex};" title="${colorHex}"></span>`;
                    }).join('');

                    sectionDiv.innerHTML = `
                        <h3>${filament.name}</h3>
                        <p>${filament.description}</p>
                        <div class="filament-properties">
                            <span><i class="fas fa-money-bill-wave"></i> Price: $${filament.base_price_per_gram.toFixed(2)}/gram</span>
                            <span><i class="fas fa-ruler-combined"></i> Hardness (Shore D): ${filament.hardness_shore_d}</span>
                            <span><i class="fas fa-palette"></i> Colors: ${colorsHtml}</span>
                        </div>
                    `;
                    filamentSectionsContainer.appendChild(sectionDiv);
                });
            } else {
                console.error("Error: Element with ID 'filament-sections-container' not found. Cannot display filament details.");
                // Provide user feedback directly if container is missing
                const errorHtml = `<p style="color: #ff6b6b; text-align: center; padding: 20px;">
                                    <strong>Error:</strong> Filament details container missing in HTML.
                                  </p>`;
                document.querySelector('#filament-types')?.insertAdjacentHTML('beforeend', errorHtml);
            }

            // Populate pricing list
            if (pricingListContainer) {
                pricingListContainer.innerHTML = ''; // Clear "Loading pricing details..."
                filaments.forEach(filament => {
                    const pricingItem = document.createElement('div');
                    pricingItem.classList.add('pricing-item');
                    pricingItem.innerHTML = `
                        <span>${filament.name}</span>
                        <span class="price">$${filament.base_price_per_gram.toFixed(2)}/gram</span>
                    `;
                    pricingListContainer.appendChild(pricingItem);
                });
            } else {
                console.error("Error: Element with ID 'pricing-list-container' not found. Cannot display pricing details.");
                // Provide user feedback directly if container is missing
                const errorHtml = `<p style="color: #ff6b6b; text-align: center; padding: 20px;">
                                    <strong>Error:</strong> Pricing details container missing in HTML.
                                  </p>`;
                document.querySelector('#pricing')?.insertAdjacentHTML('beforeend', errorHtml);
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
                    parallaxBg.style.transform = `scale(1.15) translateY(${scrollPosition * 0.3}px)`; // Adjusted scale and speed
                });
            }
        })
        .catch(error => {
            console.error('An error occurred during data loading or processing:', error);
            // Universal error message for the user, placed in a prominent area
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

            // Fallback for background image if data fetch fails
            if (parallaxBg) {
                parallaxBg.style.backgroundImage = 'url("https://source.unsplash.com/random/1920x1080/?futuristic-tech,dark-abstract")'; // Generic fallback image
                parallaxBg.style.filter = 'blur(10px) brightness(0.7)'; // Apply blur and darken
            }
        });
});
