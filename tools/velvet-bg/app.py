import io
from pathlib import Path

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PIL import Image, ImageFilter
from rembg import remove, new_session

BASE_DIR = Path(__file__).resolve().parent
TEXTURE_PATH = BASE_DIR / "burgundy-velvet.png"

app = Flask(__name__)
CORS(app)
session = new_session("u2netp")


def velvet_texture(size):
    texture = Image.open(TEXTURE_PATH).convert("RGB")
    canvas = Image.new("RGB", size)
    for y in range(0, size[1], texture.height):
        for x in range(0, size[0], texture.width):
            canvas.paste(texture, (x, y))
    return canvas.crop((0, 0, size[0], size[1]))


@app.get("/health")
def health():
    return {"ok": True, "service": "book-vault-velvet-bg"}


@app.post("/process")
def process_image():
    if "image" not in request.files:
        return jsonify({"error": "missing image upload"}), 400

    file = request.files["image"]
    try:
        # Read file content into bytes first
        file_bytes = io.BytesIO(file.read())
        original = Image.open(file_bytes).convert("RGBA")
        max_side = 1800
        original.thumbnail((max_side, max_side), Image.LANCZOS)

        cutout = remove(original, session=session).convert("RGBA")
        alpha = cutout.getchannel("A").filter(ImageFilter.GaussianBlur(0.35))
        cutout.putalpha(alpha)

        bg = velvet_texture(cutout.size).convert("RGBA")
        bg.alpha_composite(cutout)

        out = io.BytesIO()
        bg.save(out, format="PNG", optimize=True)
        out.seek(0)
        return send_file(out, mimetype="image/png", download_name="book-vault-velvet.png")
    except Exception as exc:
        app.logger.exception("velvet processing failed")
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8500)
