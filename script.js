document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis Globais e Referências de Elementos ---
    let recognitionData = null;
    const uploadInput = document.getElementById('upload-input');

    // Canvas para exibir as imagens
    const userCanvas = document.getElementById('user-canvas');
    const meanFaceCanvas = document.getElementById('mean-face-canvas');
    const eigenfaceCanvas = document.getElementById('eigenface-canvas');
    const reconstructionCanvas = document.getElementById('reconstruction-canvas');

    // Elementos de resultado
    const matchImage = document.getElementById('match-image');
    const matchLabel = document.getElementById('match-label');
    const matchDistance = document.getElementById('match-distance');

    // Seções da página
    const sections = [
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4'),
    ];

    // --- Funções Auxiliares ---

    // Função para desenhar um vetor de imagem em um canvas
    function drawVectorToCanvas(vector, canvas) {
        const { width, height } = recognitionData.image_size;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        for (let i = 0; i < vector.length; i++) {
            const pixelValue = Math.max(0, Math.min(255, vector[i])); // Garante que o valor está entre 0-255
            imageData.data[i * 4 + 0] = pixelValue; // R
            imageData.data[i * 4 + 1] = pixelValue; // G
            imageData.data[i * 4 + 2] = pixelValue; // B
            imageData.data[i * 4 + 3] = 255;      // Alpha
        }
        ctx.putImageData(imageData, 0, 0);
    }
    
    // Função para carregar a imagem do usuário e convertê-la para o formato correto
    async function processUploadedImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const { width, height } = recognitionData.image_size;
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    
                    // Desenha a imagem redimensionada
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Converte para tons de cinza e vetoriza
                    const imageData = ctx.getImageData(0, 0, width, height);
                    const vector = new Array(width * height);
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        // Média simples para tons de cinza
                        const grayscale = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
                        vector[i / 4] = grayscale;
                    }
                    resolve(vector);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // --- Lógica Principal ---

    // 1. Carregar os dados pré-calculados do JSON
    async function loadRecognitionData() {
        try {
            const response = await fetch('recognition_data.json');
            recognitionData = await response.json();
            console.log("Dados de reconhecimento carregados!", recognitionData);
            
            // Desenha o rosto médio e um dos eigenfaces como exemplo
            drawVectorToCanvas(recognitionData.mean_face, meanFaceCanvas);
            drawVectorToCanvas(recognitionData.eigenfaces[0], eigenfaceCanvas);
        } catch (error) {
            console.error("Erro ao carregar dados de reconhecimento:", error);
            alert("Não foi possível carregar os dados. Verifique se o arquivo 'recognition_data.json' está na pasta correta.");
        }
    }

    // 2. Lidar com o upload de imagem do usuário
    uploadInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file || !recognitionData) return;

        // Limpa resultados antigos e esconde seções
        sections.forEach(s => s.classList.add('hidden'));

        // Processa a imagem do usuário
        const userVector = await processUploadedImage(file);
        drawVectorToCanvas(userVector, userCanvas);
        document.getElementById('step-1').querySelector('.canvas-container').style.display = 'block';

        // Inicia o processo de reconhecimento
        runRecognition(userVector);
    });

    // 3. Executar o reconhecimento
    function runRecognition(userVector) {
        // --- ETAPA DE CÁLCULO (A MÁGICA DA ÁLGEBRA LINEAR) ---

        // a) Centralizar o rosto do usuário (subtrair o rosto médio)
        const centeredUserVector = math.subtract(userVector, recognitionData.mean_face);

        // b) Projetar no espaço dos Eigenfaces (calcular a "receita" do usuário)
        // Isso é feito calculando o produto escalar do vetor do usuário com cada Eigenface
        const userWeights = math.multiply(centeredUserVector, math.transpose(recognitionData.eigenfaces));

        // c) Reconstruir o rosto do usuário a partir dos pesos para visualização
        const reconstruction = math.add(
            math.multiply(userWeights, recognitionData.eigenfaces),
            recognitionData.mean_face
        );
        drawVectorToCanvas(reconstruction, reconstructionCanvas);

        // d) Encontrar o "match" no banco de dados
        let bestMatchIndex = -1;
        let minDistance = Infinity;

        recognitionData.weights.forEach((dbWeights, index) => {
            // Calcular a distância Euclidiana entre a receita do usuário e a receita do banco de dados
            const distance = math.distance(userWeights, dbWeights);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatchIndex = index;
            }
        });

        // --- ATUALIZAR A INTERFACE ---
        const matchedFilename = recognitionData.filenames[bestMatchIndex];
        matchImage.src = `database/${matchedFilename}`;
        matchLabel.textContent = `Pessoa Encontrada: ${matchedFilename} (do arquivo)`;
        matchDistance.textContent = `Pontuação de Similaridade (Distância): ${minDistance.toFixed(2)}. Quanto menor, mais parecido.`;

        // Mostrar todas as seções de resultado
        sections.forEach(s => s.classList.remove('hidden'));
    }

    // Iniciar tudo carregando os dados
    loadRecognitionData();
});