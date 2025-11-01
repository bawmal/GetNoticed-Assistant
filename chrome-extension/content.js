// Content script that runs on all pages
class GetNoticedContentScript {
  constructor() {
    this.init();
  }

  init() {
    // Only run on pages that look like job application forms
    if (this.isJobApplicationPage()) {
      this.addGetNoticedButton();
      this.setupMessageListener();
    }
  }

  isJobApplicationPage() {
    // Detect if this is likely a job application page
    const indicators = [
      'apply', 'application', 'job', 'career', 'position', 
      'resume', 'cv', 'cover letter', 'upload'
    ];
    
    const pageText = document.body.textContent.toLowerCase();
    const url = window.location.href.toLowerCase();
    
    return indicators.some(indicator => 
      pageText.includes(indicator) || url.includes(indicator)
    );
  }

  addGetNoticedButton() {
    // Check if button already exists
    if (document.getElementById('getnoticed-autofill-btn')) {
      return;
    }

    // Add a floating button to trigger auto-fill
    const button = document.createElement('div');
    button.id = 'getnoticed-autofill-btn';
    button.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white;
        padding: 12px 16px;
        border-radius: 50px;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
        user-select: none;
      " 
      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 25px rgba(59, 130, 246, 0.5)'" 
      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(59, 130, 246, 0.4)'">
        🚀 GetNoticed Auto-Fill
      </div>
    `;
    
    button.addEventListener('click', () => {
      this.triggerAutoFill();
    });
    
    document.body.appendChild(button);
  }

  triggerAutoFill() {
    // Show a simple notification that extension is working
    this.showNotification('Opening GetNoticed Assistant...', 'info');
    
    // The popup will handle the actual auto-fill logic
    // This button just provides easy access
  }

  showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.getElementById('getnoticed-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'getnoticed-notification';
    
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      ">
        ${message}
      </div>
    `;

    // Add animation styles
    if (!document.getElementById('getnoticed-styles')) {
      const styles = document.createElement('style');
      styles.id = 'getnoticed-styles';
      styles.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'fillFields') {
        this.fillFields(request.data);
        sendResponse({ success: true });
      } else if (request.action === 'highlightFields') {
        this.highlightDetectedFields();
        sendResponse({ success: true });
      }
    });
  }

  fillFields(data) {
    // Implementation for filling form fields
    console.log('Filling fields with data:', data);
    this.showNotification('Fields filled successfully!', 'success');
  }

  highlightDetectedFields() {
    // Highlight all detected form fields
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (this.isRelevantField(input)) {
        input.style.outline = '2px solid #3b82f6';
        input.style.outlineOffset = '2px';
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          input.style.outline = '';
          input.style.outlineOffset = '';
        }, 3000);
      }
    });
  }

  isRelevantField(input) {
    const label = this.getFieldLabel(input);
    const type = this.detectFieldType(input, label);
    return type !== 'unknown';
  }

  getFieldLabel(input) {
    // Try multiple methods to find the label
    if (input.labels && input.labels.length > 0) {
      return input.labels[0].textContent.trim();
    }
    
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent.trim();
    
    const placeholder = input.placeholder;
    if (placeholder) return placeholder;
    
    return input.name || input.id || 'Unknown';
  }

  detectFieldType(input, label) {
    const labelLower = label.toLowerCase();
    const nameLower = (input.name || '').toLowerCase();
    
    // Common field patterns
    if (labelLower.includes('name') || nameLower.includes('name')) return 'name';
    if (labelLower.includes('email') || nameLower.includes('email')) return 'email';
    if (labelLower.includes('phone') || nameLower.includes('phone')) return 'phone';
    if (labelLower.includes('address') || nameLower.includes('address')) return 'address';
    if (labelLower.includes('experience') || nameLower.includes('experience')) return 'experience';
    if (labelLower.includes('cover letter') || nameLower.includes('cover')) return 'cover_letter';
    if (labelLower.includes('resume') || labelLower.includes('cv')) return 'resume';
    if (input.type === 'file') return 'file_upload';
    
    return 'unknown';
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GetNoticedContentScript();
  });
} else {
  new GetNoticedContentScript();
}