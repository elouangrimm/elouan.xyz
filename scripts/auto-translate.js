/*
 * Auto Translation script
 * This script translates any element with the class "translate" from English to French.
 * If an element has a custom French translation provided via a data-fr attribute, that translation will be used instead.
 * 
 * Usage:
 * 1. Wrap translatable text in an element with class="translate".
 * 2. To provide a manual translation, add data-fr="Your custom French text" to the element.
 * 3. Otherwise, the script uses LibreTranslate (a free API) to translate the inner HTML automatically.
 *    Note: The API endpoint is set to https://libretranslate.com/translate and sends the content format as "html" so that basic HTML (like links) is preserved.
 */

document.addEventListener('DOMContentLoaded', function() {
    const translateElements = document.querySelectorAll('.translate');
    translateElements.forEach(element => {
        const manualTranslation = element.getAttribute('data-fr');
        if (manualTranslation) {
            // Use manual translation if provided
            element.innerHTML = manualTranslation;
        } else {
            const originalHTML = element.innerHTML;
            // Call LibreTranslate API to auto translate the content
            fetch('https://libretranslate.com/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: originalHTML,
                    source: 'en',
                    target: 'fr',
                    format: 'html'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.translatedText) {
                    element.innerHTML = data.translatedText;
                }
            })
            .catch(error => {
                console.error('Translation error:', error);
            });
        }
    });
});
