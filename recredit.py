import os

replacements = {
    "5rahim": "BiniFn",
    "Rahim": "binifn"
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except (UnicodeDecodeError, IsADirectoryError, FileNotFoundError):
        return
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

def main():
    root_dir = "."
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if '.git' in dirpath.split(os.sep) or 'node_modules' in dirpath.split(os.sep):
            continue
        for filename in filenames:
            if filename in ("rebrand.py", "recredit.py", "weebhub"):
                continue
            filepath = os.path.join(dirpath, filename)
            replace_in_file(filepath)

if __name__ == "__main__":
    main()
