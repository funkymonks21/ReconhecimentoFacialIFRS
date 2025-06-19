import numpy as np
from sklearn.decomposition import PCA
from PIL import Image
import os
import json

# --- Configurações ---
DATABASE_PATH = 'database' # Pasta com as 100 imagens
IMAGE_WIDTH = 92
IMAGE_HEIGHT = 112
# Usaremos os 20 componentes (Eigenfaces) mais importantes para representar os rostos
NUM_COMPONENTS = 20

# --- Carregar e Vetorizar as Imagens ---
print("Carregando imagens...")
face_vectors = []
image_filenames = []
for filename in sorted(os.listdir(DATABASE_PATH)):
    if filename.endswith('.pgm'):
        img_path = os.path.join(DATABASE_PATH, filename)
        with Image.open(img_path) as img:
            # Converte a imagem (matriz) em um vetor longo
            face_vectors.append(np.array(img).flatten())
            image_filenames.append(filename)

# Converte a lista de vetores em uma grande matriz (cada linha é um rosto)
faces_matrix = np.array(face_vectors)

# --- Calcular o Rosto Médio e os Eigenfaces (usando PCA) ---
print("Calculando Rosto Médio e Eigenfaces com PCA...")
# O PCA faz tudo: centraliza os dados (calcula a média), e encontra os componentes principais (Eigenfaces)
pca = PCA(n_components=NUM_COMPONENTS)
pca.fit(faces_matrix)

# O "rosto médio" é a média de todas as imagens
mean_face_vector = pca.mean_

# Os "Eigenfaces" são os componentes do PCA
eigenfaces = pca.components_

# --- Calcular os "Pesos" para cada imagem do banco de dados ---
# Isso projeta cada rosto nos Eigenfaces, criando a "receita" de cada um
print("Calculando os pesos para o banco de dados...")
projected_weights = pca.transform(faces_matrix)

# --- Salvar os Resultados em JSON para o JavaScript usar ---
print("Salvando resultados em arquivos JSON...")
output_data = {
    'mean_face': mean_face_vector.tolist(),
    'eigenfaces': eigenfaces.tolist(),
    'weights': projected_weights.tolist(),
    'filenames': image_filenames,
    'image_size': {'width': IMAGE_WIDTH, 'height': IMAGE_HEIGHT}
}

with open('recognition_data.json', 'w') as f:
    json.dump(output_data, f)

print("\nProcesso concluído!")
print(f"Dados salvos em 'recognition_data.json'. Agora você pode construir o site!")