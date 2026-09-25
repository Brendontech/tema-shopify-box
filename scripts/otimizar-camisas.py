"""Otimiza as fotos das camisas para a web.

Lê as fotos originais (uma pasta por categoria), recorta em quadrado,
redimensiona e salva em WebP em img/camisas/<categoria>/.

    python scripts/otimizar-camisas.py "C:/Users/Brendon/Downloads/camisas-da-sports"
"""
import os
import sys

from PIL import Image, ImageOps

ORIGEM = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Downloads/camisas-da-sports')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, 'img', 'camisas')
TAMANHOS = {'': 900, '-p': 420}

for categoria in sorted(os.listdir(ORIGEM)):
    pasta = os.path.join(ORIGEM, categoria)
    if not os.path.isdir(pasta):
        continue
    os.makedirs(os.path.join(DESTINO, categoria), exist_ok=True)
    for arquivo in sorted(os.listdir(pasta)):
        if not arquivo.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            continue
        im = ImageOps.exif_transpose(Image.open(os.path.join(pasta, arquivo))).convert('RGB')
        lado = min(im.size)
        im = ImageOps.fit(im, (lado, lado), Image.LANCZOS)
        nome = os.path.splitext(arquivo)[0]
        for sufixo, px in TAMANHOS.items():
            saida = os.path.join(DESTINO, categoria, f'{nome}{sufixo}.webp')
            im.resize((px, px), Image.LANCZOS).save(saida, 'WEBP', quality=80, method=6)
        print('ok', categoria, nome)
