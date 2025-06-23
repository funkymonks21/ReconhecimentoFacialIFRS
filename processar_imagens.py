import numpy as np
from sklearn.decomposition import PCA
from PIL import Image
import os
import json
import shutil # Usaremos para criar/limpar a pasta

# --- Configurações ---
DATABASE_PATH_PGM = 'database'
DATABASE_PATH_PNG = 'database_png' # Nova pasta para as imagens web-friendly
IMAGE_WIDTH = 92
IMAGE_HEIGHT = 112
NUM_COMPONENTS = 20

# --- Preparar a pasta de destino para PNGs ---
# Limpa a pasta se já existir, para garantir que não haja arquivos antigos
if os.path.exists(DATABASE_PATH_PNG):
    shutil.rmtree(DATABASE_PATH_PNG)
os.makedirs(DATABASE_PATH_PNG)
print(f"Pasta '{DATABASE_PATH_PNG}' preparada.")

# --- Carregar, Vetorizar e CONVERTER as Imagens ---
print("Carregando, vetorizando e convertendo imagens PGM para PNG...")
face_vectors = []
image_filepaths_png = [] # Salvará o caminho para os arquivos PNG
image_labels = []

for root, dirs, files in os.walk(DATABASE_PATH_PGM):
    dirs.sort()
    files.sort()
    
    # Cria as subpastas correspondentes em 'database_png'
    relative_path_dir = os.path.relpath(root, DATABASE_PATH_PGM)
    if relative_path_dir != '.':
        os.makedirs(os.path.join(DATABASE_PATH_PNG, relative_path_dir), exist_ok=True)
        
    for filename in files:
        if filename.endswith('.pgm'):
            pgm_path = os.path.join(root, filename)
            
            label = os.path.basename(root)
            
            # Muda a extensão do arquivo para .png
            png_filename = filename.replace('.pgm', '.png')
            png_relative_path = os.path.join(label, png_filename).replace('\\', '/')
            png_full_path = os.path.join(DATABASE_PATH_PNG, png_relative_path)
            
            with Image.open(pgm_path) as img:
                # 1. Salva a versão PNG
                img.save(png_full_path)
                
                # 2. Continua o processo de vetorização como antes
                face_vectors.append(np.array(img).flatten())
                image_filepaths_png.append(png_relative_path)
                image_labels.append(label)

print(f"Convertidas {len(face_vectors)} imagens para PNG.")

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
output_data = {
    'mean_face': mean_face_vector.tolist(),
    'eigenfaces': eigenfaces.tolist(),
    'weights': projected_weights.tolist(),
    'filepaths': image_filepaths_png, # Usando os caminhos dos PNGs!
    'labels': image_labels,
    'image_size': {'width': IMAGE_WIDTH, 'height': IMAGE_HEIGHT}
}

with open('recognition_data.json', 'w') as f:
    json.dump(output_data, f)

print("\nProcesso concluído!")
print(f"Dados salvos em 'recognition_data.json', usando as imagens da pasta '{DATABASE_PATH_PNG}'.")