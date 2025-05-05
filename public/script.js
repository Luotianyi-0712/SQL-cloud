document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectedFile = document.getElementById('selectedFile');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    const uploadButton = document.getElementById('uploadButton');
    const uploadButtonText = document.getElementById('uploadButtonText');
    const uploadSpinner = document.getElementById('uploadSpinner');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = uploadProgress.querySelector('.progress-bar');
    const passwordProtect = document.getElementById('passwordProtect');
    const passwordField = document.getElementById('passwordField');
    const password = document.getElementById('password');
    
    // 拖放功能
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            updateFileInfo();
        }
    });
    
    // 点击上传区域触发文件选择
    dropZone.addEventListener('click', function() {
        if (selectedFile.style.display === 'none') {
            fileInput.click();
        }
    });
    
    // 文件选择变化
    fileInput.addEventListener('change', updateFileInfo);
    
    // 移除选择的文件
    removeFile.addEventListener('click', function(e) {
        e.stopPropagation();
        fileInput.value = '';
        selectedFile.style.display = 'none';
        dropZone.querySelector('.upload-prompt').style.display = 'flex';
        uploadButton.disabled = true;
    });
    
    // 密码保护切换
    passwordProtect.addEventListener('change', function() {
        passwordField.style.display = this.checked ? 'block' : 'none';
        if (!this.checked) {
            password.value = '';
        }
    });
    
    // 上传按钮点击事件
    uploadButton.addEventListener('click', uploadFile);
    
    // 更新文件信息
    function updateFileInfo() {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            
            selectedFile.style.display = 'flex';
            dropZone.querySelector('.upload-prompt').style.display = 'none';
            uploadButton.disabled = false;
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
    
    // 上传文件
    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) return;
        
        // 准备FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('expiryTime', document.getElementById('expiryTime').value);
        
        if (passwordProtect.checked && password.value) {
            formData.append('password', password.value);
        }
        
        // 设置上传状态
        uploadButton.disabled = true;
        uploadButtonText.textContent = '上传中...';
        uploadSpinner.style.display = 'inline-block';
        uploadProgress.style.display = 'block';
        
        // 创建XHR请求
        const xhr = new XMLHttpRequest();
        
        // 进度监听
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = percentComplete + '%';
                progressBar.setAttribute('aria-valuenow', percentComplete);
            }
        });
        
        // 请求完成
        xhr.addEventListener('load', function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                handleUploadSuccess(response);
            } else {
                handleUploadError('上传失败: ' + xhr.statusText);
            }
        });
        
        // 请求错误
        xhr.addEventListener('error', function() {
            handleUploadError('网络错误，请稍后重试');
        });
        
        // 请求中止
        xhr.addEventListener('abort', function() {
            handleUploadError('上传已取消');
        });
        
        // 发送请求
        xhr.open('POST', '/upload');
        xhr.send(formData);
    }
    
    // 处理上传成功
    function handleUploadSuccess(response) {
        // 重置上传状态
        resetUploadState();
        
        // 显示结果区域
        const uploadForm = document.getElementById('uploadForm');
        const uploadResult = document.getElementById('uploadResult');
        
        uploadForm.style.display = 'none';
        uploadResult.style.display = 'block';
        
        // 设置访问链接
        const accessLinkElement = document.getElementById('accessLink');
        if (accessLinkElement) {
            accessLinkElement.value = `${window.location.origin}/download/${response.accessCode}`;
        } else {
            console.error('Element with ID "accessLink" not found');
        }
        
        // 如果有密码，显示密码区域
        if (response.password) {
            const passwordDisplay = document.getElementById('passwordDisplay');
            const accessPassword = document.getElementById('accessPassword');
            
            if (passwordDisplay && accessPassword) {
                passwordDisplay.style.display = 'block';
                accessPassword.value = response.password;
            }
        }
    }
    
    // 处理上传错误
    function handleUploadError(errorMessage) {
        // 重置上传状态
        resetUploadState();
        
        // 显示错误消息
        alert(errorMessage);
    }
    
    // 重置上传状态
    function resetUploadState() {
        uploadButton.disabled = false;
        uploadButtonText.textContent = '上传文件';
        uploadSpinner.style.display = 'none';
        uploadProgress.style.display = 'none';
        progressBar.style.width = '0%';
        progressBar.setAttribute('aria-valuenow', 0);
    }
});

// 复制到剪贴板
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.select();
    document.execCommand('copy');
    
    // 显示复制成功提示
    const tooltip = document.getElementById('copyTooltip');
    tooltip.style.display = 'block';
    
    // 计算位置
    const rect = element.getBoundingClientRect();
    tooltip.style.top = (rect.top - 40) + 'px';
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    
    // 2秒后隐藏提示
    setTimeout(function() {
        tooltip.style.display = 'none';
    }, 2000);
}

// 重置上传表单
function resetUploadForm() {
    const uploadForm = document.getElementById('uploadForm');
    const uploadResult = document.getElementById('uploadResult');
    const fileInput = document.getElementById('fileInput');
    const selectedFile = document.getElementById('selectedFile');
    const dropZone = document.getElementById('dropZone');
    const passwordProtect = document.getElementById('passwordProtect');
    const passwordField = document.getElementById('passwordField');
    const passwordDisplay = document.getElementById('passwordDisplay');
    
    // 重置文件选择
    fileInput.value = '';
    selectedFile.style.display = 'none';
    dropZone.querySelector('.upload-prompt').style.display = 'flex';
    
    // 重置密码选项
    passwordProtect.checked = false;
    passwordField.style.display = 'none';
    document.getElementById('password').value = '';
    
    if (passwordDisplay) {
        passwordDisplay.style.display = 'none';
    }
    
    // 切换显示区域
    uploadResult.style.display = 'none';
    uploadForm.style.display = 'block';
    
    // 禁用上传按钮
    document.getElementById('uploadButton').disabled = true;
}
