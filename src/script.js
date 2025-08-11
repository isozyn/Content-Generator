const GEMINI_API_KEY = 'AIzaSyAQ3pBHRELTWYTlNe9wspLm7ZNhhyohdS4';
const STABILITY_API_KEY = 'sk-HYjAASQRltDmaWaOSKUK5SoPMtwBDUbGJ2EmuxcYJKSKHpKw';

function switchSection(section) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    setTimeout(() => {
        document.getElementById(`${section}-section`).classList.add('active');
    }, 150);
}

function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

async function generatePrompt(type) {
    const prompts = {
        text: [
            "Write a creative short story about time travel",
            "Create a professional email template for customer service",
            "Generate a product description for a smart home device",
            "Write a motivational speech for students",
            "Create a recipe blog post for healthy breakfast ideas"
        ],
        code: [
            "Create a responsive navigation bar with HTML, CSS, and JavaScript",
            "Build a simple todo list application using vanilla JavaScript",
            "Generate a Python function to sort a list of dictionaries",
            "Create a CSS animation for a loading spinner",
            "Build a React component for a user profile card"
        ],
        image: [
            "A futuristic cityscape at sunset with flying cars",
            "A magical forest with glowing mushrooms and fairy lights",
            "A cozy coffee shop interior with warm lighting",
            "A space explorer on an alien planet with two moons",
            "A vintage library with floating books and mystical atmosphere"
        ]
    };

    const randomPrompt = prompts[type][Math.floor(Math.random() * prompts[type].length)];
    document.getElementById(`${type}-prompt`).value = randomPrompt;
}

async function generateText() {
    const prompt = document.getElementById('text-prompt').value.trim();
    if (!prompt) {
        alert('Please enter a prompt for text generation');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const generatedText = data.candidates[0].content.parts[0].text;
            displayTextResult(generatedText);
        } else {
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        alert(`Error generating text: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function generateCode() {
    const prompt = document.getElementById('code-prompt').value.trim();
    if (!prompt) {
        alert('Please enter a prompt for code generation');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Generate code for: ${prompt}. Please provide clean, well-commented code with proper formatting.` }] }],
                generationConfig: {
                    temperature: 0.3,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const generatedCode = data.candidates[0].content.parts[0].text;
            displayCodeResult(generatedCode);
        } else {
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        alert(`Error generating code: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function generateImage() {
    const prompt = document.getElementById('image-prompt').value.trim();
    if (!prompt) {
        alert('Please enter a prompt for image generation');
        return;
    }

    showLoading();
    try {
        const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STABILITY_API_KEY}`,
                'Accept': 'image/*'
            },
            body: (() => {
                const formData = new FormData();
                formData.append('prompt', prompt);
                formData.append('output_format', 'png');
                formData.append('aspect_ratio', '1:1');
                return formData;
            })()
        });

        if (!response.ok) {
            let errorMessage;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
            } else {
                const errorText = await response.text();
                errorMessage = `HTTP ${response.status}: ${errorText}`;
            }
            throw new Error(`Image generation failed: ${errorMessage}`);
        }

        const imageBlob = await response.blob();
        if (imageBlob.size === 0) {
            throw new Error('Received empty image data');
        }

        const imageUrl = URL.createObjectURL(imageBlob);
        displayImageResult(imageUrl, prompt);
    } catch (error) {
        alert(`Error generating image: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function displayTextResult(text) {
    const resultsDiv = document.getElementById('text-results');
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    resultCard.innerHTML = `
        <h3>Generated Text</h3>
        <p>${text.replace(/\n/g, '<br>')}</p>
        <button class="btn download-btn" onclick="downloadText('${text.replace(/'/g, "\\'")}')">💾 Download Text</button>
    `;
    resultsDiv.appendChild(resultCard);
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

function displayCodeResult(code) {
    const resultsDiv = document.getElementById('code-results');
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    const isHTML = code.toLowerCase().includes('<html') || code.toLowerCase().includes('<!doctype');
    resultCard.innerHTML = `
        <h3>Generated Code</h3>
        <div class="code-result">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <div class="button-group" style="margin-top: 15px;">
            <button class="btn download-btn" onclick="downloadCode(\`${code.replace(/`/g, '\\`')}\`)">💾 Download Code</button>
            ${isHTML ? `<button class="btn popup-preview" onclick="previewHTML(\`${code.replace(/`/g, '\\`')}\`)">👁️ Preview HTML</button>` : ''}
        </div>
    `;
    resultsDiv.appendChild(resultCard);
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

function displayImageResult(imageUrl, prompt) {
    const resultsDiv = document.getElementById('image-results');
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    resultCard.innerHTML = `
        <h3>Generated Image</h3>
        <div class="image-result">
            <img src="${imageUrl}" alt="Generated Image">
            <div class="button-group" style="margin-top: 15px;">
                <button class="btn download-btn" onclick="downloadImage('${imageUrl}')">💾 Download Image</button>
                <button class="btn regenerate-btn" onclick="regenerateImage('${prompt}')">🔄 Regenerate</button>
            </div>
        </div>
    `;
    resultsDiv.appendChild(resultCard);
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

function downloadText(text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-text.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function downloadCode(code) {
    const extension = code.toLowerCase().includes('<html') ? '.html' :
                    code.toLowerCase().includes('def ') || code.toLowerCase().includes('import ') ? '.py' :
                    code.toLowerCase().includes('function') || code.toLowerCase().includes('const ') ? '.js' : '.txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-code${extension}`;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadImage(imageUrl) {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'generated-image.png';
    a.click();
}

function previewHTML(code) {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(code);
    newWindow.document.close();
}

function regenerateImage(prompt) {
    document.getElementById('image-prompt').value = prompt;
    generateImage();
}
