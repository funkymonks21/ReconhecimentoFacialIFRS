import numpy as np
from sklearn.decomposition import PCA
from PIL import Image
import os
import json

# --- Configurações (não mudam) ---
DATABASE_PATH = 'database'
IMAGE_WIDTH = 92
IMAGE_HEIGHT = 112
NUM_COMPONENTS = 20

# --- Carregar e Vetorizar as Imagens (Lógica Atualizada) ---
print("Carregando imagens das subpastas...")
face_vectors = []
image_filepaths = [] # Salvará o caminho relativo, ex: 's1/1.pgm'
image_labels = []    # Salvará a identidade, ex: 's1'

# os.walk é perfeito para percorrer uma árvore de diretórios
for root, dirs, files in os.walk(DATABASE_PATH):
    # Ordenar os diretórios e arquivos para garantir consistência
    dirs.sort()
    files.sort()
    for filename in files:
        if filename.endswith('.pgm'):
            img_path = os.path.join(root, filename)
            
            # Extrai o label (nome da pasta) e o caminho relativo
            label = os.path.basename(root) # Pega 's1', 's2', etc.
            # Cria um caminho como 's1/1.pgm' para o JS usar
            relative_path = os.path.join(label, filename).replace('\\', '/') # Garante barras de URL

            with Image.open(img_path) as img:
                face_vectors.append(np.array(img).flatten())
                image_filepaths.append(relative_path)
                image_labels.append(label)

print(f"Encontradas {len(face_vectors)} imagens de {len(set(image_labels))} pessoas.")

# Converte a lista de vetores em uma grande matriz
faces_matrix = np.array(face_vectors)

# --- O restante do código é idêntico ---
print("Calculando Rosto Médio e Eigenfaces com PCA...")
pca = PCA(n_components=NUM_COMPONENTS)
pca.fit(faces_matrix)

mean_face_vector = pca.mean_
eigenfaces = pca.components_

print("Calculando os pesos para o banco de dados...")
projected_weights = pca.transform(faces_matrix)

print("Salvando resultados em arquivos JSON...")
# --- Salvar os Resultados Atualizados ---
output_data = {
    'mean_face': mean_face_vector.tolist(),
    'eigenfaces': eigenfaces.tolist(),
    'weights': projected_weights.tolist(),
    'filepaths': image_filepaths, # Mudamos de 'filenames' para 'filepaths'
    'labels': image_labels,         # Adicionamos os labels!
    'image_size': {'width': IMAGE_WIDTH, 'height': IMAGE_HEIGHT}
}

with open('recognition_data.json', 'w') as f:
    json.dump(output_data, f)

print("\nProcesso concluído!")
print(f"Dados salvos em 'recognition_data.json'.")