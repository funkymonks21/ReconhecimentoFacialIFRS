Documentação: Projeto "O Rosto da Álgebra"
Autores: Cristian Lidorio, Giordano Debenedetti
Curso: Análise e Desenvolvimento de Sistemas
Disciplina: Matemática para Computação 2
Professor: Gabriel Goldmeier
1. Visão Geral do Projeto
O projeto "O Rosto da Álgebra" é uma aplicação web interativa projetada para demonstrar, de forma didática e visual, o funcionamento de um sistema de reconhecimento facial baseado no algoritmo Eigenfaces, que utiliza conceitos fundamentais de Álgebra Linear como matrizes, vetores e a Análise de Componentes Principais (PCA).
A aplicação guia o usuário através de um processo de 6 passos, começando com o upload de uma imagem de rosto e terminando com a identificação da pessoa mais parecida em um banco de dados pré-processado.
2. Arquitetura da Solução
O projeto é dividido em duas partes principais:
Script de Pré-processamento (preprocess.py): Um script em Python que prepara o banco de dados de imagens. Ele realiza a Análise de Componentes Principais (PCA) em um conjunto de imagens de treinamento, extrai as informações essenciais (Rosto Médio, Eigenfaces, Pesos) e as salva em um único arquivo JSON (recognition_data.json).
Aplicação Web (Frontend): Uma interface de usuário construída com HTML, CSS e JavaScript. Ela carrega os dados pré-processados pelo script Python e os utiliza para guiar o usuário visualmente pelo processo de reconhecimento, aplicando as mesmas transformações matemáticas no rosto enviado pelo usuário.
3. Estrutura de Arquivos
Generated code
.
├── 📄 index.html        # Estrutura principal da página web (os 6 passos).
├── 🎨 style.css         # Folha de estilos para a aparência visual da página.
├── 🧠 script.js         # Lógica interativa do frontend, manipulação do DOM e cálculos.
├── 🐍 preprocess.py     # Script Python para preparar o banco de dados e gerar o JSON.
├── 📦 database/         # Pasta com as imagens originais em formato PGM.
├── 🌐 database_png/     # Pasta gerada pelo script com as imagens convertidas para PNG.
└── 📊 recognition_data.json # Arquivo gerado pelo script com os dados do modelo.
Use code with caution.
4. Detalhamento dos Componentes
4.1. Script de Pré-processamento (preprocess.py)
Este script é o ponto de partida e a base matemática de todo o projeto. Sua função é analisar o banco de dados de rostos e extrair os "ingredientes" que o frontend usará para o reconhecimento.
Responsabilidades:
Configuração: Define constantes como as dimensões das imagens (IMAGE_WIDTH, IMAGE_HEIGHT) e o número de componentes principais (NUM_COMPONENTS) a serem extraídos.
Conversão de Imagens: Lê as imagens do banco de dados no formato .pgm, converte-as para .png (um formato amigável para a web) e as salva na pasta database_png/. Isso é crucial para que o navegador possa exibi-las.
Vetorização: Cada imagem (que é uma matriz de pixels) é "achatada" (flattened) em um único vetor longo. Todos esses vetores são empilhados para formar uma grande matriz de dados, onde cada linha representa um rosto.
Análise de Componentes Principais (PCA): Utilizando a biblioteca scikit-learn, o PCA é aplicado à matriz de dados. Este é o passo mais importante, onde o script calcula:
pca.mean_: O rosto médio (ψ) de todo o banco de dados.
pca.components_: Os autovetores (Eigenvectors) da matriz de covariância dos dados. Estes são os famosos Eigenfaces.
Cálculo de Pesos: Para cada rosto no banco de dados, o script calcula seus "pesos" correspondentes. Um peso é um coeficiente que indica "o quanto" de cada Eigenface é necessário para reconstruir aquele rosto específico. Matematicamente, é a projeção do vetor do rosto (centralizado) no espaço dos Eigenfaces.
Serialização: Todas as informações calculadas (rosto médio, eigenfaces, pesos, caminhos dos arquivos PNG e rótulos) são salvas em um único arquivo recognition_data.json. Este arquivo atua como nosso "modelo treinado".
Generated python
# Trecho principal do preprocess.py
pca = PCA(n_components=NUM_COMPONENTS)

# O PCA é treinado na matriz de rostos vetorizados
pca.fit(faces_matrix)

# Extração dos dados calculados
mean_face_vector = pca.mean_
eigenfaces = pca.components_

# Cálculo dos pesos para cada imagem do banco de dados
projected_weights = pca.transform(faces_matrix)

# Organização dos dados para salvar em JSON
output_data = {
    'mean_face': mean_face_vector.tolist(),
    'eigenfaces': eigenfaces.tolist(),
    'weights': projected_weights.tolist(),
    # ... outros metadados
}

with open('recognition_data.json', 'w') as f:
    json.dump(output_data, f)
