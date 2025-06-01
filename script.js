document.addEventListener('DOMContentLoaded', () => {
    // Select all necessary elements at the start of DOMContentLoaded.
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const parallaxBg = document.getElementById('parallax-bg');
    const filamentSectionsContainer = document.getElementById('filament-sections-container');
    const pricingListContainer = document.getElementById('pricing-list-container');
    const sectionsToReveal = document.querySelectorAll('.fade-in');
    const mainSections = document.querySelectorAll('section[id], header[id]'); // Select all sections and header with an ID

    // --- Scroll Down Arrow functionality ---
    if (scrollDownArrow) {
        scrollDownArrow.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
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

    // --- Active Navbar State on Scroll ---
    const navObserverOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.5 // 50% of the section must be visible
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            const correspondingLink = document.querySelector(`.sidebar-nav a[href="#${id}"]`);

            if (correspondingLink) {
                if (entry.isIntersecting) {
                    // Remove active from all links first to ensure only one is active
                    sidebarLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
                // Optional: To make it active only when scrolling *into* the section
                // if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                //     sidebarLinks.forEach(link => link.classList.remove('active'));
                //     correspondingLink.classList.add('active');
                // } else {
                //     correspondingLink.classList.remove('active');
                // }
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

            const filaments = data.filaments;

            // Clear loading messages and populate filament sections
            if (filamentSectionsContainer) {
                filamentSectionsContainer.innerHTML = ''; // Clear "Loading filament details..."
                filamentSectionsContainer.classList.add('filament-grid-container');

                filaments.forEach(filament => {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.classList.add('filament-item');
                    sectionDiv.id = filament.id;

                    const colors = Array.isArray(filament.colors) ? filament.colors : [];
                    const colorsHtml = colors.map(colorHex => {
                        return `<span class="color-box" style="background-color: ${colorHex};" title="${colorHex}"></span>`;
                    }).join('');

                    sectionDiv.innerHTML = `
                        <h3>${filament.name}</h3>
                        <p>${filament.description}</p>
                        <div class="filament-properties">
                            <span><i class="fas fa-money-bill-wave"></i> Price: $${filament.base_price_per_gram.toFixed(2)}/gram</span>
                            <span><i class="fas fa-ruler-combined"></i> Hardness (Shore D): ${filament.hardness_shore_d}</span>
                            <span class="colors-list">
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
                document.querySelector('#filament-types')?.insertAdjacentHTML('beforeend', errorHtml);
            }

            // Populate pricing list
            if (pricingListContainer) {
                pricingListContainer.innerHTML = '';
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
