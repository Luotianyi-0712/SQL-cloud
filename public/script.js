document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const uploadResult = document.getElementById('uploadResult');
    const downloadForm = document.getElementById('downloadForm');
    const fileInfo = document.getElementById('fileInfo');
    
    // Upload form submission
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      const fileInput = document.getElementById('file');
      const adminKey = document.getElementById('adminKey').value;
      const expiryHours = document.getElementById('expiryHours').value;
      
      if (!fileInput.files[0]) {
        showResult(uploadResult, 'Please select a file to upload', 'error');
        return;
      }
      
      formData.append('file', fileInput.files[0]);
      formData.append('expiryHours', expiryHours);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'X-Admin-Key': adminKey
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Upload failed');
        }
        
        const result = `
          <h3>File uploaded successfully!</h3>
          <p><strong>Access Code:</strong> ${data.accessCode}</p>
          <p><strong>Expires at:</strong> ${new Date(data.expiryDate).toLocaleString()}</p>
        `;
        
        showResult(uploadResult, result, 'success');
        uploadForm.reset();
      } catch (error) {
        showResult(uploadResult, error.message, 'error');
      }
    });
    
    // Download form submission
    downloadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const accessCode = document.getElementById('accessCode').value;
      
      if (!accessCode) {
        showResult(fileInfo, 'Please enter an access code', 'error');
        return;
      }
      
      try {
        const response = await fetch(`/api/file/info/${accessCode}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'File not found');
        }
        
        // Format file size
        const filesize = formatFileSize(data.filesize);
        
        const result = `
          <h3>File Information</h3>
          <p><strong>Filename:</strong> ${data.filename}</p>
          <p><strong>Size:</strong> ${filesize}</p>
          <p><strong>Type:</strong> ${data.contentType}</p>
          <p><strong>Uploaded:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
          <p><strong>Expires:</strong> ${new Date(data.expiresAt).toLocaleString()}</p>
          <a href="/api/file/${accessCode}" class="download-btn button">Download File</a>
        `;
        
        showResult(fileInfo, result, 'success');
      } catch (error) {
        showResult(fileInfo, error.message, 'error');
      }
    });
    
    function showResult(element, message, type) {
      element.innerHTML = message;
      element.classList.remove('hidden', 'success', 'error');
      if (type) {
        element.classList.add(type);
      }
    }
    
    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' bytes';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
      else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
      else return (bytes / 1073741824).toFixed(2) + ' GB';
    }
  });
  