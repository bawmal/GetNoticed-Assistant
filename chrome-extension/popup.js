// Popup script for Chrome extension
class GetNoticedPopup {
  constructor() {
    this.init();
  }

  async init() {
    await this.checkConnection();
    await this.scanCurrentPage();
    this.setupEventListeners();
  }

  async checkConnection() {
    try {
      // Try common Vite dev server ports
      const ports = [5173, 3000, 3002];
      let connected = false;
      
      for (const port of ports) {
        try {
          const response = await fetch(`http://localhost:${port}`, { 
            method: 'HEAD',
            mode: 'no-cors' // Avoid CORS issues
          });
          connected = true;
          // Store the working port
          await chrome.storage.local.set({ appPort: port });
          break;
        } catch (e) {
          continue;
        }
      }
      
      this.updateStatus(connected);
    } catch (error) {
      this.updateStatus(false);
    }
  }

  updateStatus(connected) {
    const statusEl = document.getElementById('status');
    if (connected) {
      statusEl.className = 'status connected';
      statusEl.textContent = '🟢 Ready to auto-fill';
    } else {
      statusEl.className = 'status disconnected';
      statusEl.textContent = '⚠️ Open GetNoticed app first (localhost:5173)';
    }
  }

  async scanCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we can access this page
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        this.displayError('Cannot scan Chrome internal pages');
        return;
      }
      
      // Inject content script to scan for form fields
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.scanForJobApplicationFields
      });

      const fields = results[0].result || [];
      this.displayFieldResults(fields);
    } catch (error) {
      console.error('Error scanning page:', error);
      
      // More specific error messages
      if (error.message.includes('Cannot access')) {
        this.displayError('Cannot access this page. Try refreshing or visiting a different job site.');
      } else if (error.message.includes('activeTab')) {
        this.displayError('Permission denied. Please refresh the page and try again.');
      } else {
        this.displayError('Unable to scan this page. Try a different job application form.');
      }
    }
  }

  scanForJobApplicationFields() {
    // This function runs in the page context
    const formFields = [];
    
    console.log('🔍 Scanning page for form fields...');
    
    // Helper functions defined first
    function getFieldLabel(input) {
      if (input.labels && input.labels.length > 0) {
        return input.labels[0].textContent.trim();
      }
      
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent.trim();
      
      const placeholder = input.placeholder;
      if (placeholder) return placeholder;
      
      return input.name || input.id || 'Unknown';
    }

    function detectFieldType(input, label) {
      const labelLower = (label || '').toLowerCase();
      const nameLower = (input.name || '').toLowerCase();
      const idLower = (input.id || '').toLowerCase();
      const placeholderLower = (input.placeholder || '').toLowerCase();
      
      const allText = `${labelLower} ${nameLower} ${idLower} ${placeholderLower}`;
      
      if (allText.includes('name')) return 'name';
      if (allText.includes('email') || input.type === 'email') return 'email';
      if (allText.includes('phone') || input.type === 'tel') return 'phone';
      if (allText.includes('address')) return 'address';
      if (input.tagName.toLowerCase() === 'textarea') return 'text_area';
      if (input.type === 'file') return 'file_upload';
      
      return 'text_field';
    }
    
    // Check for iframes first (common in Lever, Greenhouse, etc.)
    const iframes = document.querySelectorAll('iframe');
    console.log('📄 Found iframes:', iframes.length);
    
    if (iframes.length > 0) {
      formFields.push({
        element: 'iframe',
        type: 'embedded_form',
        label: 'Embedded Application Form (iframe detected)',
        name: 'iframe-form'
      });
    }
    
    // Look for various form elements including hidden ones
    const inputs = document.querySelectorAll('input, textarea, select, [contenteditable="true"]');
    
    inputs.forEach(input => {
      // Skip only truly hidden fields
      if (input.type === 'hidden') {
        return;
      }
      
      // Check if field is visible (more lenient check)
      const style = window.getComputedStyle(input);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return;
      }
      
      const label = getFieldLabel(input);
      const type = detectFieldType(input, label);
      
      // Accept all field types (removed the 'unknown' check)
      formFields.push({
        element: input.tagName.toLowerCase(),
        type: type,
        label: label,
        name: input.name || input.id || input.className,
        required: input.required || input.getAttribute('aria-required') === 'true',
        placeholder: input.placeholder
      });
    });
    
    // Look for submit buttons to confirm this is a form page
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    console.log('🔘 Found buttons:', buttons.length);
    
    // If no fields found but buttons exist, it might be a dynamic form
    if (formFields.length === 0 && buttons.length > 0) {
      formFields.push({
        element: 'form-indicator',
        type: 'form_detected',
        label: 'Form page detected - fields may load dynamically',
        name: 'dynamic-form'
      });
    }
    
    console.log('✅ Scan complete. Found fields:', formFields.length);
    return formFields;
  }

  displayFieldResults(fields) {
    const contentEl = document.getElementById('content');
    
    if (fields.length === 0) {
      contentEl.innerHTML = `
        <div style="text-align: center; color: #6b7280; padding: 20px;">
          <p>No job application fields detected on this page.</p>
          <button class="btn btn-secondary" onclick="window.close()">Close</button>
        </div>
      `;
      return;
    }

    const jobFields = fields.filter(f => f.type !== 'unknown');
    
    contentEl.innerHTML = `
      <div style="margin-bottom: 12px;">
        <strong>Detected Fields: ${jobFields.length}</strong>
      </div>
      
      <button id="autoFillBtn" class="btn btn-primary">
        🚀 Auto-Fill Application
      </button>
      
      <button id="reviewBtn" class="btn btn-secondary">
        👀 Review Fields
      </button>
      
      <div class="field-count">
        Found ${jobFields.length} fillable fields
      </div>
    `;

    // Add event listeners
    document.getElementById('autoFillBtn').addEventListener('click', () => {
      this.autoFillApplication(jobFields);
    });
    
    document.getElementById('reviewBtn').addEventListener('click', () => {
      this.showFieldReview(jobFields);
    });
  }

  displayError(message) {
    const contentEl = document.getElementById('content');
    contentEl.innerHTML = `
      <div style="text-align: center; color: #dc2626; padding: 20px;">
        <p>${message}</p>
        <button class="btn btn-secondary" onclick="window.close()">Close</button>
      </div>
    `;
  }

  async autoFillApplication(fields) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Get user profile from main app
      const profile = await this.getUserProfile();
      
      if (!profile) {
        document.getElementById('content').innerHTML = `
          <div style="text-align: center; color: #dc2626; padding: 20px;">
            <p style="margin-bottom: 12px;">⚠️ No profile found</p>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
              Please open the GetNoticed app at <strong>localhost:5173</strong> and upload your CV first.
            </p>
            <button class="btn btn-secondary" onclick="window.close()">Close</button>
          </div>
        `;
        return;
      }

      // Execute auto-fill script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.fillApplicationFields,
        args: [fields, profile]
      });

      // Update status
      document.getElementById('content').innerHTML = `
        <div style="text-align: center; color: #059669; padding: 20px;">
          <p>✅ Application auto-filled!</p>
          <p style="font-size: 14px; color: #6b7280;">Review the fields and submit when ready.</p>
          <button class="btn btn-primary" onclick="window.close()">Done</button>
        </div>
      `;
    } catch (error) {
      console.error('Auto-fill error:', error);
      this.displayError('Failed to auto-fill application');
    }
  }

  async getUserProfile() {
    try {
      // Get profile from chrome storage (saved by main app)
      const result = await chrome.storage.local.get(['userProfile']);
      
      if (result.userProfile) {
        return result.userProfile;
      }
      
      // If no profile in storage, show helpful message
      console.log('No profile found in storage');
      return null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  fillApplicationFields(fields, profile) {
    // This function runs in the page context
    fields.forEach(field => {
      const element = document.querySelector(`[name="${field.name}"], #${field.name}`);
      if (!element) return;

      let value = '';
      
      switch (field.type) {
        case 'name':
          value = profile.personalDetails?.name || '';
          break;
        case 'email':
          value = profile.personalDetails?.email || '';
          break;
        case 'phone':
          value = profile.personalDetails?.phone || '';
          break;
        case 'address':
          value = profile.personalDetails?.location || '';
          break;
        case 'cover_letter':
          value = profile.generatedDocs?.coverLetter || '';
          break;
        case 'experience':
          value = profile.experience?.summary || '';
          break;
      }

      if (value && element.tagName.toLowerCase() !== 'select') {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Add visual feedback
        element.style.borderColor = '#10b981';
        element.style.backgroundColor = '#ecfdf5';
      }
    });
  }

  showFieldReview(fields) {
    const contentEl = document.getElementById('content');
    const fieldsList = fields.map(field => 
      `<div style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 4px;">
        <strong>${field.type}</strong>: ${field.label}
      </div>`
    ).join('');
    
    contentEl.innerHTML = `
      <div>
        <h3 style="margin-bottom: 12px;">Detected Fields:</h3>
        ${fieldsList}
        <button class="btn btn-primary" style="margin-top: 12px;" onclick="location.reload()">
          Back
        </button>
      </div>
    `;
  }

  setupEventListeners() {
    // Add any additional event listeners here
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new GetNoticedPopup();
});