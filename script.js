document.addEventListener('DOMContentLoaded', () => {
    // --- Scroll Down Arrow functionality ---
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    if (scrollDownArrow) {
        scrollDownArrow.addEventListener('click', () => {
            // Find the next section or scroll a fixed amount
            const firstSection = document.querySelector('main section');
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
            e.preventDefault(); // Prevent default hash jump
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' // Scroll to the top of the element
                });
            }
        });
    });

    // --- Filament Data Loading & Display ---
    fetch('filaments.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - Failed to load filaments.json. Please ensure the file exists in the same directory and you are running a local server for development.`);
            }
            return response.json();
        })
        .then(data => {
            // Set background image from JSON
            const parallaxBg = document.getElementById('parallax-bg');
            if (parallaxBg && data.background_image) {
                parallaxBg.style.backgroundImage = `url('${data.background_image}')`;
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
                }

                // Create Pricing List Item
                if (pricingListContainer) {
                    const pricingItem = document.createElement('div');
                    pricingItem.classList.add('pricing-item');
                    pricingItem.innerHTML = `
                        <span>${filament.name}</span>
                        <span class="price">$${filament.base_price_per_gram.toFixed(2)}/gram</span>
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
            const parallaxBg = document.getElementById('parallax-bg');
            if (parallaxBg) {
                window.addEventListener('scroll', () => {
                    const scrollPosition = window.pageYOffset;
                    // Adjust the multiplier for more or less parallax effect
                    parallaxBg.style.transform = `scale(1.05) translateY(${scrollPosition * 0.3}px)`; // 0.3 is the parallax speed
                });
            }

        })
        .catch(error => {
            console.error('Error loading filament data:', error);
            const filamentSectionsContainer = document.getElementById('filament-sections-container');
            const pricingListContainer = document.getElementById('pricing-list-container');
            if (filamentSectionsContainer) filamentSectionsContainer.innerHTML = '<p style="color: red;">Failed to load filament details. Please ensure the server is running and the filaments.json file is correctly placed.</p>';
            if (pricingListContainer) pricingListContainer.innerHTML = '<p style="color: red;">Failed to load pricing details.</p>';
        });
});
