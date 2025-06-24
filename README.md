# Documentação do Projeto: "O Rosto da Álgebra"

**Curso:** Análise e Desenvolvimento de Sistemas  
**Disciplina:** Matemática para Computação 2  
**Professor:** Gabriel Goldmeier  
**Autores:** Cristian Lidorio, Giordano Debenedetti

## 1. Introdução

Este projeto demonstra o funcionamento de um sistema de reconhecimento facial utilizando o algoritmo **Eigenfaces**, que é uma aplicação direta da técnica de **Análise de Componentes Principais (PCA)**, um pilar da Álgebra Linear e da Estatística.

O sistema é dividido em duas partes principais:

1.  **Script de Treinamento (Backend - `train.py`):** Um script em Python que processa um banco de dados de imagens de rostos, aprende as características faciais mais importantes (os "Eigenfaces") e salva esse conhecimento em um arquivo de dados (`recognition_data.json`).
2.  **Interface Web Interativa (Frontend - `index.html`, `style.css`, `script.js`):** Uma página web que carrega os dados treinados e permite ao usuário fazer o upload de uma foto. A interface então guia o usuário, passo a passo e de forma visual, por todo o processo matemático do reconhecimento.

## 2. Arquitetura Geral

O fluxo de dados do projeto funciona da seguinte maneira:

1.  O script `train.py` é executado **uma vez** (*offline*). Ele lê as imagens do banco de dados (`database`), realiza os cálculos de PCA e gera o arquivo `recognition_data.json`.
2.  Este arquivo `recognition_data.json` atua como nosso "modelo treinado". Ele contém toda a informação necessária para o sistema reconhecer novos rostos.
3.  O usuário abre o `index.html` em um navegador.
4.  O `script.js` da página web carrega o `recognition_data.json`.
5.  Quando o usuário envia uma nova imagem, o `script.js` realiza os mesmos cálculos matemáticos (projeção) no lado do cliente (no navegador) para encontrar o rosto mais parecido no banco de dados original.

---

## 3. Parte 1: O Script de Treinamento (`train.py`)

Este script é responsável por analisar o banco de dados de imagens e extrair as características essenciais para o reconhecimento.

### Objetivo

O objetivo principal é transformar um conjunto de imagens de rostos em uma base de conhecimento compacta e eficiente, que consiste em:
*   O "rosto médio" de todo o banco de dados.
*   Os "Eigenfaces", que são os componentes que representam as maiores variações entre os rostos.
*   Os "pesos" de cada imagem do banco, que representam como cada rosto pode ser reconstruído a partir dos Eigenfaces.

### Bibliotecas Utilizadas

*   **`numpy`**: Fundamental para operações matemáticas com matrizes e vetores de forma eficiente.
*   **`scikit-learn (sklearn.decomposition.PCA)`**: Fornece uma implementação otimizada e robusta do algoritmo de Análise de Componentes Principais (PCA).
*   **`Pillow (PIL)`**: Usada para ler, manipular e salvar arquivos de imagem.
*   **`os`**, **`json`**, **`shutil`**: Para manipulação de arquivos e pastas, e para salvar a estrutura de dados final em formato JSON.

### Passo a Passo do Código

