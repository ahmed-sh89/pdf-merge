const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const dropZone = document.getElementById('drop-zone');
const previewFrame = document.getElementById('preview-frame');
const downloadLink = document.getElementById('download-link');
const sortButton = document.getElementById('sort-button');

let filesArray = [];
let ascendingOrder = true; // حالة الترتيب

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = '#00cec9';
});
dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = '#6c5ce7');
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = '#6c5ce7';
  handleFiles(e.dataTransfer.files);
});

// تبديل حالة الترتيب
function toggleSortOrder() {
  ascendingOrder = !ascendingOrder;
  sortButton.textContent = ascendingOrder ? '🔄 ترتيب: من A إلى Z' : '🔄 ترتيب: من Z إلى A';
  sortFiles();
}

// ترتيب الملفات
function sortFiles() {
  filesArray.sort((a, b) => {
    return ascendingOrder
      ? a.name.localeCompare(b.name, 'ar', { sensitivity: 'base' })
      : b.name.localeCompare(a.name, 'ar', { sensitivity: 'base' });
  });
  renderFileList();
}

function handleFiles(files) {
  filesArray.push(...files);
  renderFileList();
}

function renderFileList() {
  fileList.innerHTML = '';
  filesArray.forEach((file, index) => {
    const li = document.createElement('li');
    li.className = 'file-item';
    li.innerHTML = `
      ${file.name}
      <div class="buttons">
        <button onclick="previewFile(${index})">👁️ معاينة</button>
        <button onclick="removeFile(${index})">❌ إزالة</button>
      </div>
    `;
    fileList.appendChild(li);
  });
}

function previewFile(index) {
  const fileURL = URL.createObjectURL(filesArray[index]);
  previewFrame.src = fileURL;
  previewFrame.style.display = 'block';
}

function removeFile(index) {
  filesArray.splice(index, 1);
  renderFileList();
}

async function mergePDFs() {
  try {
    if (filesArray.length < 2) return alert('الرجاء تحميل ملفين على الأقل.');
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (const file of filesArray) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }
    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.style.display = 'block';
    downloadLink.textContent = '📥 تنزيل الملف المدموج';
    previewFrame.src = url;
    previewFrame.style.display = 'block';
  } catch (error) {
    alert('❌ حدث خطأ أثناء دمج الملفات: ' + error.message);
  }
}
