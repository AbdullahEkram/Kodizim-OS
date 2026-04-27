async function deployCode() {
    const btn = document.getElementById('deploy-btn');
    const prompt = document.getElementById('ai-prompt').value;
    const logBox = document.getElementById('system-logs');
    
    if (!prompt) return;

    btn.disabled = true;
    btn.innerText = "LINKING...";
    
    // تسجيل الحالة بدقة
    const addLog = (msg) => {
        logBox.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
    };

    addLog("Initiating Secure Neural Request...");

    try {
        // استخدام المسار المستقر v1 بدلاً من v1beta
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Act as an expert web developer. Create a complete, single-file HTML/CSS/JS response for: ${prompt}. 
                               Return ONLY the code. No explanations, no markdown code blocks like \`\`\`html.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                }
            })
        });

        // فحص الرد قبل المعالجة
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server ${response.status}: ${errorData.error?.message || 'Unknown Error'}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            let code = data.candidates[0].content.parts[0].text;
            
            // تنظيف الكود من أي زوائد Markdown
            code = code.replace(/^```html\n?|```javascript\n?|```css\n?|```$/gm, '').trim();

            const frame = document.getElementById('output-frame');
            const doc = frame.contentDocument || frame.contentWindow.document;
            
            doc.open();
            doc.write(code);
            doc.close();

            addLog("Success: Neural Link Established & Deployed.");
        } else {
            throw new Error("Invalid AI Response Structure.");
        }

    } catch (err) {
        // حل مشكلة Critical Error ببيانات واضحة
        console.error("Architect OS Diagnostic:", err);
        addLog(`CRITICAL: ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = "تـنـفـيـذ (DEPLOY)";
    }
}