#### **Configurações Iniciais**
```python
# --- Configurações ---
DATABASE_PATH_PGM = 'database'
DATABASE_PATH_PNG = 'database_png' # Nova pasta para as imagens web-friendly
IMAGE_WIDTH = 92
IMAGE_HEIGHT = 112
NUM_COMPONENTS = 20
Use code with caution.
Markdown
Explicação: Definimos constantes globais. DATABASE_PATH_PNG é onde salvaremos as versões PNG, compatíveis com navegadores. IMAGE_WIDTH e IMAGE_HEIGHT definem as dimensões padrão (92x112 = 10.304 pixels). NUM_COMPONENTS é um hiperparâmetro crucial: ele define quantos Eigenfaces (componentes principais) queremos usar para representar os rostos.
Preparação da Pasta de Imagens
Generated python
# --- Preparar a pasta de destino para PNGs ---
if os.path.exists(DATABASE_PATH_PNG):
    shutil.rmtree(DATABASE_PATH_PNG)
os.makedirs(DATABASE_PATH_PNG)
Use code with caution.
Python
Explicação: Este bloco garante que, a cada execução, a pasta de imagens PNG seja limpa e recriada, evitando que arquivos antigos interfiram no processo.
Carregamento, Vetorização e Conversão
Generated python
face_vectors = []
image_filepaths_png = []
image_labels = []

for root, dirs, files in os.walk(DATABASE_PATH_PGM):
    for filename in files:
        if filename.endswith('.pgm'):
            # ...
            with Image.open(pgm_path) as img:
                img.save(png_full_path) # 1. Salva a versão PNG
                
                # 2. Continua o processo de vetorização
                face_vectors.append(np.array(img).flatten())
                # ...

faces_matrix = np.array(face_vectors)
Use code with caution.
Python
Explicação: Este é o coração do pré-processamento de dados.
Conversão para PNG: Cada imagem .pgm é salva como .png para que a interface web possa exibi-las.
Vetorização: A imagem 2D (matriz 92x112) é transformada em um vetor 1D (array de 10.304 elementos) usando .flatten(). Este é o passo fundamental para aplicar a Álgebra Linear.
Matriz de Dados: Todos os vetores de rosto são empilhados para formar uma única matriz (faces_matrix), onde cada linha representa um rosto.
Cálculo do PCA
Generated python
pca = PCA(n_components=NUM_COMPONENTS)
pca.fit(faces_matrix)

mean_face_vector = pca.mean_
eigenfaces = pca.components_
Use code with caution.
Python
Explicação: Aqui a "mágica" do PCA acontece.
Instanciação: Criamos um objeto PCA para encontrar os 20 componentes principais mais significativos.
Treinamento (pca.fit): Este comando analisa a faces_matrix e calcula:
pca.mean_: O Rosto Médio, a média de todos os rostos.
pca.components_: Os Eigenfaces, uma matriz onde cada linha é um vetor que aponta na direção de maior variação nos dados.
Cálculo dos Pesos (Projeção)
Generated python
projected_weights = pca.transform(faces_matrix)
Use code with caution.
Python
Explicação: O método pca.transform projeta cada rosto da faces_matrix no espaço dos Eigenfaces. O resultado é uma matriz de pesos (projected_weights), onde cada linha é um conjunto de 20 números (a "receita" ou "DNA" facial) que descreve unicamente aquele rosto.
Salvando os Resultados
Generated python
output_data = {
    'mean_face': mean_face_vector.tolist(),
    'eigenfaces': eigenfaces.tolist(),
    'weights': projected_weights.tolist(),
    'filepaths': image_filepaths_png,
    'labels': image_labels,
    'image_size': {'width': IMAGE_WIDTH, 'height': IMAGE_HEIGHT}
}

with open('recognition_data.json', 'w') as f:
    json.dump(output_data, f)
Use code with caution.
Python
Explicação: Todos os resultados são convertidos para listas Python e salvos em um único arquivo JSON. Este arquivo é o "modelo treinado" que será usado pela interface web.
4. Parte 2: A Interface Web Interativa
A interface web é projetada para ser uma ferramenta de ensino, explicando visualmente cada etapa do algoritmo.
index.html (A Estrutura)
Define a estrutura semântica da página, dividida em "cards" que correspondem aos passos lógicos do algoritmo (Passo 1 a 6). Utiliza elementos <canvas> para desenho dinâmico de imagens e inclui modais para explicações teóricas.
style.css (A Aparência)
Responsável por toda a estilização da página. Utiliza um design moderno com "cards", um esquema de cores consistente e estilos específicos para os elementos interativos (canvases, sliders, animações) para tornar as visualizações claras e agradáveis.
script.js (A Interatividade e a Lógica)
Este é o cérebro da interface. Ele re-implementa a lógica de reconhecimento para uma única imagem e controla todas as visualizações.
Fluxo Principal
Carregamento de Dados (loadRecognitionData): Assim que a página carrega, o script usa fetch para carregar e analisar o recognition_data.json, armazenando os dados na variável global recognitionData.
Upload de Imagem (handleFileUpload): Quando o usuário seleciona uma imagem, o script a redimensiona, converte para tons de cinza e a vetoriza, criando o userImageVector. Em seguida, chama a função runRecognition.
Visualizações Interativas
Passo 1 (Matriz): O evento mousemove no canvas do usuário mostra os valores numéricos dos pixels sob o cursor, demonstrando que a imagem é uma matriz de números.
Passo 3 (Etapas do PCA): O usuário clica em botões para:
Visualizar algumas imagens do banco de dados.
Calcular e visualizar o Rosto Médio.
Calcular e visualizar a diferença de cada rosto em relação ao rosto médio, mostrando os dados "centralizados" (as matrizes Φᵢ da teoria).
Passo 5 (Reconstrução Interativa):
O script calcula os pesos para a imagem do usuário usando a fórmula:
pesos = (ImagemDoUsuário - RostoMédio) • Eigenfacesᵀ
Um slider permite que o usuário controle quantos Eigenfaces (numComponents) são usados na reconstrução.
A imagem é reconstruída em tempo real usando a fórmula:
Rosto ≈ Rosto Médio + (peso₁ * Eigenface₁) + ... + (peso_N * Eigenface_N)
Isso demonstra como os Eigenfaces são "blocos de construção" e como a qualidade da imagem melhora à medida que mais componentes são adicionados à "receita".
Passo 6 (Reconhecimento Final):
O reconhecimento compara a "receita" (o vetor de pesos do usuário) com as receitas de todos os rostos no banco de dados.
O script calcula a distância Euclidiana entre o vetor de pesos do usuário e cada um dos vetores de peso do banco de dados.
O rosto do banco de dados com a menor distância é considerado o "match", e seu resultado é exibido na tela.
5. Conclusão
Este projeto implementa com sucesso o algoritmo Eigenfaces, demonstrando a aplicação prática de conceitos de Álgebra Linear em um problema do mundo real. A abordagem de dividir o sistema em um backend de treinamento e um frontend de demonstração interativa permite não apenas construir um sistema funcional, mas também criar uma poderosa ferramenta educacional para visualizar e entender a matemática por trás do reconhecimento facial.
