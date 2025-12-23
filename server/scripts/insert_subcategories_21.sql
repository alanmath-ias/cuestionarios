INSERT INTO subcategories (name, category_id, description)
VALUES 
    ('Aritmética', 21, 'Operaciones básicas y números.'),
    ('Álgebra', 21, 'Expresiones algebraicas y ecuaciones.'),
    ('Trigonometría', 21, 'Relaciones entre ángulos y lados.'),
    ('Cálculo Diferencial', 21, 'Límites y derivadas.'),
    ('Cálculo Integral', 21, 'Integrales y sus aplicaciones.'),
    ('Ecuaciones Diferenciales', 21, 'Ecuaciones con derivadas.'),
    ('Física Mecánica', 21, 'Movimiento y fuerzas.'),
    ('Geometría Analítica', 21, 'Geometría con coordenadas.'),
    ('Álgebra Lineal', 21, 'Vectores y matrices.'),
    ('Series de Fourier', 21, 'Análisis de series periódicas.'),
    ('Geometría', 21, 'Figuras y espacio.'),
    ('Estadística', 21, 'Análisis de datos y probabilidad.')
ON CONFLICT DO NOTHING;
