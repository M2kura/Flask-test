def find_character(file_path, position):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            file.seek(position)
            char = file.read(1)
            file.seek(0)
            content = file.read()
            line = content.count('\n', 0, position) + 1
            col = position - content.rfind('\n', 0, position)
            return char, line, col
    except Exception as e:
        return str(e), None, None

if __name__ == "__main__":
    file_path = 'templates/file.html'  # Path to your HTML file
    position = 1960369  # Position of the character

    character, line, col = find_character(file_path, position)
    if line and col:
        print(f"The character at position {position} is: '{character}' (Line: {line}, Column: {col})")
    else:
        print(f"Error: {character}")