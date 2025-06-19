document.addEventListener('DOMContentLoaded', () => {
    // --- CONTEÚDO PARA OS MODAIS ---
    const modalContentData = {
        'matrix_explainer': {
            title: 'A Imagem como uma Matriz',
            content: `
                <p>Imagine que a tela do seu computador é um papel quadriculado gigante. Cada pequeno quadrado nesse papel é um <strong>pixel</strong>.</p>
                <p>Para uma imagem em tons de cinza, o computador atribui um único número a cada pixel, representando sua intensidade: <strong>0</strong> é totalmente preto, <strong>255</strong> é totalmente branco, e os valores no meio são os tons de cinza.</p>
                <p>Quando organizamos esses números na mesma grade da imagem, o que temos é uma <strong>Matriz</strong>! Uma imagem de 92 pixels de largura por 112 de altura se torna uma matriz com 112 linhas e 92 colunas. É assim que o computador "vê" e armazena a imagem: como um grande bloco de números.</p>
            `
        },
        'vector_explainer': {
            title: 'Um Ponto no Espaço Dimensional',
            content: `
                <p>Essa é uma das ideias mais poderosas da Álgebra Linear aplicada! Vamos por partes:</p>
                <p>Para localizar um ponto em um gráfico 2D, você precisa de um vetor com 2 coordenadas: <code>[x, y]</code>.</p>
                <p>Para um ponto em um espaço 3D, você precisa de um vetor com 3 coordenadas: <code>[x, y, z]</code>.</p>
                <p>O padrão é claro: <strong>o número de coordenadas em um vetor define o número de dimensões do espaço.</strong></p>
                <p>Nossa imagem de rosto, após ser "desenrolada" em um vetor, tem <strong>10.304</strong> valores (92 x 112). Isso significa que cada rosto é um único ponto em um espaço abstrato de <strong>10.304 dimensões</strong>! Nós não conseguimos visualizar isso, mas o computador pode calcular coisas nesse espaço, como a <strong>distância</strong> entre dois pontos-rosto para ver o quão parecidos eles são.</p>
            `
        }
    };

    // --- REFERÊNCIAS AOS ELEMENTOS DO MODAL ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- FUNÇÕES PARA ABRIR E FECHAR O MODAL ---
    function openModal(id) {
        const data = modalContentData[id];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalContent.innerHTML = data.content;
        
        modalOverlay.classList.remove('modal-hidden');
        document.body.style.overflow = 'hidden'; // Impede o scroll do fundo
    }

    function closeModal() {
        modalOverlay.classList.add('modal-hidden');
        document.body.style.overflow = 'auto'; // Libera o scroll
    }

    // --- EVENT LISTENERS PARA O MODAL ---
    // 1. Abrir o modal ao clicar nos botões "Saiba Mais"
    document.querySelectorAll('[data-modal-id]').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-id');
            openModal(modalId);
        });
    });

    // 2. Fechar o modal
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => {
        // Fecha só se clicar no fundo (overlay), não no card
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
    window.addEventListener('keydown', (event) => {
        // Fecha com a tecla 'Escape'
        if (event.key === 'Escape' && !modalOverlay.classList.contains('modal-hidden')) {
            closeModal();
        }
    });

    // ===================================================================
    // O RESTANTE DO CÓDIGO DO SITE (sem alterações)
    // ===================================================================

    // --- Variáveis Globais e Referências de Elementos ---
    let recognitionData = null;
    let userImageVector = null;
    const uploadButton = document.getElementById('upload-button');
    const uploadInput = document.getElementById('upload-input');
    const fileNameSpan = document.getElementById('file-name');
    const step1Viz = document.getElementById('step-1-visualization');
    const resultsArea = document.getElementById('results-area');
    const matrixGrid = document.getElementById('matrix-grid');
    const animationGrid = document.getElementById('vector-animation-grid');
    const toggleAnimationBtn = document.getElementById('toggle-animation-btn');
    const userCanvas = document.getElementById('user-canvas');
    const meanFaceCanvas = document.getElementById('mean-face-canvas');
    const eigenfaceCanvas = document.getElementById('eigenface-canvas');
    const reconstructionCanvas = document.getElementById('reconstruction-canvas');
    const matchImage = document.getElementById('match-image');
    const matchLabel = document.getElementById('match-label');
    const matchDistance = document.getElementById('match-distance');

    uploadButton.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', handleFileUpload);
    toggleAnimationBtn.addEventListener('click', toggleVectorAnimation);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file || !recognitionData) return;
        fileNameSpan.textContent = file.name;
        resultsArea.classList.add('hidden');
        processUploadedImage(file).then(vector => {
            userImageVector = vector;
            drawVectorToCanvas(userImageVector, userCanvas);
            step1Viz.classList.remove('hidden');
            setupAnimationGrid();
            runRecognition(userImageVector);
        });
    }

    function setupAnimationGrid() {
        animationGrid.innerHTML = '';
        animationGrid.classList.remove('is-vector');
        toggleAnimationBtn.textContent = 'Transformar em Vetor';
        for (let i = 0; i < 36; i++) {
            const cell = document.createElement('div');
            cell.className = 'anim-cell';
            cell.style.backgroundColor = `hsl(${Math.floor(i / 6) * 60}, 60%, 70%)`;
            animationGrid.appendChild(cell);
        }
    }

    function toggleVectorAnimation() {
        const isNowVector = animationGrid.classList.toggle('is-vector');
        toggleAnimationBtn.textContent = isNowVector ? 'Voltar para Matriz' : 'Transformar em Vetor';
    }

    userCanvas.addEventListener('mousemove', (e) => {
        if (!userImageVector) return;
        const { width, height } = recognitionData.image_size;
        const rect = userCanvas.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        const x = Math.floor(e.offsetX * scaleX);
        const y = Math.floor(e.offsetY * scaleY);
        visualizeMatrixSnippet(x, y, 5);
    });

    userCanvas.addEventListener('mouseleave', () => { matrixGrid.innerHTML = ''; });
    function visualizeMatrixSnippet(centerX, centerY, size) {
        const { width } = recognitionData.image_size;
        const halfSize = Math.floor(size / 2);
        matrixGrid.innerHTML = '';
        matrixGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        for (let i = -halfSize; i <= halfSize; i++) {
            for (let j = -halfSize; j <= halfSize; j++) {
                const y = centerY + i;
                const x = centerX + j;
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                const index = y * width + x;
                if (y >= 0 && y < recognitionData.image_size.height && x >= 0 && x < width) {
                    cell.textContent = Math.round(userImageVector[index]);
                } else {
                    cell.textContent = '-';
                }
                if (i === 0 && j === 0) {
                    cell.style.backgroundColor = 'var(--accent-color)';
                    cell.style.color = 'white';
                    cell.style.fontWeight = 'bold';
                }
                matrixGrid.appendChild(cell);
            }
        }
    }

    function drawVectorToCanvas(vector, canvas) {
        if (!recognitionData) return;
        const { width, height } = recognitionData.image_size;
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        for (let i = 0; i < vector.length; i++) {
            const val = Math.max(0, Math.min(255, vector[i]));
            imageData.data[i * 4 + 0] = val; imageData.data[i * 4 + 1] = val;
            imageData.data[i * 4 + 2] = val; imageData.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
    }
    
    async function processUploadedImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const { width, height } = recognitionData.image_size;
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = width; tempCanvas.height = height;
                    const ctx = tempCanvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const imageData = ctx.getImageData(0, 0, width, height);
                    const vector = new Array(width * height);
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        const grayscale = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
                        vector[i/4] = grayscale;
                    }
                    resolve(vector);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async function loadRecognitionData() {
        try {
            const response = await fetch('recognition_data.json');
            recognitionData = await response.json();
            console.log("Dados de reconhecimento carregados!");
            drawVectorToCanvas(recognitionData.mean_face, meanFaceCanvas);
            drawVectorToCanvas(recognitionData.eigenfaces[0], eigenfaceCanvas);
        } catch (error) {
            console.error("Erro ao carregar dados de reconhecimento:", error);
            alert("Não foi possível carregar os dados. Verifique o console para mais detalhes.");
        }
    }

    function runRecognition(userVector) {
        const centeredUserVector = math.subtract(userVector, recognitionData.mean_face);
        const userWeights = math.multiply(centeredUserVector, math.transpose(recognitionData.eigenfaces));
        const reconstruction = math.add(math.multiply(userWeights, recognitionData.eigenfaces), recognitionData.mean_face);
        drawVectorToCanvas(reconstruction, reconstructionCanvas);
        let bestMatchIndex = -1;
        let minDistance = Infinity;
        recognitionData.weights.forEach((dbWeights, index) => {
            const distance = math.distance(userWeights, dbWeights);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatchIndex = index;
            }
        });
        const matchedFilepath = recognitionData.filepaths[bestMatchIndex];
        const matchedLabel = recognitionData.labels[bestMatchIndex];
        matchImage.src = `database/${matchedFilepath}`;
        matchLabel.textContent = `Identificado como: Sujeito ${matchedLabel.replace('s', '')}`;
        matchDistance.textContent = `Pontuação (Distância): ${minDistance.toFixed(2)} (menor é melhor)`;
        resultsArea.classList.remove('hidden');
    }

    loadRecognitionData();
});