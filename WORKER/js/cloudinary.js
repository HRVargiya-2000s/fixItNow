// ✅ FIXED - Cloudinary Upload Handler (No Conflicts)
const CloudinaryUpload = {
    cloudName: 'dqs1kmwwy',
    uploadPreset: 'ml_default',
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    uploadedImages: [],

    init() {
        // Add CSS animations only once
        this.addAnimations();

        const dropZone = document.querySelector('.file-upload');
        if (!dropZone) {
            console.warn('⚠️ File upload drop zone not found');
            return;
        }

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        fileInput.id = 'cloudinaryFileInput';
        dropZone.appendChild(fileInput);

        dropZone.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                fileInput.click();
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#3b82f6';
            dropZone.style.background = 'rgba(59, 130, 246, 0.05)';
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '';
            dropZone.style.background = '';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '';
            dropZone.style.background = '';
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            e.target.value = '';
        });

        console.log('✅ Cloudinary upload initialized');
        console.log(`📤 Upload preset: ${this.uploadPreset}`);
        console.log(`☁️ Cloud name: ${this.cloudName}`);
    },

    async handleFiles(files) {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;

        console.log(`📁 Processing ${fileArray.length} file(s)...`);

        for (const file of fileArray) {
            if (!this.validateFile(file)) continue;

            this.showLoading();

            try {
                console.log(`⬆️ Uploading: ${file.name}`);
                const result = await this.uploadToCloudinary(file);
                
                this.uploadedImages.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                    filename: file.name,
                    size: file.size
                });

                this.showPreview(result.secure_url, file.name);
                console.log('✅ Upload successful:', result.secure_url);
                this.showNotification(`✅ ${file.name} uploaded!`, 'success');
            } catch (error) {
                console.error('❌ Upload error:', error);
                this.showNotification(`❌ ${file.name} failed: ${error.message}`, 'error');
            } finally {
                this.hideLoading();
            }
        }
    },

    validateFile(file) {
        if (!this.allowedTypes.includes(file.type)) {
            this.showNotification(`❌ Invalid file type: ${file.name}`, 'error');
            return false;
        }
        if (file.size > this.maxFileSize) {
            this.showNotification(`❌ ${file.name} too large (max 5MB)`, 'error');
            return false;
        }
        return true;
    },

    async uploadToCloudinary(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', 'fixitnow/issues');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
            { method: 'POST', body: formData }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        return await response.json();
    },

    showLoading() {
        const dropZone = document.querySelector('.file-upload');
        dropZone.style.pointerEvents = 'none';
        dropZone.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #3b82f6; margin-bottom: 15px;"></i>
            <p style="color: #3b82f6; font-weight: 600;">Uploading...</p>
        `;
    },

    hideLoading() {
        const dropZone = document.querySelector('.file-upload');
        dropZone.style.pointerEvents = '';
        dropZone.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Click or drag images here</p>
            <small>Supported: JPG, PNG, GIF (Max 5MB each)</small>
        `;
    },

    showPreview(imageUrl, filename) {
        let previewGrid = document.getElementById('imagePreviewGrid');
        
        if (!previewGrid) {
            previewGrid = document.createElement('div');
            previewGrid.id = 'imagePreviewGrid';
            previewGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 15px;
                margin-top: 25px;
                padding: 15px;
                background: var(--bg-secondary);
                border-radius: 12px;
                border: 1px solid var(--border-color);
            `;
            document.querySelector('.file-upload').parentElement.appendChild(previewGrid);
        }

        const imgWrapper = document.createElement('div');
        imgWrapper.style.cssText = `
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid #10b981;
            background: var(--bg-card);
        `;
        
        imgWrapper.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${filename}"
                 style="width: 100%; height: 130px; object-fit: cover; display: block;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; 
                        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); 
                        padding: 8px 5px; color: white; font-size: 10px; 
                        text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                ${filename}
            </div>
            <button onclick="CloudinaryUpload.removeImage('${imageUrl}', this)" 
                style="position: absolute; top: 8px; right: 8px; 
                       background: rgba(239, 68, 68, 0.95); 
                       color: white; border: none; border-radius: 50%; 
                       width: 30px; height: 30px; cursor: pointer; 
                       display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-times"></i>
            </button>
        `;
        previewGrid.appendChild(imgWrapper);
    },

    removeImage(imageUrl, buttonElement) {
        this.uploadedImages = this.uploadedImages.filter(img => img.url !== imageUrl);
        buttonElement.closest('div').remove();
        
        const grid = document.getElementById('imagePreviewGrid');
        if (grid && this.uploadedImages.length === 0) {
            grid.remove();
        }
    },

    getImageUrls() {
        return this.uploadedImages.map(img => img.url);
    },

    getUploadedImages() {
        return this.uploadedImages;
    },

    showNotification(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };

        const notification = document.createElement('div');
        notification.className = 'cloudinary-notification';
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease forwards;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Add animations only once
    addAnimations() {
        if (document.getElementById('cloudinary-animations')) return;

        const styleElement = document.createElement('style');
        styleElement.id = 'cloudinary-animations';
        styleElement.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(styleElement);
    },

    clearUploads() {
        this.uploadedImages = [];
        const grid = document.getElementById('imagePreviewGrid');
        if (grid) grid.remove();
    }
};

// Make globally available
window.CloudinaryUpload = CloudinaryUpload;

console.log('🚀 Cloudinary module loaded');
