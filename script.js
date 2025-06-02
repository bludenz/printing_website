document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement; // Get the :root element
    const backgroundContainer = document.querySelector('.background-container');
    const parallaxBg = document.getElementById('parallax-bg');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section-content');
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    const filamentSectionsContainer = document.getElementById('filament-sections-container');
    const popupOverlay = document.getElementById('popup-overlay');
    const colorPickerPopout = document.getElementById('color-picker-popout');
    const colorPickerToggle = document.getElementById('color-picker-toggle');

    // Color picker inputs
    const mainTitleColorInput = document.getElementById('main-title-color');
    const accentColorInput = document.getElementById('accent-color');
    const propertyBoxColorInput = document.getElementById('property-box-color');

    let filamentData = []; // To store fetched filament data

    // --- Helper Functions ---

    // Converts hex color to RGB array
    function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    // Sets CSS variables based on color inputs
    function setCssVariables(
        mainTitleHex, accentHex, propertyBoxHex
    ) {
        const mainTitleRgb = hexToRgb(mainTitleHex);
        const accentRgb = hexToRgb(accentHex);
        const propertyBoxRgb = hexToRgb(propertyBoxHex);

        if (mainTitleRgb) {
            root.style.setProperty('--main-title-glow-color', mainTitleHex);
            root.style.setProperty('--main-title-glow-color-rgb', mainTitleRgb.join(', '));
        }
        if (accentRgb) {
            root.style.setProperty('--accent-color', accentHex);
            root.style.setProperty('--accent-color-rgb', accentRgb.join(', '));
        }
        if (propertyBoxRgb) {
            root.style.setProperty('--property-box-bg-color', propertyBoxHex);
            root.style.setProperty('--property-box-bg-color-rgb', propertyBoxRgb.join(', '));
        }

        console.log('CSS Variables Updated:');
        console.log('--main-title-glow-color:', root.style.getPropertyValue('--main-title-glow-color'));
        console.log('--accent-color:', root.style.getPropertyValue('--accent-color'));
        console.log('--property-box-bg-color:', root.style.getPropertyValue('--property-box-bg-color'));
    }

    // Loads filament data into the DOM
    function loadFilamentData(data) {
        if (!data || data.length === 0) {
            filamentSectionsContainer.innerHTML = '<p style="text-align: center; font-style: italic; color: #a0a0a0;">No filament data available.</p>';
            return;
        }

        filamentSectionsContainer.innerHTML = ''; // Clear loading message

        data.forEach(filament => {
            const filamentItem = document.createElement('div');
            filamentItem.className = 'filament-item';

            const title = document.createElement('h3');
            title.textContent = filament.name;
            filamentItem.appendChild(title);

            const description = document.createElement('p');
            description.textContent = filament.description;
            filamentItem.appendChild(description);

            const propertiesDiv = document.createElement('div');
            propertiesDiv.className = 'filament-properties';

            // Price
            const priceItem = document.createElement('div');
            priceItem.className = 'filament-property-item filament-price';
            priceItem.innerHTML = `<i class="fas fa-dollar-sign"></i> <span>Price per kg: ${filament.properties.price_per_kg}</span>`;
            propertiesDiv.appendChild(priceItem);

            // Hardness
            const hardnessItem = document.createElement('div');
            hardnessItem.className = 'filament-property-item filament-hardness';
            hardnessItem.innerHTML = `<i class="fas fa-grip-lines"></i> <span>Hardness: ${filament.properties.hardness}</span>`;
            propertiesDiv.appendChild(hardnessItem);

            // Colors
            const colorsItem = document.createElement('div');
            colorsItem.className = 'filament-property-item filament-colors';
            const colorsTitle = document.createElement('span');
            colorsTitle.innerHTML = `<i class="fas fa-palette"></i> <span>Available Colors:</span>`;
            colorsItem.appendChild(colorsTitle);

            const colorsListWrapper = document.createElement('div');
            colorsListWrapper.className = 'colors-list'; // Wrapper for the colors list
            const colorBoxesWrapper = document.createElement('div');
            colorBoxesWrapper.className = 'color-boxes-wrapper'; // Wrapper for the individual color boxes

            filament.properties.colors.forEach(color => {
                const colorBox = document.createElement('span');
                colorBox.className = 'color-box';
                colorBox.style.backgroundColor = color;
                colorBoxesWrapper.appendChild(colorBox);
            });
            colorsListWrapper.appendChild(colorBoxesWrapper);
            colorsItem.appendChild(colorsListWrapper);
            propertiesDiv.appendChild(colorsItem);

            filamentItem.appendChild(propertiesDiv);
            filamentSectionsContainer.appendChild(filamentItem);
        });
    }

    // Handles scroll events for parallax and active navigation links
    function handleScroll() {
        // Parallax Effect
        const scrollPosition = window.pageYOffset;
        if (parallaxBg) {
            // Adjust the 0.2 factor for more or less parallax
            parallaxBg.style.transform = `scale(1.15) translateY(${scrollPosition * 0.2}px)`;
        }

        // Active Navigation Link
        let currentActiveSection = null;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Offset for better active state
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentActiveSection = section.id;
            }
        });

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentActiveSection)) {
                link.classList.add('active');
            }
        });

        // Toggle 'testing-mode' class on body when color picker is visible
        if (colorPickerPopout.classList.contains('visible')) {
            document.body.classList.add('testing-mode');
        } else {
            document.body.classList.remove('testing-mode');
        }
    }

    // Handles click on scroll down arrow
    function handleScrollDownArrowClick() {
        const nextSection = document.getElementById('about-section');
        if (nextSection) {
            window.scrollTo({
                top: nextSection.offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Shows the color picker popout
    function showColorPicker() {
        popupOverlay.classList.add('visible');
        colorPickerPopout.classList.add('visible');
        document.body.classList.add('testing-mode'); // Ensure testing-mode is active
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    // Hides the color picker popout
    function hideColorPicker() {
        popupOverlay.classList.remove('visible');
        colorPickerPopout.classList.remove('visible');
        document.body.classList.remove('testing-mode'); // Deactivate testing-mode
        document.body.style.overflow = ''; // Restore body scroll
    }

    // --- Event Listeners ---

    // Fetch filament data
    fetch('filaments.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            filamentData = data;
            loadFilamentData(filamentData); // Load data after fetching
        })
        .catch(error => {
            console.error('Error fetching filament data:', error);
            filamentSectionsContainer.innerHTML = '<p style="text-align: center; font-style: italic; color: red;">Failed to load filament data. Please check console for errors.</p>';
        });

    // Set initial colors from CSS variables on load
    const initialMainTitleColor = getComputedStyle(root).getPropertyValue('--main-title-glow-color');
    const initialAccentColor = getComputedStyle(root).getPropertyValue('--accent-color');
    const initialPropertyBoxColor = getComputedStyle(root).getPropertyValue('--property-box-bg-color');

    mainTitleColorInput.value = initialMainTitleColor;
    accentColorInput.value = initialAccentColor;
    propertyBoxColorInput.value = initialPropertyBoxColor;

    // Listen for changes on color inputs
    mainTitleColorInput.addEventListener('input', (e) => {
        setCssVariables(e.target.value, accentColorInput.value, propertyBoxColorInput.value);
    });
    accentColorInput.addEventListener('input', (e) => {
        setCssVariables(mainTitleColorInput.value, e.target.value, propertyBoxColorInput.value);
    });
    propertyBoxColorInput.addEventListener('input', (e) => {
        setCssVariables(mainTitleColorInput.value, accentColorInput.value, e.target.value);
    });

    // Sidebar navigation clicks
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default if it's the color picker toggle
            if (this.id === 'color-picker-toggle') {
                e.preventDefault(); // Prevent default for the color picker toggle
                showColorPicker();
            } else {
                // For regular navigation links, allow default behavior (scroll to section)
                // and just update active class
                sidebarLinks.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Overlay click to close popout
    popupOverlay.addEventListener('click', hideColorPicker);

    // Initial scroll handler call to set active link and parallax
    handleScroll();

    // Scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Scroll down arrow click listener
    if (scrollDownArrow) {
        scrollDownArrow.addEventListener('click', handleScrollDownArrowClick);
    }
});
