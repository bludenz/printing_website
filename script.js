document.addEventListener('DOMContentLoaded', () => {
    // Declare parallaxBg once at the top of this scope
    let parallaxBg = document.getElementById('parallax-bg'); // Use 'let' for reassignability later if needed

    // --- Scroll Down Arrow functionality ---
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    if (scrollDownArrow) {
        scrollDownArrow.addEventListener('click', () => {
            const firstSection = document.querySelector('main .section-content');
            if (firstSection) {
                firstSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
            }
        });
    }

    // --- Sidebar Navigation Smooth Scrolling ---
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
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
            }
        });
    });

    // --- Filament Data Loading & Display ---
    fetch('filaments.json')
        .then(response => {
            if (!response.ok) {
                // Check for HTTP errors and provide better feedback
                const errorMessage = `HTTP error! Status: ${response.status} - Failed to load filaments.json. Please ensure the file exists in the same directory and you are running a local server for development.`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
            return response.json();
        })
        .then(data => {
            // Set background image from JSON
            // We already declared parallaxBg at the top, just assign to it
            if (parallaxBg && data.background_image) {
                parallaxBg.style.backgroundImage = `url('${data.background_image}')`;
            } else if (!parallaxBg) {
                console.warn("Parallax background element not found.");
            } else {
                console.warn("Background image URL not found in filaments.json.");
            }


            const filaments = data.filaments; // Access the filaments array from the data object

            const filamentSectionsContainer = document.getElementById('filament-sections-container');
            const pricingListContainer = document.getElementById('pricing-list-container');
            
            if (filamentSectionsContainer) {
                filamentSectionsContainer.innerHTML = '';
            }
            if (pricingListContainer) {
                pricingListContainer.innerHTML = '';
            }

            filaments.forEach(filament => {
                // Create Filament Type Section
                if (filamentSectionsContainer) {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.classList.add('filament-section');
                    sectionDiv.id = filament.id;

                    const colorsHtml = filament.colors.map(colorHex => {
                        return `<span class="color-box" style="background-color: <span class="math-inline">\{colorHex\};" title\="</span>{colorHex}"></span>`;
                    }).join('');

                    sectionDiv.innerHTML = `
                        <h3><span class="math-inline">\{filament\.name\}</h3\>
<p\></span>{filament.description}</p>
                        <div class="filament-properties">
                            <span><i class="fas fa-money-bill-wave"></i> Price: $${filament.base_price_per_gram.toFixed(2)}/gram</span>
                            <span><i class="fas fa-ruler-combined"></i> Hardness (Shore D): ${filament.hardness_shore_d}</span>
                            <span><i class="fas fa-palette"></i> Colors: ${colorsHtml}</span>
                        </div>
                    `;
                    filamentSectionsContainer.appendChild(sectionDiv);
                }

                // Create Pricing List Item
                if (pricingListContainer) {
                    const pricingItem = document.createElement('div');
                    pricingItem.classList.add('pricing-item');
                    pricingItem.innerHTML = `
                        <span><span class="math-inline">\{filament\.name\}</span\>
<span class\="price"\></span>${filament.base_price_per_gram.toFixed(2)}/gram</span>
                    `;
                    pricingListContainer.appendChild(pricingItem);
                }
            });

            // --- Scroll Reveal Effect (after content is loaded) ---
            const sections = document.querySelectorAll('.fade-in');

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

            sections.forEach(section => {
                observer.observe(section);
            });

            // --- Parallax Effect ---
            // Ensure parallaxBg is accessible here
            if (parallaxBg) {
                window.addEventListener('scroll', () => {
                    const scrollPosition = window.pageYOffset;
                    parallaxBg.style.transform = `scale(1.05) translateY(${scrollPosition * 0.3}px)`;
                });
            }

        })
        .catch(error => {
            console.error('An error occurred during data loading or processing:', error);
            const filamentSectionsContainer = document.getElementById('filament-sections-container');
            const pricingListContainer = document.getElementById('pricing-list-container');
            // Provide user feedback even if specific containers are null
            const errorMessage = `<p style="color: #ff6b6b; text-align: center; padding: 20px;">
                                    <strong>Error:</strong> Failed to load or display content. <br>
                                    ${error.message || 'Please check your console for more details and ensure files are correctly configured.'}
                                  </p>`;
            if (filamentSectionsContainer) {
                filamentSectionsContainer.innerHTML = errorMessage;
            } else {
                document.querySelector('main')?.insertAdjacentHTML('afterbegin', errorMessage);
            }
            if (pricingListContainer) {
                pricingListContainer.innerHTML = ''; // Clear if it was showing "Loading..."
            }
            // If parallaxBg was not found earlier, try to find it here and apply fallback background
            if (!parallaxBg) {
                parallaxBg = document.getElementById('parallax-bg');
            }
            if (parallaxBg) {
                parallaxBg.style.backgroundImage = 'url("
