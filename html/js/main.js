// main.js - Main page JavaScript
// This file can be manually modified - script won't overwrite it

async function toggleNikaya(nikayaCode) {
    const vaggaList = document.getElementById('nikaya-' + nikayaCode + '-vaggas');
    const icon = document.getElementById('nikaya-icon-' + nikayaCode);
    
    if (vaggaList.style.display === 'none') {
        if (vaggaList.innerHTML.includes('Loading')) {
            try {
                const response = await fetch(`nikayas/${nikayaCode}/index.html`);
                const html = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const vaggaContent = tempDiv.querySelector('.vagga-list');
                
                if (vaggaContent) {
                    vaggaList.innerHTML = vaggaContent.innerHTML;
                    const scripts = tempDiv.querySelectorAll('script');
                    scripts.forEach(script => {
                        const newScript = document.createElement('script');
                        newScript.textContent = script.textContent;
                        document.body.appendChild(newScript);
                    });
                }
            } catch (error) {
                vaggaList.innerHTML = '<div class="error">Failed to load vaggas</div>';
            }
        }
        vaggaList.style.display = 'block';
        icon.textContent = '▼';
    } else {
        vaggaList.style.display = 'none';
        icon.textContent = '▶';
    }
}

function toggleVagga(vaggaId) {
    const suttaList = document.getElementById(vaggaId + '-suttas');
    const icon = document.getElementById('icon-' + vaggaId);
    
    if (suttaList.style.display === 'none') {
        suttaList.style.display = 'block';
        icon.textContent = '▼';
    } else {
        suttaList.style.display = 'none';
        icon.textContent = '▶';
    }
}
