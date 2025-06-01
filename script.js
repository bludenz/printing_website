document.addEventListener('DOMContentLoaded', () => {
    // Select all necessary elements at the start of DOMContentLoaded.
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const parallaxBg = document.getElementById('parallax-bg'); // Ensure this is only declared ONCE.
    const filamentSectionsContainer = document.getElementById('filament-sections-container');
    const sectionsToReveal = document.querySelectorAll('.fade-in');

    // Updated mainSections to only include existing sections with their new IDs
    const mainSections = document.querySelectorAll('#home-section, #about-section, #filament-types-section, #faq-section');

    // --- Scroll Down Arrow functionality ---
    if (scrollDownArrow) {
        scrollDownArrow.addEventListener('click', () => {
            const aboutSection = document.getElementById('about-section'); // Use new ID
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
                        return `<span class="color-box" style="background-color: <span class="math-inline">\{colorHex\};" title\="</span>{colorHex}"></span>`;
                    }).join('');

                    sectionDiv.innerHTML = `
                        <h3><span class="math-inline">\{filament\.name\}</h3\>
<p\></span>{filament.description}</p>
                        <div class="filament-properties">
                            <span class="filament-property-item"><i class="fas fa-money-bill-wave"></i> Price: $${filament.base_price_per_gram.toFixed(2)}/gram</span>
                            <span class="filament-property-item"><i class="fas fa-ruler-combined"></i> Hardness (Shore D): ${filament.hardness_shore_d}</span>
                            <span class="filament-property-item colors-list">
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
