document.addEventListener('DOMContentLoaded', () => {
    // --- CONTEÚDO DOS MODAIS (Sem alterações) ---
    const modalContentData = {
        'matrix_explainer': {
            title: 'A Imagem como uma Matriz',
            content: `<p>Imagine que a tela do seu computador é um papel quadriculado gigante. Cada pequeno quadrado nesse papel é um <strong>pixel</strong>.</p><p>Para uma imagem em tons de cinza, o computador atribui um único número a cada pixel, representando sua intensidade: <strong>0</strong> é totalmente preto, <strong>255</strong> é totalmente branco, e os valores no meio são os tons de cinza.</p><p>Quando organizamos esses números na mesma grade da imagem, o que temos é uma <strong>Matriz</strong>! Uma imagem de 92 pixels de largura por 112 de altura se torna uma matriz com 112 linhas e 92 colunas. É assim que o computador "vê" e armazena a imagem: como um grande bloco de números.</p>`
        },
        'vector_explainer': {
            title: 'Um Ponto no Espaço Dimensional',
            content: `<p>Essa é uma das ideias mais poderosas da Álgebra Linear aplicada! Vamos por partes:</p><p>Para localizar um ponto em um gráfico 2D, você precisa de um vetor com 2 coordenadas: <code>[x, y]</code>.</p><p>Para um ponto em um espaço 3D, você precisa de um vetor com 3 coordenadas: <code>[x, y, z]</code>.</p><p>O padrão é claro: <strong>o número de coordenadas em um vetor define o número de dimensões do espaço.</strong></p><p>Nossa imagem de rosto, após ser "desenrolada" em um vetor, tem <strong>10.304</strong> valores (92 x 112). Isso significa que cada rosto é um único ponto em um espaço abstrato de <strong>10.304 dimensões</strong>! Nós não conseguimos visualizar isso, mas o computador pode calcular coisas nesse espaço, como a <strong>distância</strong> entre dois pontos-rosto para ver o quão parecidos eles são.</p>`
        },
        'covariance_explainer': {
            title: 'A Intuição da Matriz de Covariância',
            content: `<p>Imagine que você tem dados de altura e peso de várias pessoas. Você notaria que, em geral, pessoas mais altas tendem a ser mais pesadas. A <strong>covariância</strong> é um número que mede exatamente essa tendência de duas variáveis "andarem juntas".</p>
                      <ul>
                        <li><strong>Covariância positiva:</strong> Quando uma sobe, a outra também tende a subir (ex: altura e peso).</li>
                        <li><strong>Covariância negativa:</strong> Quando uma sobe, a outra tende a descer (ex: horas de estudo vs. horas de videogame).</li>
                        <li><strong>Covariância perto de zero:</strong> Não há uma tendência clara entre as duas.</li>
                      </ul>
                      <p>A <strong>Matriz de Covariância</strong> faz isso para todas as combinações de pixels. A entrada na linha 'i' e coluna 'j' da matriz nos diz como o pixel 'i' covaria com o pixel 'j' em todo o nosso banco de dados de rostos. É um mapa completo das relações entre todos os pixels.</p>`
        },
        'eigen_explainer': {
            title: 'O que é um Autovetor (Eigenvector)?',
            content: `<p>Imagine que uma matriz é uma "transformação" que estica, encolhe ou rotaciona o espaço. Por exemplo, ela pode pegar todos os vetores de um círculo e transformá-los em uma elipse.</p>
                      <p>Dentro dessa transformação, quase todos os vetores mudam de direção. No entanto, existem alguns vetores especiais que <strong>não mudam sua direção original</strong>, eles apenas são "esticados" ou "encolhidos".</p>
                      <p>Esses vetores que mantêm sua direção são os <strong>Autovetores</strong> da matriz.</p>
                      <p>O fator pelo qual eles são esticados ou encolhidos é o <strong>Autovalor</strong> correspondente. Um autovalor grande significa que aquela direção é muito "esticada" pela transformação, ou seja, é uma direção de grande importância ou variação.</p>
                      <p>No PCA, os autovetores da matriz de covariância apontam para as direções de maior "esticamento" dos dados, que são exatamente as direções de maior variação que queremos encontrar!</p>`
        }
    };
    
    // --- LÓGICA DO MODAL (Sem alterações) ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function openModal(id) {
        const data = modalContentData[id];
        if (!data) return;
        modalTitle.textContent = data.title;
        modalContent.innerHTML = data.content;
        modalOverlay.classList.remove('modal-hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.add('modal-hidden');
        document.body.style.overflow = 'auto';
    }

    document.querySelectorAll('[data-modal-id]').forEach(button => {
        button.addEventListener('click', () => { openModal(button.getAttribute('data-modal-id')); });
    });
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => { if (event.target === modalOverlay) closeModal(); });
    window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modalOverlay.classList.contains('modal-hidden')) closeModal(); });

    // --- REFERÊNCIAS GERAIS ---
    const originalForComparisonCanvas = document.getElementById('original-for-comparison-canvas');
    const eigenfaceSlider = document.getElementById('eigenface-slider');
    const sliderValue = document.getElementById('slider-value');
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
    const reconstructionCanvas = document.getElementById('reconstruction-canvas');
    const matchImage = document.getElementById('match-image');
    const matchLabel = document.getElementById('match-label');
    const matchDistance = document.getElementById('match-distance');
    
    // --- REFERÊNCIAS DA SEÇÃO 3 ---
    const showFacesBtn = document.getElementById('showFacesBtn');
    const calculateMeanBtn = document.getElementById('calculateMeanBtn');
    const centerDataBtn = document.getElementById('centerDataBtn');
    const facesGrid = document.getElementById('facesGrid');
    const meanFaceCanvas = document.getElementById('meanFaceCanvas');
    const centeredFacesGrid = document.getElementById('centeredFacesGrid');

    // --- LÓGICA PRINCIPAL DO SITE ---
    uploadButton.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', handleFileUpload);
    toggleAnimationBtn.addEventListener('click', toggleVectorAnimation);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file || !recognitionData) {
            alert("Aguarde, os dados de reconhecimento ainda não foram carregados.");
            return;
        }
        fileNameSpan.textContent = file.name;
        resultsArea.classList.remove('hidden'); // Mostra o resto do site
        
        processUploadedImage(file).then(vector => {
            userImageVector = vector;
            drawVectorToCanvas(userImageVector, userCanvas);
            step1Viz.classList.remove('hidden'); // Mostra a visualização do passo 1
            
            // Inicia as outras visualizações
            setupAnimationGrid();
            runRecognition(userImageVector);
        });
    }

    // --- FUNÇÕES DA SEÇÃO 2 (Animação) ---
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

    // --- FUNÇÕES DA SEÇÃO 3 (PCA INTERATIVO) ---
    function initPCASection() {
        if (!recognitionData) return;
        showFacesBtn.addEventListener('click', showDatabaseFaces);
        calculateMeanBtn.addEventListener('click', calculateAndDrawMeanFace);
        centerDataBtn.addEventListener('click', showCenteredFaces);
    }

    function showDatabaseFaces() {
        facesGrid.innerHTML = '';
        const facesToShow = recognitionData.filepaths.slice(0, 6);
        
        facesToShow.forEach((filepath, index) => {
            const faceContainer = document.createElement('div');
            faceContainer.className = 'face-container';
            const canvas = document.createElement('canvas');
            canvas.className = 'face-canvas';
            const label = document.createElement('div');
            label.className = 'face-label';
            label.textContent = `Rosto ${index + 1}`;
            
            faceContainer.appendChild(canvas);
            faceContainer.appendChild(label);
            facesGrid.appendChild(faceContainer);
            
            loadAndDrawFace(filepath, canvas);
        });
        
        showFacesBtn.disabled = true;
        calculateMeanBtn.disabled = false;
    }

    function loadAndDrawFace(filepath, canvas) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            canvas.width = recognitionData.image_size.width;
            canvas.height = recognitionData.image_size.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = `database_png/${filepath}`;
    }
    
    function calculateAndDrawMeanFace() {
        const meanFaceVector = recognitionData.mean_face;
        drawVectorToCanvas(meanFaceVector, meanFaceCanvas);
        calculateMeanBtn.disabled = true;
        centerDataBtn.disabled = false;
    }

    function showCenteredFaces() {
        centeredFacesGrid.innerHTML = '';
        const facesToCenterPaths = recognitionData.filepaths.slice(0, 6);
        const meanFaceVector = recognitionData.mean_face;

        facesToCenterPaths.forEach((filepath, index) => {
            const faceContainer = document.createElement('div');
            faceContainer.className = 'face-container';
            const canvas = document.createElement('canvas');
            canvas.className = 'face-canvas';
            const label = document.createElement('div');
            label.className = 'face-label';
            label.textContent = `Diferença ${index + 1}`;
            
            faceContainer.appendChild(canvas);
            faceContainer.appendChild(label);
            centeredFacesGrid.appendChild(faceContainer);
            
            // Carregar a imagem, depois calcular e desenhar a diferença
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = recognitionData.image_size.width;
                tempCanvas.height = recognitionData.image_size.height;
                tempCtx.drawImage(img, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                
                const centeredFaceVector = new Array(imageData.data.length / 4);
                for (let i = 0; i < centeredFaceVector.length; i++) {
                    const pixelValue = (imageData.data[i*4] + imageData.data[i*4+1] + imageData.data[i*4+2]) / 3;
                    // Adiciona 128 para que as diferenças (que podem ser negativas) fiquem visíveis
                    centeredFaceVector[i] = pixelValue - meanFaceVector[i] + 128; 
                }
                drawVectorToCanvas(centeredFaceVector, canvas);
            };
            img.src = `database_png/${filepath}`;
        });
        centerDataBtn.disabled = true;
    }

    // --- FUNÇÕES GERAIS E DE RECONHECIMENTO ---
    userCanvas.addEventListener('mousemove', (e) => {
        if (!userImageVector) return;
        const { width, height } = recognitionData.image_size;
        const rect = userCanvas.getBoundingClientRect();
        const scaleX = width / rect.width, scaleY = height / rect.height;
        const x = Math.floor(e.offsetX * scaleX), y = Math.floor(e.offsetY * scaleY);
        visualizeMatrixSnippet(x, y, 5);
    });
    userCanvas.addEventListener('mouseleave', () => { matrixGrid.innerHTML = ''; });
    
    function visualizeMatrixSnippet(centerX, centerY, size) {
        const { width } = recognitionData.image_size;
        const halfSize = Math.floor(size / 2);
        matrixGrid.innerHTML = ''; matrixGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        for (let i = -halfSize; i <= halfSize; i++) {
            for (let j = -halfSize; j <= halfSize; j++) {
                const y = centerY + i, x = centerX + j, cell = document.createElement('div');
                cell.className = 'matrix-cell';
                const index = y * width + x;
                if (y >= 0 && y < recognitionData.image_size.height && x >= 0 && x < width) {
                    cell.textContent = Math.round(userImageVector[index]);
                } else { cell.textContent = '-'; }
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
        if (!recognitionData || !canvas) return;
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
            // Após carregar, inicializa a seção 3
            initPCASection(); 
        } catch (error) {
            console.error("Erro ao carregar dados de reconhecimento:", error);
            alert("Não foi possível carregar os dados. Verifique o console para mais detalhes.");
        }
    }
    
    function runRecognition(userVector) {
    // Desenha a imagem original do usuário no novo canvas para comparação
    drawVectorToCanvas(userVector, originalForComparisonCanvas);

    // Calcula os pesos (a "receita") do rosto do usuário
    const centeredUserVector = math.subtract(userVector, recognitionData.mean_face);
    const userWeights = math.multiply(centeredUserVector, math.transpose(recognitionData.eigenfaces));

    // --- LÓGICA DO SLIDER ---
    // Define o valor máximo do slider com base no número de eigenfaces disponíveis
    eigenfaceSlider.max = recognitionData.eigenfaces.length;
    // Reseta o slider para o valor inicial
    eigenfaceSlider.value = recognitionData.eigenfaces.length; 
    sliderValue.textContent = eigenfaceSlider.value;

    // Função que será chamada sempre que o slider mudar
    const updateReconstruction = () => {
        const numComponents = parseInt(eigenfaceSlider.value, 10);
        sliderValue.textContent = numComponents;

        // Pega apenas os primeiros 'numComponents' pesos e eigenfaces
        const weightsToUse = userWeights.slice(0, numComponents);
        const eigenfacesToUse = recognitionData.eigenfaces.slice(0, numComponents);
        
        // Reconstrói a imagem usando apenas os componentes selecionados
        const partialReconstruction = math.add(
            math.multiply(weightsToUse, eigenfacesToUse),
            recognitionData.mean_face
        );
        drawVectorToCanvas(partialReconstruction, reconstructionCanvas);
    };

    // Adiciona o event listener ao slider
    // Usamos 'input' para que a atualização seja em tempo real enquanto arrasta
    eigenfaceSlider.oninput = updateReconstruction;

    // Chama a função uma vez para a reconstrução inicial (com todos os componentes)
    updateReconstruction();

    // --- LÓGICA DE RECONHECIMENTO (MATCH) ---
    // Esta parte continua a mesma, comparando a "receita completa"
    let bestMatchIndex = -1, minDistance = Infinity;
    recognitionData.weights.forEach((dbWeights, index) => {
        // Compara a receita completa do usuário com as do banco de dados
        const distance = math.distance(userWeights, dbWeights);
        if (distance < minDistance) {
            minDistance = distance;
            bestMatchIndex = index;
        }
    });
    const matchedFilepath = recognitionData.filepaths[bestMatchIndex];
    const matchedLabel = recognitionData.labels[bestMatchIndex];
    matchImage.src = `database_png/${matchedFilepath}`;
    matchLabel.textContent = `Identificado como: Sujeito ${matchedLabel.replace('s', '')}`;
    matchDistance.textContent = `Pontuação (Distância): ${minDistance.toFixed(2)} (menor é melhor)`;
}

    // Inicia o processo carregando os dados
    loadRecognitionData();
});