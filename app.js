// This is the JavaScript version of your Python EDITOR_CONFIG
const EDITOR_CONFIG = {
    'course_links': {
        'file_name': 'course_links.json',
        'main_title': 'Course Links Editor',
        'primary_list_label': 'Courses',
        'secondary_list_label': 'Links for:',
        'primary_add_prompt': 'Enter the new course code (e.g., IOT 222):',
        'primary_confirm_delete': 'course links',
        'secondary_item_name': 'link',
        'data_wrapper_key': null,
        'item_display_key': 'name',
        'dialog_class_key': 'link'
    },
    'videos': {
        'file_name': 'videos.json', 'main_title': 'Video Editor',
        'primary_list_label': 'Courses', 'secondary_list_label': 'Videos for:',
        'primary_add_prompt': 'Enter the new course name:', 'primary_confirm_delete': 'course',
        'secondary_item_name': 'video',
        'data_wrapper_key': null, 'item_display_key': 'title', 
        'dialog_class_key': 'video'
    },
    'quizzes': {
        'file_name': 'quiz.json', 'main_title': 'Quiz Editor',
        'primary_list_label': 'Course Quizzes', 'secondary_list_label': 'Questions for:',
        'primary_add_prompt': 'Enter the new quiz code:', 'primary_confirm_delete': 'quiz',
        'secondary_item_name': 'question',
        'data_wrapper_key': 'quizzes', 'item_display_key': 'question', 
        'dialog_class_key': 'question'
    },
    'books': {
        'file_name': 'books.json', 'main_title': 'Library Editor',
        'primary_list_label': 'Book Categories', 'secondary_list_label': 'Books in Category:',
        'primary_add_prompt': 'Enter the new category key (e.g., iot, ai):', 'primary_confirm_delete': 'category',
        'secondary_item_name': 'book',
        'data_wrapper_key': null, 'item_display_key': 'title', 
        'dialog_class_key': 'book'
    }
};

// Main App Class
class UnifiedEditorApp {
    constructor() {
        this.data = {};
        this.current_config = null;
        this.current_primary_key = null;
        this.current_secondary_index = -1; // -1 for adding, 0+ for editing

        // Get all DOM elements
        this.dom = {
            editorSelect: document.getElementById('editor-select'),
            primaryLabel: document.getElementById('primary-label'),
            primaryList: document.getElementById('primary-list'),
            secondaryLabel: document.getElementById('secondary-label'),
            secondaryList: document.getElementById('secondary-list'),
            fileLoader: document.getElementById('file-loader'),
            saveFileBtn: document.getElementById('save-file-btn'),
            statusLabel: document.getElementById('status-label'),
            
            // GitHub Form
            githubForm: document.getElementById('github-form'),
            githubToken: document.getElementById('github-token'),
            githubUser: document.getElementById('github-user'),
            githubRepo: document.getElementById('github-repo'),
            githubFilePath: document.getElementById('github-filepath'),
            loadFromGitHubBtn: document.getElementById('load-github-btn'),
            commitPushBtn: document.getElementById('commit-push-btn'),

            // Primary Buttons
            addPrimaryBtn: document.getElementById('add-primary-btn'),
            removePrimaryBtn: document.getElementById('remove-primary-btn'),

            // Secondary Buttons
            addSecondaryBtn: document.getElementById('add-secondary-btn'),
            editSecondaryBtn: document.getElementById('edit-secondary-btn'),
            removeSecondaryBtn: document.getElementById('remove-secondary-btn'),
            
            // Modal
            modalElement: document.getElementById('item-modal'),
            modalTitle: document.getElementById('modal-title-label'),
            modalFormContent: document.getElementById('modal-form-content'),
            modalSaveBtn: document.getElementById('modal-save-btn')
        };

        // Initialize Bootstrap Modal
        this.modal = new bootstrap.Modal(this.dom.modalElement);

        // Bind all event listeners
        this.bindEvents();
    }

