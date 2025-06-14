from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create a new image with blue background
    img = Image.new('RGBA', (size, size), (0, 123, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Try to use a decent font, fall back to default
    try:
        font_size = max(size // 3, 12)
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Add "AI" text
    text = "AI"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Save the image
    img.save(filename)
    print(f"Created {filename} ({size}x{size})")

# Create all required icon sizes
sizes = [16, 32, 48, 128]
for size in sizes:
    create_icon(size, f"icon{size}.png")

print("All icons created successfully\!")
EOF < /dev/null