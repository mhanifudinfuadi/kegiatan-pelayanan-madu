"""
Upscale gambar dan video untuk halaman Unit Kerja.

Pemakaian (dari folder unit-kerja-vscode):
  python upscale/upscale.py image assets/foto.jpg 2
  python upscale/upscale.py video assets/moon-hero.mp4 2

- image : Lanczos via Pillow (cepat, tanpa AI).
- video : Lanczos via ffmpeg (butuh ffmpeg di PATH).
Untuk hasil lebih tajam, pakai AI upscaler (Real-ESRGAN / Topaz) lalu simpan
hasilnya di assets/ dengan nama yang sama.
"""
import subprocess, sys, os
from PIL import Image

def upscale_image(path, scale):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    out = im.resize((w * scale, h * scale), Image.LANCZOS)
    root, _ = os.path.splitext(path)
    dst = f"{root}@{scale}x.jpg"
    out.save(dst, quality=92, optimize=True)
    print('tersimpan:', dst, out.size)

def upscale_video(path, scale):
    root, _ = os.path.splitext(path)
    dst = f"{root}@{scale}x.mp4"
    cmd = [
        'ffmpeg', '-y', '-i', path,
        '-vf', f"scale=iw*{scale}:ih*{scale}:flags=lanczos,unsharp=5:5:0.6",
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '20',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', dst
    ]
    subprocess.run(cmd, check=True)
    print('tersimpan:', dst)

if __name__ == '__main__':
    if len(sys.argv) != 4 or sys.argv[1] not in ('image', 'video'):
        print(__doc__); sys.exit(1)
    kind, path, scale = sys.argv[1], sys.argv[2], int(sys.argv[3])
    upscale_image(path, scale) if kind == 'image' else upscale_video(path, scale)