    bindEvents() {
        this.dom.editorSelect.addEventListener('change', this.onEditorSelect.bind(this));
        this.dom.fileLoader.addEventListener('change', this.loadDataFromFile.bind(this));
        
        // List selections
        this.dom.primaryList.addEventListener('change', this.onPrimarySelect.bind(this));
        this.dom.secondaryList.addEventListener('change', this.onSecondarySelect.bind(this));
        this.dom.secondaryList.addEventListener('dblclick', this.editSecondaryItem.bind(this));

        // Button clicks
        this.dom.addPrimaryBtn.addEventListener('click', this.addPrimaryItem.bind(this));
        this.dom.removePrimaryBtn.addEventListener('click', this.removePrimaryItem.bind(this));
        this.dom.addSecondaryBtn.addEventListener('click', this.addSecondaryItem.bind(this));
        this.dom.editSecondaryBtn.addEventListener('click', this.editSecondaryItem.bind(this));
        this.dom.removeSecondaryBtn.addEventListener('click', this.removeSecondaryItem.bind(this));
        
        this.dom.saveFileBtn.addEventListener('click', this.saveData.bind(this));
        // Note: modalSaveBtn listener is bound to an async method now
        this.dom.modalSaveBtn.addEventListener('click', this.onModalSave.bind(this));
        
        // GitHub buttons
        this.dom.loadFromGitHubBtn.addEventListener('click', this.loadFromGitHub.bind(this));
        this.dom.githubForm.addEventListener('submit', this.commitAndPush.bind(this));
    }

    setStatus(message, isError = false) {
        this.dom.statusLabel.textContent = `Status: ${message}`;
        this.dom.statusLabel.className = isError ? 'text-danger' : 'text-muted';
    }