Use code with caution.
Python
4.2. Estrutura da Página (index.html)
O arquivo HTML define a estrutura semântica da página. Ele é organizado em seções claras, cada uma contida em um <div class="card"> que representa um passo do processo.
<header>: Contém o título do projeto.
Passo 1: A Imagem como uma Matriz de Pixels: Área para upload da imagem e a primeira visualização, onde o usuário pode passar o mouse sobre a foto e ver os valores dos pixels em uma grade.
Passo 2: De Matriz para Vetor: Apresenta uma animação visual que transforma uma grade (matriz) em uma coluna única (vetor).
Passo 3: Matemática do PCA - Dos Dados aos Eigenfaces: Uma seção interativa que demonstra as etapas iniciais do PCA sobre o banco de dados: visualização dos rostos, cálculo do rosto médio e centralização dos dados (rostos - rosto médio).
Passo 4: Covariância e Autovetores: Uma seção explicativa que usa um GIF e texto para dar a intuição por trás da matriz de covariância e do conceito de Autovetores/Autovalores.
Passo 5: A "Receita" e a Reconstrução Interativa: Uma das partes mais importantes. Mostra o rosto original do usuário ao lado de uma reconstrução. Um slider permite que o usuário controle quantos Eigenfaces são usados na reconstrução, demonstrando visualmente como a qualidade da imagem melhora à medida que mais componentes são adicionados.
Passo 6: O Reconhecimento!: Exibe o resultado final: a imagem do banco de dados que mais se assemelha à imagem do usuário, juntamente com a "pontuação de similaridade" (distância Euclidiana).
Modais: O HTML também define a estrutura de janelas modais que são usadas para fornecer explicações mais detalhadas quando o usuário clica nos links "Quer entender melhor...?".
4.3. Lógica da Aplicação (script.js)
Este é o cérebro da aplicação web. Ele gerencia a interatividade, realiza os cálculos no lado do cliente e atualiza a interface do usuário.
Fluxo de Execução Principal:
Inicialização (DOMContentLoaded): Quando a página carrega, o script inicia.
Carregamento de Dados (loadRecognitionData): A primeira ação é fazer uma requisição fetch para carregar e analisar o arquivo recognition_data.json. Todos os dados do modelo (rosto médio, eigenfaces, etc.) são armazenados em uma variável global recognitionData. Nenhuma outra ação pode ocorrer até que esses dados estejam disponíveis.
Upload de Imagem (handleFileUpload):
Quando o usuário seleciona um arquivo, esta função é acionada.
Ela chama processUploadedImage, que usa um <canvas> temporário para redimensionar a imagem do usuário para o tamanho padrão (92x112) e a converte para tons de cinza.
O resultado é um vetor de pixels (userImageVector), exatamente no mesmo formato dos vetores do banco de dados.
Após o processamento, a função runRecognition é chamada.
Lógica Interativa dos Passos:
Passo 1: A função visualizeMatrixSnippet é ativada pelo evento mousemove no canvas do usuário. Ela lê a posição do mouse, encontra o valor do pixel correspondente no userImageVector e exibe uma pequena grade de valores ao redor daquele ponto.
Passo 2: A função toggleVectorAnimation simplesmente adiciona ou remove uma classe CSS (is-vector) do contêiner da animação, e o CSS cuida da transição visual.
Passo 3: As funções showDatabaseFaces, calculateAndDrawMeanFace, e showCenteredFaces são acionadas por cliques de botão. Elas usam os dados de recognitionData e a função drawVectorToCanvas para renderizar as imagens correspondentes nos elementos <canvas>.
Função Central de Reconhecimento (runRecognition):
Cálculo dos Pesos do Usuário:
Primeiro, o vetor do usuário é centralizado: centeredUserVector = userVector - mean_face.
Em seguida, os pesos do usuário são calculados projetando este vetor centralizado nos Eigenfaces: userWeights = centeredUserVector * eigenfacesᵀ. A biblioteca math.js é usada para essas operações de matriz/vetor.
Reconstrução Interativa (Passo 5):
Um listener de evento oninput é anexado ao slider.
Toda vez que o slider é movido, a função updateReconstruction é chamada.
Ela pega o número de componentes do slider, seleciona apenas a fatia correspondente dos userWeights e dos eigenfaces, e reconstrói o rosto: RostoReconstruido = (pesos * eigenfaces) + rostoMédio.
O resultado é desenhado no canvas de reconstrução.
Correspondência Final (Passo 6):
O script itera sobre todos os vetores de pesos do banco de dados (recognitionData.weights).
Para cada um, ele calcula a distância Euclidiana entre os pesos do usuário (userWeights) e os pesos do banco de dados (dbWeights).
distance = math.distance(userWeights, dbWeights)
O script mantém o controle do índice com a menor distância encontrada.
Ao final do loop, o índice da "melhor correspondência" é usado para buscar o arquivo e o rótulo correspondentes em recognitionData e exibir o resultado final.
4.4. Estilos (style.css)
A folha de estilos é responsável por toda a apresentação visual do projeto, garantindo uma experiência de usuário agradável e clara.
Variáveis CSS (:root): Define uma paleta de cores centralizada, facilitando a manutenção do tema visual.
Layout Geral: Utiliza Flexbox e Grid para organizar os elementos na página de forma responsiva.
Estilo dos Cards: Cria a aparência de "cartões" para cada passo, separando visualmente as etapas.
Estilo dos Elementos Interativos: Define a aparência de botões, links, sliders e da área de upload.
Estilos de Visualização: Estilos específicos para os elementos <canvas>, para a grade da matriz de pixels e para a animação da transformação em vetor. Uma propriedade importante aqui é image-rendering: pixelated;, que garante que as imagens de baixa resolução dos rostos não fiquem borradas pelo navegador.
Estilo dos Modais: Controla a aparência e o comportamento das janelas pop-up de explicação, incluindo a sobreposição escura e a animação de surgimento.
