INSERT INTO categories (id, name, description, color_class)
VALUES (21, 'Test de Nivelación', 'Evaluaciones cortas para determinar el nivel de conocimientos en diferentes áreas.', 'accent')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    color_class = EXCLUDED.color_class;