    // --- Helper: Read File to Base64 ---
    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // --- Helper: Compress Image ---
    // Resizes image to max width 800px and compresses to JPEG quality 0.7
    compressImage(file, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // --- Event Handlers and Logic ---

    onEditorSelect(event) {
        const editorKey = event.target.value;
        if (!editorKey) return;

        this.current_config = EDITOR_CONFIG[editorKey];
        document.title = this.current_config.main_title;
        this.dom.githubFilePath.value = this.current_config.file_name;

        // Update UI Labels
        this.dom.primaryLabel.textContent = this.current_config.primary_list_label;
        this.dom.secondaryLabel.textContent = "Select an item from the left";

        // Reset data and lists
        this.data = {};
        this.current_primary_key = null;
        this.populatePrimaryList();
        this.clearSecondaryList();

        // Enable controls
        this.dom.fileLoader.disabled = false;
        this.dom.addPrimaryBtn.disabled = false;
        this.dom.commitPushBtn.disabled = false;
        this.dom.loadFromGitHubBtn.disabled = false;
        this.dom.saveFileBtn.disabled = false;

        this.setStatus("Editor selected. Load a file or fetch from GitHub.");
    }

    onPrimarySelect(event) {
        const selectedKey = this.dom.primaryList.value;
        if (!selectedKey) {
            this.current_primary_key = null;
            this.clearSecondaryList();
            this.toggleSecondaryControls(false);
            return;
        }
        
        this.current_primary_key = selectedKey;
        this.dom.secondaryLabel.textContent = `${this.current_config.secondary_list_label} ${this.current_primary_key}`;
        this.populateSecondaryList();
        this.toggleSecondaryControls(true);
        this.dom.removePrimaryBtn.disabled = false;
        this.dom.editSecondaryBtn.disabled = true; // Nothing selected yet
        this.dom.removeSecondaryBtn.disabled = true; // Nothing selected yet
    }
    
    onSecondarySelect(event) {
        if (this.dom.secondaryList.selectedIndex >= 0) {
            this.dom.editSecondaryBtn.disabled = false;
            this.dom.removeSecondaryBtn.disabled = false;
        }
    }

    toggleSecondaryControls(enabled) {
        this.dom.secondaryList.disabled = !enabled;
        this.dom.addSecondaryBtn.disabled = !enabled;
        this.dom.editSecondaryBtn.disabled = !enabled;
        this.dom.removeSecondaryBtn.disabled = !enabled;
    }

    // --- Data Loading and Saving ---

    processLoadedData(jsonData, successMessage) {
        try {
            const wrapperKey = this.current_config.data_wrapper_key;
            if (typeof jsonData !== 'object' || jsonData === null) {
                jsonData = {};
            }
            this.data = wrapperKey ? (jsonData[wrapperKey] || {}) : jsonData;
            
            this.populatePrimaryList();
            this.clearSecondaryList();
            this.setStatus(successMessage);
        } catch (err) {
            this.setStatus(`Error processing JSON: ${err.message}`, true);
            alert(`Error: Could not process the JSON data.`);
        }
    }

    loadDataFromFile(event) {
        const file = event.target.files[0];
        if (!file || !this.current_config) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                this.processLoadedData(jsonData, `File '${file.name}' loaded successfully.`);
            } catch (err) {
                if (e.target.result === "") {
                    this.processLoadedData({}, `File '${file.name}' is empty. Initialized new data.`);
                } else {
                    this.setStatus(`Error reading file: ${err.message}`, true);
                }
            }
        };
        reader.readAsText(file);
    }

    saveData() {
        if (!this.current_config) {
            alert("No editor type selected.");
            return;
        }

        const fileName = this.current_config.file_name;
        const wrapperKey = this.current_config.data_wrapper_key;
        
        try {
            const dataToSave = wrapperKey ? { [wrapperKey]: this.data } : this.data;
            const content = JSON.stringify(dataToSave, null, 2);
            const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
            
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            
            this.setStatus(`Changes saved to ${fileName}.`);
        } catch (e) {
            this.setStatus(`Failed to save file: ${e}`, true);
        }
    }

    // --- List Population ---

    populatePrimaryList() {
        const listbox = this.dom.primaryList;
        listbox.innerHTML = '';
        listbox.disabled = false;
        this.dom.removePrimaryBtn.disabled = true;

        if (Object.keys(this.data).length === 0) {
             listbox.disabled = true;
             return;
        }

        const sortedKeys = Object.keys(this.data).sort();
        sortedKeys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            listbox.appendChild(option);
        });
    }

    clearSecondaryList() {
        this.dom.secondaryList.innerHTML = '';
        this.dom.secondaryLabel.textContent = "Select an item from the left";
        this.toggleSecondaryControls(false);
    }

    populateSecondaryList() {
        const listbox = this.dom.secondaryList;
        listbox.innerHTML = '';
        this.dom.editSecondaryBtn.disabled = true;
        this.dom.removeSecondaryBtn.disabled = true;
        
        const displayKey = this.current_config.item_display_key;
        if (!this.current_primary_key || !this.data[this.current_primary_key]) return;

        this.data[this.current_primary_key].forEach((item, index) => {
            let text = item[displayKey] || "Untitled";
            if (text.length > 60) text = text.substring(0, 60) + '...';
            
            // For quizzes, add chapter info
            if (this.current_config.dialog_class_key === 'question') {
                 const chapter = item.chapter || 'General';
                 text = `[${chapter}] ${text}`;
            }
            
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${(index + 1).toString().padStart(2, '0')}: ${text.replace(/\n/g, ' ')}`;
            listbox.appendChild(option);
        });
    }

    // --- Item Manipulation ---

    addPrimaryItem() {
        const promptText = this.current_config.primary_add_prompt;
        const newKey = prompt(promptText);
        
        if (newKey) {
            if (this.data[newKey]) {
                alert("An item with that name already exists.");
            } else {
                this.data[newKey] = [];
                this.populatePrimaryList();
                this.dom.primaryList.value = newKey;
                this.onPrimarySelect();
            }
        }
    }

    removePrimaryItem() {
        if (!this.current_primary_key) {
            alert("Please select an item to remove.");
            return;
        }
        
        const deleteType = this.current_config.primary_confirm_delete;
        if (confirm(`Are you sure you want to delete the ${deleteType} '${this.current_primary_key}' and all its contents?`)) {
            delete this.data[this.current_primary_key];
            this.current_primary_key = null;
            this.populatePrimaryList();
            this.clearSecondaryList();
        }
    }

    addSecondaryItem() {
        if (!this.current_primary_key) {
            alert("Please select a primary item first.");
            return;
        }
        
        this.current_secondary_index = -1; // New item
        const itemName = this.current_config.secondary_item_name;
        this.dom.modalTitle.textContent = `Add New ${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`;
        this.buildModalForm();
        this.modal.show();
    }

    editSecondaryItem() {
        const selectedIndex = this.dom.secondaryList.value;
        if (!this.current_primary_key || selectedIndex === "") {
            alert("Please select a sub-item to edit.");
            return;
        }
        
        this.current_secondary_index = parseInt(selectedIndex);
        const itemData = this.data[this.current_primary_key][this.current_secondary_index];
        const itemName = this.current_config.secondary_item_name;
        
        this.dom.modalTitle.textContent = `Edit ${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`;
        this.buildModalForm(itemData);
        this.modal.show();
    }
    
    removeSecondaryItem() {
        const selectedIndex = this.dom.secondaryList.value;
        if (!this.current_primary_key || selectedIndex === "") {
            alert("Please select a sub-item to remove.");
            return;
        }

        const idx = parseInt(selectedIndex);
        const itemData = this.data[this.current_primary_key][idx];
        const displayKey = this.current_config.item_display_key;
        const text = (itemData[displayKey] || 'Untitled').substring(0, 50);
        
        if (confirm(`Are you sure you want to remove the item: '${text}...'?`)) {
            this.data[this.current_primary_key].splice(idx, 1);
            this.populateSecondaryList();
        }
    }

    buildModalForm(initialData = {}) {
        const dialogType = this.current_config.dialog_class_key;
        const form = this.dom.modalFormContent;
        form.innerHTML = ''; 

        switch (dialogType) {
            case 'link':
                form.innerHTML = `
                    <div class="mb-3">
                        <label for="modal-name" class="form-label">Name:</label>
                        <input type="text" class="form-control" id="modal-name" value="${initialData.name || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="modal-link" class="form-label">Link URL:</label>
                        <input type="url" class="form-control" id="modal-link" value="${initialData.link || ''}">
                    </div>
                `;
                break;
            
            case 'video':
                form.innerHTML = `
                    <div class="mb-3">
                        <label for="modal-title" class="form-label">Title:</label>
                        <input type="text" class="form-control" id="modal-title" value="${initialData.title || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="modal-link" class="form-label">Link:</label>
                        <input type="url" class="form-control" id="modal-link" value="${initialData.link || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="modal-desc" class="form-label">Description:</label>
                        <input type="text" class="form-control" id="modal-desc" value="${initialData.desc || ''}">
                    </div>
                `;
                break;

            case 'question':
                const options = initialData.options || ['', '', '', ''];
                // Logic for Image Preview
                const hasImage = initialData.image_base64 && initialData.image_base64.length > 0;
                const imagePreviewHtml = hasImage 
                    ? `<div class="mt-2"><img src="${initialData.image_base64}" style="max-height:150px; border-radius:4px; border:1px solid #ccc;"> <br> <small class="text-success">Current image loaded</small></div>` 
                    : `<div class="mt-2 text-muted"><small>No image currently set</small></div>`;

                form.innerHTML = `
                    <div class="mb-3">
                        <label for="modal-chapter" class="form-label">Chapter/Topic:</label>
                        <input type="text" class="form-control" id="modal-chapter" value="${initialData.chapter || ''}" placeholder="e.g., Chapter 1">
                    </div>
                    <div class="mb-3">
                        <label for="modal-question" class="form-label">Question:</label>
                        <textarea class="form-control" id="modal-question" rows="2">${initialData.question || ''}</textarea>
                    </div>
                    
                    <div class="mb-3 p-2 border border-secondary rounded bg-dark-subtle">
                        <label for="modal-image-input" class="form-label">Question Image (Optional):</label>
                        <input type="file" class="form-control" id="modal-image-input" accept="image/*">
                        <div class="form-text text-info">Images will be automatically compressed (Max width 800px).</div>
                        <input type="hidden" id="modal-existing-image" value="${initialData.image_base64 || ''}">
                        <div id="modal-image-preview-container">
                            ${imagePreviewHtml}
                        </div>
                        <div class="form-check mt-2">
                            <input class="form-check-input" type="checkbox" id="modal-remove-image">
                            <label class="form-check-label text-danger" for="modal-remove-image">
                                Remove existing image on save
                            </label>
                        </div>
                    </div>
                    
                    ${options.map((opt, i) => `
                    <div class="mb-3">
                        <label for="modal-option-${i}" class="form-label">Option ${i}:</label>
                        <input type="text" class="form-control" id="modal-option-${i}" value="${opt}">
                    </div>
                    `).join('')}
                    
                    <div class="row">
                        <div class="col-md-6">
                            <label for="modal-answer" class="form-label">Correct Answer Index (0-3):</label>
                            <input type="number" class="form-control" id="modal-answer" min="0" max="3" value="${initialData.answer_index || 0}">
                        </div>
                    </div>
                    <div class="mb-3 mt-3">
                        <label for="modal-explanation" class="form-label">Explanation:</label>
                        <textarea class="form-control" id="modal-explanation" rows="2">${initialData.explanation || ''}</textarea>
                    </div>
                `;
                break;

            case 'book':
                form.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">Book Title:</label>
                        <input type="text" class="form-control" id="modal-book-title" value="${initialData.title || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Author(s):</label>
                        <input type="text" class="form-control" id="modal-book-author" value="${initialData.author || ''}">
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Published Year:</label>
                            <input type="number" class="form-control" id="modal-book-year" value="${initialData.publishedYear || ''}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Page Count:</label>
                            <input type="number" class="form-control" id="modal-book-pages" value="${initialData.pages || ''}">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description:</label>
                        <textarea class="form-control" id="modal-book-desc" rows="3">${initialData.description || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Download/View Link (Google Drive):</label>
                        <input type="url" class="form-control" id="modal-book-link" value="${initialData.downloadLink || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Cover Image Path (e.g., images/book1.jpg):</label>
                        <input type="text" class="form-control" id="modal-book-cover" value="${initialData.cover || ''}">
                    </div>
                `;
                break;
        }
    }

    async onModalSave() {
        const dialogType = this.current_config.dialog_class_key;
        let newItemData = {};

        try {
            switch (dialogType) {
                case 'link':
                    newItemData = {
                        name: document.getElementById('modal-name').value,
                        link: document.getElementById('modal-link').value
                    };
                    break;
                
                case 'video':
                    newItemData = {
                        title: document.getElementById('modal-title').value,
                        link: document.getElementById('modal-link').value,
                        desc: document.getElementById('modal-desc').value
                    };
                    break;

                case 'question':
                    const q = document.getElementById('modal-question').value.trim();
                    if (!q) {
                        alert("Question text cannot be empty.");
                        return;
                    }
                    const answerIndex = parseInt(document.getElementById('modal-answer').value);
                    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
                        alert("Answer Index must be a number between 0 and 3.");
                        return;
                    }

                    // Handle Image Logic
                    let finalImageBase64 = document.getElementById('modal-existing-image').value;
                    const fileInput = document.getElementById('modal-image-input');
                    const removeImage = document.getElementById('modal-remove-image').checked;

                    if (removeImage) {
                        finalImageBase64 = ""; // Clear it
                    } else if (fileInput.files.length > 0) {
                        try {
                            // Max width 800px, Quality 70%
                            finalImageBase64 = await this.compressImage(fileInput.files[0], 800, 0.7);
                        } catch (err) {
                            alert("Failed to process image.");
                            return;
                        }
                    }

                    newItemData = {
                        chapter: document.getElementById('modal-chapter').value.trim() || 'General',
                        question: q,
                        image_base64: finalImageBase64,
                        options: [
                            document.getElementById('modal-option-0').value,
                            document.getElementById('modal-option-1').value,
                            document.getElementById('modal-option-2').value,
                            document.getElementById('modal-option-3').value
                        ],
                        answer_index: answerIndex,
                        explanation: document.getElementById('modal-explanation').value.trim()
                    };
                    break;
                
                case 'book':
                    newItemData = {
                        id: Date.now(), 
                        title: document.getElementById('modal-book-title').value,
                        author: document.getElementById('modal-book-author').value,
                        publishedYear: parseInt(document.getElementById('modal-book-year').value) || 0,
                        pages: parseInt(document.getElementById('modal-book-pages').value) || 0,
                        description: document.getElementById('modal-book-desc').value,
                        downloadLink: document.getElementById('modal-book-link').value,
                        cover: document.getElementById('modal-book-cover').value,
                        language: "English",
                        category: this.current_primary_key // implicitly part of category logic
                    };
                    break;
            }
        } catch (e) {
            alert(`Error reading form data: ${e.message}`);
            return;
        }

        if (this.current_secondary_index === -1) {
            this.data[this.current_primary_key].push(newItemData);
        } else {
            this.data[this.current_primary_key][this.current_secondary_index] = newItemData;
        }

        this.modal.hide();
        this.populateSecondaryList();
        if (this.current_secondary_index !== -1) {
            this.dom.secondaryList.selectedIndex = this.current_secondary_index;
            this.onSecondarySelect();
        }
    }

    // --- GitHub Integration (Unchanged) ---
    async loadFromGitHub() {
        if (!this.current_config) { alert("Please select an editor type first."); return; }
        const token = this.dom.githubToken.value;
        const user = this.dom.githubUser.value;
        const repo = this.dom.githubRepo.value;
        const filepath = this.dom.githubFilePath.value;
        if (!user || !repo || !filepath) { alert("GitHub Username, Repo Name, and File Path are required to load."); return; }
        this.setStatus("Loading file from GitHub...");
        const API_URL = `https://api.github.com/repos/${user}/${repo}/contents/${filepath}`;
        const headers = { 'Accept': 'application/vnd.github.v3+json', 'X-GitHub-Api-Version': '2022-11-28' };
        if (token) { headers['Authorization'] = `token ${token}`; }

        try {
            const response = await fetch(API_URL, { method: 'GET', headers });
            if (!response.ok) {
                if (response.status === 404) {
                     alert("File not found on GitHub. Initialized empty data.");
                     this.processLoadedData({}, "File not found. Initialized empty data.");
                } else { throw new Error(`Failed to get file: ${response.statusText}`); }
                return;
            }
            const fileData = await response.json();
            const binaryString = atob(fileData.content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
            const decodedContent = new TextDecoder().decode(bytes);
            const jsonData = JSON.parse(decodedContent);
            this.processLoadedData(jsonData, `Successfully loaded ${filepath} from GitHub.`);
        } catch (e) {
            this.setStatus(`GitHub Load Error: ${e.message}`, true);
            alert(`An error occurred while loading from GitHub: ${e.message}`);
        }
    }

    async commitAndPush(event) {
        event.preventDefault();
        if (!this.current_config) { alert("Please select an editor type first."); return; }
        const token = this.dom.githubToken.value;
        const user = this.dom.githubUser.value;
        const repo = this.dom.githubRepo.value;
        const filepath = this.dom.githubFilePath.value;
        if (!token || !user || !repo || !filepath) { alert("All GitHub fields (including Token) are required to push."); return; }
        
        this.setStatus("Saving and preparing data...");
        const wrapperKey = this.current_config.data_wrapper_key;
        const dataToSave = wrapperKey ? { [wrapperKey]: this.data } : this.data;
        const content = JSON.stringify(dataToSave, null, 2);
        
        // UTF-8 to Base64 encoding
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        const API_URL = `https://api.github.com/repos/${user}/${repo}/contents/${filepath}`;
        const headers = { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'X-GitHub-Api-Version': '2022-11-28' };

        try {
            this.setStatus("Fetching current file SHA...");
            let currentSha = null;
            try {
                const getResponse = await fetch(API_URL, { method: 'GET', headers });
                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    currentSha = fileData.sha;
                }
            } catch (e) { console.warn("Could not fetch file SHA, proceeding to create.", e.message); }

            const body = { message: `Update ${filepath} via web editor`, content: encodedContent, sha: currentSha };
            if (!currentSha) { delete body.sha; }

            const putResponse = await fetch(API_URL, { method: 'PUT', headers, body: JSON.stringify(body) });
            if (!putResponse.ok) {
                const errorData = await putResponse.json();
                throw new Error(`Push failed: ${putResponse.statusText} - ${errorData.message}`);
            }
            this.setStatus("Successfully pushed to GitHub!");
            alert("Changes have been successfully pushed to GitHub.");
        } catch (e) {
            this.setStatus(`GitHub Error: ${e.message}`, true);
            alert(`An error occurred: ${e.message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new UnifiedEditorApp(); });