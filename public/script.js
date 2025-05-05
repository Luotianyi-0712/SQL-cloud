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
  const adminKeyInput = document.getElementById('adminKey');
  
  // 设置滑块范围
  expirySlider.min = 0;  // 0 表示永久
  expirySlider.max = 720;  // 最大 30 天
  expirySlider.value = 24; // 默认 24 小时
  expiryHours.value = 24;
  
  // 过期时间滑块
  expirySlider.addEventListener('input', function() {
    const hours = parseInt(this.value);
    expiryHours.value = hours;
    updateExpiryText(hours);
  });
  
  // 手动输入过期时间
  expiryHours.addEventListener('change', function() {
    let hours = parseInt(this.value);
    
    // 确保值在有效范围内
    if (isNaN(hours) || hours < 0) {
      hours = 0;
    } else if (hours > 720 && hours !== 0) {
      hours = 720;
    }

    this.value = hours;
    expirySlider.value = hours;
    updateExpiryText(hours);
  });
  
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
      handleFileSelect();
    }
  }
  
  // 文件选择事件
  fileInput.addEventListener('change', handleFileSelect);
  
  function handleFileSelect() {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      fileNameDisplay.textContent = `已选择: ${file.name} (${formatFileSize(file.size)})`;
      fileNameDisplay.classList.remove('hidden');
      fileDropArea.classList.add('file-selected');
    } else {
      fileNameDisplay.textContent = '';
      fileNameDisplay.classList.add('hidden');
      fileDropArea.classList.remove('file-selected');
    }
  }
  
  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // 格式化日期时间
  function formatDateTime(dateString) {
    if (!dateString) return '永久有效';

    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  
  // 上传表单提交
  uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!fileInput.files.length) {
      showNotification('请选择要上传的文件', 'error');
      return;
    }

    if (!adminKeyInput.value.trim()) {
      showNotification('请输入管理员密钥', 'error');
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expiryHours', expiryHours.value);
    formData.append('adminKey', adminKeyInput.value.trim());
    
    // 显示进度条
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    uploadResult.classList.add('hidden');
    
    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          progressBar.style.width = percentComplete + '%';
          progressText.textContent = percentComplete + '%';
        }
      });
      
      xhr.addEventListener('load', function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          
          // 显示上传结果
          uploadResult.innerHTML = `
            <div class="success-animation">
              <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h3>文件上传成功！</h3>
            <div class="info-item">
              <span class="info-label">访问码:</span>
              <div class="code-container">
                <span class="access-code" id="accessCodeDisplay">${response.accessCode}</span>
                <button class="copy-btn" data-clipboard-text="${response.accessCode}">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">访问链接:</span>
              <div class="code-container">
                <input type="text" id="accessLinkInput" value="${window.location.origin}/api/file/${response.accessCode}" readonly>
                <button class="copy-btn" data-clipboard-text="${window.location.origin}/api/file/${response.accessCode}">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">过期时间:</span>
              <span>${formatDateTime(response.expiryDate)}</span>
            </div>
          `;
          uploadResult.classList.remove('hidden');
          
          // 重置表单
          uploadForm.reset();
          fileNameDisplay.textContent = '';
          fileNameDisplay.classList.add('hidden');
          fileDropArea.classList.remove('file-selected');
          
          showNotification('文件上传成功！', 'success');
        } else {
          let errorMessage = '上传失败';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          showNotification(errorMessage, 'error');
        }

        // 隐藏进度条
        setTimeout(() => {
          progressContainer.classList.add('hidden');
        }, 1000);
      });
      
      xhr.addEventListener('error', function() {
        showNotification('网络错误，上传失败', 'error');
        progressContainer.classList.add('hidden');
      });
      
      xhr.addEventListener('abort', function() {
        showNotification('上传已取消', 'warning');
        progressContainer.classList.add('hidden');
      });
      
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('上传过程中发生错误', 'error');
      progressContainer.classList.add('hidden');
    }
  });
  
  // 下载表单提交
  downloadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const accessCode = document.getElementById('accessCode').value.trim();
    
    if (!accessCode) {
      showNotification('请输入访问码', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/file/info/${accessCode}`);
      
      if (response.ok) {
        const fileData = await response.json();

        // 显示文件信息
        fileInfo.innerHTML = `
          <div class="file-info-container">
            <div class="file-icon">
              <i class="fas fa-file"></i>
            </div>
            <div class="file-details">
              <h3>${fileData.filename}</h3>
              <div class="file-meta">
                <div class="meta-item">
                  <i class="fas fa-weight"></i>
                  <span>${formatFileSize(fileData.filesize)}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-clock"></i>
                  <span>${formatDateTime(fileData.expiresAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <a href="/api/file/${accessCode}" class="download-btn">
            <i class="fas fa-download"></i> 下载文件
          </a>
        `;
        fileInfo.classList.remove('hidden');

        showNotification('文件信息获取成功！', 'success');
      } else {
        let errorMessage = '获取文件信息失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Download info error:', error);
      showNotification('获取文件信息时发生错误', 'error');
    }
  });
  
  // 剪贴板成功事件
  clipboard.on('success', function(e) {
    showNotification('链接已复制到剪贴板！', 'success');
    e.clearSelection();
  });
  
  // 剪贴板错误事件
  clipboard.on('error', function(e) {
    showNotification('复制失败，请手动复制', 'error');
  });
  
  // 通知函数
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // 3秒后隐藏通知
    setTimeout(() => {
      notification.classList.remove('show');
      
      // 动画结束后移除元素
      notification.addEventListener('transitionend', function() {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      });
    }, 3000);
  }
  
  // 检查URL中是否有访问码参数
  const urlParams = new URLSearchParams(window.location.search);
  const accessCodeParam = urlParams.get('code');
  
  if (accessCodeParam) {
    document.getElementById('accessCode').value = accessCodeParam;
    // 自动触发下载表单提交
    downloadForm.dispatchEvent(new Event('submit'));

    // 更新URL，移除参数
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }
  
  // 切换主题
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      
      // 保存主题偏好到本地存储
      const isDarkTheme = document.body.classList.contains('dark-theme');
      localStorage.setItem('darkTheme', isDarkTheme);
      
      // 更新图标
      this.innerHTML = isDarkTheme ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    });

    // 加载保存的主题偏好
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
      document.body.classList.add('dark-theme');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }
});
