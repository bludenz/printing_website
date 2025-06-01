document.addEventListener('DOMContentLoaded', () => {
    // --- Scroll Down Arrow functionality ---
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    if (scrollDownArrow) {
        scrollDownArrow.addEventListener('click', () => {
            window.scrollBy({
                top: window.innerHeight, // Scrolls down by the height of the viewport
                behavior: 'smooth'
            });
        });
    }

    // --- Filament Data Loading & Display ---
    fetch('filaments.json')
        .then(response => {
            if (!response.ok) {
                // If it's a 404, log the error and provide user feedback
                throw new Error(`HTTP error! status: ${response.status} - Failed to load filaments.json. Please ensure the file exists in the same directory and you are running a local server for development.`);
            }
            return response.json();
        })
        .then(filaments => {
            const filamentSectionsContainer = document.getElementById('filament-sections-container');
            const pricingListContainer = document.getElementById('pricing-list-container');
            
            // Clear "Loading..." messages
            if (filamentSectionsContainer) filamentSectionsContainer.innerHTML = '';
            if (pricingListContainer) pricingListContainer.innerHTML = '';

            filaments.forEach(filament => {
                // Create Filament Type Section
                if (filamentSectionsContainer) {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.classList.add('filament-section');
                    sectionDiv.id = filament.id; // Assign ID for potential navigation later

                    const colorsHtml = filament.colors.map(colorHex => {
                        // Using hex codes directly for background-color
                        return `<span class="color-box" style="background-color: ${colorHex};"></span>`;
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
                root: null, // relative to the viewport
                rootMargin: '0px',
                threshold: 0.1 // Trigger when 10% of the element is visible
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('show');
                        observer.unobserve(entry.target); // Stop observing once shown
                    }
                });
            }, observerOptions);

            sections.forEach(section => {
                observer.observe(section);
            });

        })
        .catch(error => {
            console.error('Error loading filament data:', error);
            const filamentSectionsContainer = document.getElementById('filament-sections-container');
            const pricingListContainer = document.getElementById('pricing-list-container');
            if (filamentSectionsContainer) filamentSectionsContainer.innerHTML = '<p style="color: red;">Failed to load filament details. Please ensure the server is running and the filaments.json file is correctly placed.</p>';
            if (pricingListContainer) pricingListContainer.innerHTML = '<p style="color: red;">Failed to load pricing details.</p>';
        });
});
