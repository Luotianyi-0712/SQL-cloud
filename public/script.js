document.addEventListener('DOMContentLoaded', function() {
  // 初始化动画库
  AOS.init({
    duration: 800,
    easing: 'ease-out',
    once: true
  });
  
  // 初始化剪贴板功能
  const clipboard = new ClipboardJS('.copy-btn');
  
  // 获取DOM元素
  const uploadForm = document.getElementById('uploadForm');
  const downloadForm = document.getElementById('downloadForm');
  const fileInput = document.getElementById('file');
  const fileDropArea = document.getElementById('fileDropArea');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const uploadResult = document.getElementById('uploadResult');
  const fileInfo = document.getElementById('fileInfo');
  const expirySlider = document.getElementById('expirySlider');
  const expiryHours = document.getElementById('expiryHours');
  const expiryDisplay = document.getElementById('expiryDisplay');
  
  // 文件拖放功能
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    fileDropArea.classList.add('highlight');
  }
  
  function unhighlight() {
    fileDropArea.classList.remove('highlight');
  }
  
  fileDropArea.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      fileInput.files = files;
      updateFileNameDisplay(files[0].name);
    }
  }
  
  // 文件选择事件
  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      updateFileNameDisplay(this.files[0].name);
    } else {
      fileNameDisplay.classList.add('hidden');
    }
  });
  
  function updateFileNameDisplay(fileName) {
    fileNameDisplay.textContent = fileName;
    fileNameDisplay.classList.remove('hidden');
    
    // 根据文件类型显示不同图标
    const fileExtension = fileName.split('.').pop().toLowerCase();
    let iconClass = 'fas fa-file';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileExtension)) {
      iconClass = 'fas fa-file-image';
    } else if (['doc', 'docx', 'odt', 'rtf'].includes(fileExtension)) {
      iconClass = 'fas fa-file-word';
    } else if (['xls', 'xlsx', 'ods', 'csv'].includes(fileExtension)) {
      iconClass = 'fas fa-file-excel';
    } else if (['ppt', 'pptx', 'odp'].includes(fileExtension)) {
      iconClass = 'fas fa-file-powerpoint';
    } else if (['pdf'].includes(fileExtension)) {
      iconClass = 'fas fa-file-pdf';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExtension)) {
      iconClass = 'fas fa-file-archive';
    } else if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(fileExtension)) {
      iconClass = 'fas fa-file-audio';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(fileExtension)) {
      iconClass = 'fas fa-file-video';
    } else if (['html', 'css', 'js', 'php', 'py', 'java', 'c', 'cpp', 'cs', 'rb'].includes(fileExtension)) {
      iconClass = 'fas fa-file-code';
    } else if (['txt', 'md'].includes(fileExtension)) {
      iconClass = 'fas fa-file-alt';
    }
    
    fileNameDisplay.innerHTML = `<i class="${iconClass}"></i> ${fileName}`;
  }
  
// 修改过期时间滑块范围
expirySlider.min = 0;  // 0 表示永久
expirySlider.max = 8760;  // 最大 1 年

