document.addEventListener('DOMContentLoaded', () => {
    fetch('filaments.json') // Or 'filaments.txt' if you decide to use that format
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Use .text() if your file is .txt and you'll parse it manually
        })
        .then(filaments => {
            const filamentListDiv = document.getElementById('filament-list');
            filamentListDiv.innerHTML = ''; // Clear "Loading..." message

            filaments.forEach(filament => {
                const filamentItem = document.createElement('div');
                filamentItem.classList.add('filament-item');

                const colorsHtml = filament.colors.map(color => {
                    // For more accurate color display, you'd map names to hex codes.
                    // For simplicity, we'll use the name directly for now, assuming valid CSS colors.
                    // Or, you could include hex codes in your JSON: {"color": "Red", "hex": "#FF0000"}
                    return `<span class="color-box" style="background-color: ${color.toLowerCase()};"></span><span class="color-name">${color}</span>`;
                }).join('');

                filamentItem.innerHTML = `
                    <strong>${filament.name}</strong>
                    <div class="details">
                        <span>Base Price: $${filament.base_price_per_gram.toFixed(2)}/gram</span>
                        <span>Colors: ${colorsHtml}</span>
                    </div>
                `;
                filamentListDiv.appendChild(filamentItem);
            });
        })
        .catch(error => {
            console.error('Error loading filament data:', error);
            document.getElementById('filament-list').innerHTML = '<p>Failed to load filament data. Please try again later.</p>';
        });
});
