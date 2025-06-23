const showFacesBtn = document.getElementById('showFacesBtn');
const calculateMeanBtn = document.getElementById('calculateMeanBtn');
const centerDataBtn = document.getElementById('centerDataBtn');
const facesGrid = document.getElementById('facesGrid');
const meanFaceCanvas = document.getElementById('meanFaceCanvas');
const meanMatrixPreview = document.getElementById('meanMatrixPreview');
const centeredFacesGrid = document.getElementById('centeredFacesGrid');

// Variáveis de estado
let meanFace = null;
let centeredFaces = [];
const previewSize = 5; // Tamanho da pré-visualização da matriz

// Inicialização
function initPCASection() {
    // Configurar canvas
    meanFaceCanvas.width = recognitionData.image_size.width;
    meanFaceCanvas.height = recognitionData.image_size.height;
    
    // Event listeners
    showFacesBtn.addEventListener('click', showDatabaseFaces);
    calculateMeanBtn.addEventListener('click', calculateMeanFace);
    centerDataBtn.addEventListener('click', showCenteredFaces);
}

// Mostrar rostos do banco de dados
function showDatabaseFaces() {
    facesGrid.innerHTML = '';
    
    // Mostrar apenas os primeiros 6 rostos para demonstração
    const facesToShow = recognitionData.filepaths.slice(0, 6);
    
    facesToShow.forEach((filepath, index) => {
        const faceContainer = document.createElement('div');
        faceContainer.className = 'face-container';
        
        const canvas = document.createElement('canvas');
        canvas.className = 'face-canvas';
        canvas.width = recognitionData.image_size.width;
        canvas.height = recognitionData.image_size.height;
        
        const label = document.createElement('div');
        label.className = 'face-label';
        label.textContent = `Rosto ${index + 1}`;
        
        faceContainer.appendChild(canvas);
        faceContainer.appendChild(label);
        facesGrid.appendChild(faceContainer);
        
        // Carregar e desenhar a face
        loadAndDrawFace(filepath, canvas);
    });
    
    showFacesBtn.disabled = true;
    calculateMeanBtn.disabled = false;
}

// Carregar e desenhar uma face do banco de dados
function loadAndDrawFace(filepath, canvas) {
    const img = new Image();
    img.onload = function() {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = `database_png/${filepath}`;
}

// Calcular o rosto médio
function calculateMeanFace() {
    // Usar o rosto médio pré-calculado do JSON
    meanFace = recognitionData.mean_face;
    
    // Desenhar o rosto médio
    drawFace(meanFace, meanFaceCanvas);
    
    // Mostrar pré-visualização da matriz
    showMatrixPreview(meanFace, meanMatrixPreview, 'Rosto Médio (5x5)');
    
    calculateMeanBtn.disabled = true;
    centerDataBtn.disabled = false;
}

// Mostrar rostos centralizados
function showCenteredFaces() {
    centeredFacesGrid.innerHTML = '';
    
    // Centralizar os primeiros 6 rostos
    const facesToCenter = recognitionData.filepaths.slice(0, 6);
    
    facesToCenter.forEach((filepath, index) => {
        const faceContainer = document.createElement('div');
        faceContainer.className = 'face-container';
        
        const canvas = document.createElement('canvas');
        canvas.className = 'face-canvas';
        canvas.width = recognitionData.image_size.width;
        canvas.height = recognitionData.image_size.height;
        
        const label = document.createElement('div');
        label.className = 'face-label';
        label.textContent = `Diferença ${index + 1}`;
        
        faceContainer.appendChild(canvas);
        faceContainer.appendChild(label);
        centeredFacesGrid.appendChild(faceContainer);
        
        // Carregar a face e calcular a diferença
        loadAndCenterFace(filepath, canvas);
    });
    
    centerDataBtn.disabled = true;
}

// Carregar e centralizar uma face
function loadAndCenterFace(filepath, canvas) {
    const img = new Image();
    img.onload = function() {
        // Obter dados de pixel da imagem
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Calcular a diferença com o rosto médio
        const centeredFace = new Array(imageData.data.length / 4);
        for (let i = 0; i < centeredFace.length; i++) {
            const pixelValue = (imageData.data[i*4] + imageData.data[i*4+1] + imageData.data[i*4+2]) / 3;
            centeredFace[i] = pixelValue - meanFace[i] + 128; // Adicionar 128 para visualização
        }
        
        // Desenhar a diferença
        drawFace(centeredFace, canvas);
    };
    img.src = `database_png/${filepath}`;
}

// Função auxiliar para desenhar um rosto a partir de um vetor
function drawFace(faceVector, canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    
    for (let i = 0; i < faceVector.length; i++) {
        const val = Math.max(0, Math.min(255, faceVector[i]));
        imageData.data[i*4] = val;     // R
        imageData.data[i*4+1] = val;   // G
        imageData.data[i*4+2] = val;   // B
        imageData.data[i*4+3] = 255;   // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Mostrar pré-visualização da matriz
function showMatrixPreview(faceVector, container, title) {
    container.innerHTML = '';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'matrix-preview-title';
    titleElement.textContent = title;
    container.appendChild(titleElement);
    
    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    
    // Mostrar apenas uma parte da matriz (5x5)
    for (let i = 0; i < previewSize; i++) {
        for (let j = 0; j < previewSize; j++) {
            const idx = i * recognitionData.image_size.width + j;
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.textContent = Math.round(faceVector[idx]);
            grid.appendChild(cell);
        }
    }
    
    container.appendChild(grid);
}

// Inicializar quando os dados estiverem prontos
if (typeof recognitionData !== 'undefined') {
    initPCASection();
} else {
    document.addEventListener('recognitionDataLoaded', initPCASection);
}