// 修改 updateExpiryText 函数
function updateExpiryText(hours) {
  if (hours === 0) {
    expiryDisplay.textContent = "永久存储";
    return;
  }
  
  let text = '';
  if (hours < 24) {
    text = `${hours} 小时`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    text = `${days} 天`;
    if (remainingHours > 0) {
      text += ` ${remainingHours} 小时`;
    }
  }
  expiryDisplay.textContent = text;
}

  
  // 初始化过期时间显示
  updateExpiryText(parseInt(expiryHours.value));
  
  // 上传表单提交
  uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!fileInput.files[0]) {
      showToast('请选择要上传的文件', 'error');
      return;
    }
    
    const formData = new FormData(this);
    
    // 显示进度条
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    
    // 禁用提交按钮
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传中...';
    
    // 发送请求
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', function(e) {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = percentComplete + '%';
        progressText.textContent = percentComplete + '%';
      }
    });
    
    xhr.addEventListener('load', function() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 上传';
      
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        
        // 显示上传结果
        const result = `
          <div class="success-animation">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h3>文件上传成功！</h3>
          <div class="info-card">
            <div class="info-item">
              <span class="info-label">访问码:</span>
              <div class="code-container">
                <span class="access-code">${data.accessCode}</span>
                <button class="copy-btn" data-clipboard-text="${data.accessCode}">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">过期时间:</span>
              <span>${new Date(data.expiryDate).toLocaleString()}</span>
            </div>
          </div>
        `;
        
        uploadResult.innerHTML = result;
        uploadResult.classList.remove('hidden');
        
        // 重新初始化剪贴板
        new ClipboardJS('.copy-btn');
        
        // 重置表单
        uploadForm.reset();
        fileNameDisplay.classList.add('hidden');
        
        // 滚动到结果区域
        uploadResult.scrollIntoView({ behavior: 'smooth' });
      } else {
        let errorMessage = '上传失败';
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = response.message || errorMessage;
        } catch (e) {
          console.error('解析错误响应失败', e);
        }
        showToast(errorMessage, 'error');
      }
      
      // 隐藏进度条
      setTimeout(() => {
        progressContainer.classList.add('hidden');
      }, 500);
    });
    
    xhr.addEventListener('error', function() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 上传';
      progressContainer.classList.add('hidden');
      showToast('网络错误，请稍后重试', 'error');
    });
    
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
  
  // 下载表单提交
  downloadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const accessCode = document.getElementById('accessCode').value.trim();
    
    if (!accessCode) {
      showToast('请输入访问码', 'error');
      return;
    }
    
    // 禁用提交按钮
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 查询中...';
    
    // 清空之前的结果
    fileInfo.classList.add('hidden');
    fileInfo.innerHTML = '';
    
    // 发送请求
    fetch(`/api/file-info/${accessCode}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('文件不存在或已过期');
        }
        return response.json();
      })
      .then(data => {
        // 根据文件类型选择图标
        const fileExtension = data.filename.split('.').pop().toLowerCase();
        let fileIcon = 'fas fa-file';
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-image';
        } else if (['doc', 'docx', 'odt', 'rtf'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-word';
        } else if (['xls', 'xlsx', 'ods', 'csv'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-excel';
        } else if (['ppt', 'pptx', 'odp'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-powerpoint';
        } else if (['pdf'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-pdf';
        } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-archive';
        } else if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-audio';
        } else if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-video';
        } else if (['html', 'css', 'js', 'php', 'py', 'java', 'c', 'cpp', 'cs', 'rb'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-code';
        } else if (['txt', 'md'].includes(fileExtension)) {
          fileIcon = 'fas fa-file-alt';
        }
        
        // 格式化文件大小
        const filesize = formatFileSize(data.size);
        
        // 显示文件信息
        const result = `
          <div class="file-info-container">
            <div class="file-icon">
              <i class="${fileIcon}"></i>
            </div>
            <div class="file-details">
              <h3>${data.filename}</h3>
              <div class="file-meta">
                <div class="meta-item">
                  <i class="fas fa-weight-hanging"></i>
                  <span>${filesize}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-file-alt"></i>
                  <span>${data.contentType}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-calendar-plus"></i>
                  <span>${new Date(data.createdAt).toLocaleString()}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-calendar-times"></i>
                  <span>${new Date(data.expiresAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <a href="/api/file/${accessCode}" class="download-btn">
            <i class="fas fa-download"></i> 下载文件
          </a>
        `;
        
        fileInfo.innerHTML = result;
        fileInfo.classList.remove('hidden');
        
        // 滚动到结果区域
        fileInfo.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(error => {
        showToast(error.message, 'error');
      })
      .finally(() => {
        // 恢复提交按钮
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-search"></i> 查询文件';
      });
  });
  
  // 剪贴板功能
  clipboard.on('success', function(e) {
    showToast('访问码已复制到剪贴板！', 'success');
    e.clearSelection();
  });
  
  clipboard.on('error', function() {
    showToast('复制失败，请手动复制', 'error');
  });
  
  // 辅助函数
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function showToast(message, type = 'info') {
    // 移除现有的toast
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
      document.body.removeChild(toast);
    });
    
    // 创建新的toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // 自动隐藏toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
});
