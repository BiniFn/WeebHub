import os

# Map of replacements
replacements = {
    "Seanime": "WeebHub",
    "seanime": "weebhub",
    "SEANIME": "WEEBHUB"
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except (UnicodeDecodeError, IsADirectoryError):
        return # Skip binary files and dirs
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

def main():
    root_dir = "."
    # First, replace contents
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if '.git' in dirpath.split(os.sep):
            continue
        for filename in filenames:
            if filename == "rebrand.py":
                continue
            filepath = os.path.join(dirpath, filename)
            replace_in_file(filepath)

    # Second, rename files and directories (bottom-up to avoid path invalidation)
    for dirpath, dirnames, filenames in os.walk(root_dir, topdown=False):
        if '.git' in dirpath.split(os.sep):
            continue
        # Rename files
        for filename in filenames:
            if filename == "rebrand.py":
                continue
            new_name = filename
            for old, new in replacements.items():
                new_name = new_name.replace(old, new)
            if new_name != filename:
                old_path = os.path.join(dirpath, filename)
                new_path = os.path.join(dirpath, new_name)
                os.rename(old_path, new_path)
        
        # Rename directories
        for dirname in dirnames:
            if dirname == '.git':
                continue
            new_name = dirname
            for old, new in replacements.items():
                new_name = new_name.replace(old, new)
            if new_name != dirname:
                old_path = os.path.join(dirpath, dirname)
                new_path = os.path.join(dirpath, new_name)
                os.rename(old_path, new_path)

if __name__ == "__main__":
    main()
