// API Configuration
const GEMINI_API_KEY = 'AIzaSyDufEQ5FxQIDpBTFJNsO1M8LoDZ8979Zmw';
const STABILITY_API_KEY = 'sk-HYjAASQRltDmaWaOSKUK5SoPMtwBDUbGJ2EmuxcYJKSKHpKw';

// Section switching functionality
function switchSection(section) {
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    event.target.classList.add('active');

    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Show the selected section with animation
    setTimeout(() => {
        document.getElementById(`${section}-section`).classList.add('active');
    }, 150);
}

// Loading overlay functions
function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

// Generate random prompts for each category
async function generatePrompt(type) {
    const prompts = {
        text: [
            "Write a creative short story about time travel",
            "Create a professional email template for customer service",
            "Generate a product description for a smart home device",
            "Write a motivational speech for students",
            "Create a recipe blog post for healthy breakfast ideas",
            "Write a compelling product review for a fictional gadget",
            "Create a business proposal for a sustainable energy solution",
            "Write a travel guide for a mysterious island",
            "Generate a character description for a fantasy novel",
            "Create a news article about a scientific breakthrough"
        ],
        code: [
            "Create a responsive navigation bar with HTML, CSS, and JavaScript",
            "Build a simple todo list application using vanilla JavaScript",
            "Generate a Python function to sort a list of dictionaries",
            "Create a CSS animation for a loading spinner",
            "Build a React component for a user profile card",
            "Create a simple calculator using HTML, CSS, and JavaScript",
            "Generate a Python script for data analysis with pandas",
            "Build a responsive image gallery with CSS Grid",
            "Create a REST API endpoint using Node.js and Express",
            "Generate a SQL query to analyze sales data"
        ],
        image: [
            "A futuristic cityscape at sunset with flying cars",
            "A magical forest with glowing mushrooms and fairy lights",
            "A cozy coffee shop interior with warm lighting",
            "A space explorer on an alien planet with two moons",
            "A vintage library with floating books and mystical atmosphere",
            "A cyberpunk street scene with neon lights and rain",
            "A peaceful mountain landscape with aurora borealis",
            "A steampunk workshop filled with brass gadgets",
            "A underwater city with bioluminescent coral",
            "A medieval castle on a floating island in the clouds"
        ]
    };

    const randomPrompt = prompts[type][Math.floor(Math.random() * prompts[type].length)];
    document.getElementById(`${type}-prompt`).value = randomPrompt;
}

// Text generation function
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
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: prompt }] 
                }],
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
        console.error('Text generation error:', error);
        alert(`Error generating text: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Code generation function
async function generateCode() {
    const prompt = document.getElementById('code-prompt').value.trim();
    if (!prompt) {
        alert('Please enter a prompt for code generation');
        return;
    }

    showLoading();
    try {
        const codePrompt = `Generate code for: ${prompt}. Please provide clean, well-commented code with proper formatting.`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: codePrompt }] 
                }],
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
        console.error('Code generation error:', error);
        alert(`Error generating code: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Image generation function
async function generateImage() {
    const prompt = document.getElementById('image-prompt').value.trim();
    if (!prompt) {
        alert('Please enter a prompt for image generation');
        return;
    }

    showLoading();
    try {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('output_format', 'png');
        formData.append('aspect_ratio', '1:1');

        const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STABILITY_API_KEY}`,
                'Accept': 'image/*'
            },
            body: formData
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
        console.error('Image generation error:', error);
        alert(`Error generating image: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Display functions
function displayTextResult(text) {
    const resultsDiv = document.getElementById('text-results');
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    resultCard.innerHTML = `
        <h3>Generated Text</h3>
        <p>${text.replace(/\n/g, '<br>')}</p>
        <button class="btn download-btn" onclick="downloadText(\`${text.replace(/`/g, '\\`').replace(/'/g, "\\'")}\`)">💾 Download Text</button>
    `;
    resultsDiv.appendChild(resultCard);
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

function displayCodeResult(code) {
    const resultsDiv = document.getElementById('code-results');
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    
    const isHTML = code.toLowerCase().includes('<html') || code.toLowerCase().includes('<!doctype');
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    resultCard.innerHTML = `
        <h3>Generated Code</h3>
        <div class="code-result">${escapedCode}</div>
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
            <div class="button-group">
                <button class="btn download-btn" onclick="downloadImage('${imageUrl}')">💾 Download Image</button>
                <button class="btn regenerate-btn" onclick="regenerateImage('${prompt}')">🔄 Regenerate</button>
            </div>
        </div>
    `;
    resultsDiv.appendChild(resultCard);
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

// Download functions
function downloadText(text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadCode(code) {
    let extension = '.txt';
    let mimeType = 'text/plain';
    
    // Determine file extension based on code content
    if (code.toLowerCase().includes('<html') || code.toLowerCase().includes('<!doctype')) {
        extension = '.html';
        mimeType = 'text/html';
    } else if (code.includes('def ') || code.includes('import ') || code.includes('from ')) {
        extension = '.py';
        mimeType = 'text/x-python';
    } else if (code.includes('function') || code.includes('const ') || code.includes('let ') || code.includes('var ')) {
        extension = '.js';
        mimeType = 'text/javascript';
    } else if (code.includes('{') && code.includes('}') && (code.includes('margin') || code.includes('padding'))) {
        extension = '.css';
        mimeType = 'text/css';
    }
    
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-code${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadImage(imageUrl) {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'generated-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Utility functions
function previewHTML(code) {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(code);
    newWindow.document.close();
}

function regenerateImage(prompt) {
    document.getElementById('image-prompt').value = prompt;
    generateImage();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Content Generator initialized successfully!');
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to generate content
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const activeSection = document.querySelector('.content-section.active');
            if (activeSection) {
                const sectionId = activeSection.id;
                if (sectionId === 'text-section') {
                    generateText();
                } else if (sectionId === 'code-section') {
                    generateCode();
                } else if (sectionId === 'image-section') {
                    generateImage();
                }
            }
        }
    });
});
