
import matplotlib.pyplot as plt
import numpy as np
import os

# Ensure directory exists
output_dir = r"L:\PAGINA WEB\APP CUESTIONARIOS\imagenes temporales preguntas"
os.makedirs(output_dir, exist_ok=True)

def save_plot(filename):
    path = os.path.join(output_dir, filename)
    plt.savefig(path, bbox_inches='tight', dpi=100)
    plt.close()
    print(f"Saved {path}")

# --- ARITHMETIC (Quiz 278) ---

# Q3732: Fraction 3/4
def plot_fraction_3_4():
    fig, ax = plt.subplots(figsize=(4, 4))
    labels = ['', '', '', '']
    sizes = [25, 25, 25, 25]
    colors = ['#4ade80', '#4ade80', '#4ade80', 'white'] # 3 green, 1 white
    
    # Pie chart
    wedges, _ = ax.pie(sizes, colors=colors, startangle=90, counterclock=False,
                       wedgeprops={"edgecolor": "black", 'linewidth': 2, 'antialiased': True})
    
    ax.set_title("¿Qué fracción está sombreada?", fontsize=14)
    save_plot("C21_P278_Q3732.png")

# Q3735: Discount 10% off $200
def plot_discount():
    fig, ax = plt.subplots(figsize=(5, 3))
    ax.axis('off')
    
    # Draw a tag shape
    rect = plt.Rectangle((0.1, 0.1), 0.8, 0.8, color='#fca5a5', alpha=0.3, transform=ax.transAxes)
    ax.add_patch(rect)
    
    ax.text(0.5, 0.6, "$200", ha='center', va='center', fontsize=30, fontweight='bold', color='black')
    ax.text(0.5, 0.3, "-10%", ha='center', va='center', fontsize=25, fontweight='bold', color='red')
    
    save_plot("C21_P278_Q3735.png")

# Q3739: Square side 5
def plot_square_perimeter():
    fig, ax = plt.subplots(figsize=(4, 4))
    
    square = plt.Rectangle((1, 1), 3, 3, fill=None, edgecolor='blue', linewidth=3)
    ax.add_patch(square)
    
    ax.text(2.5, 0.5, "5 cm", ha='center', va='center', fontsize=14, color='blue')
    ax.text(4.2, 2.5, "5 cm", ha='center', va='center', fontsize=14, color='blue', rotation=90)
    
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 5)
    ax.axis('off')
    ax.set_title("Perímetro = ?", fontsize=14)
    
    save_plot("C21_P278_Q3739.png")

# --- ALGEBRA (Quiz 279) ---

# Q3781: Line y = 2x + 1
def plot_line_slope():
    x = np.linspace(-2, 2, 100)
    y = 2*x + 1
    
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.plot(x, y, 'b-', linewidth=2, label='y = 2x + 1')
    
    # Grid and axes
    ax.grid(True, alpha=0.3)
    ax.axhline(0, color='black', linewidth=1)
    ax.axvline(0, color='black', linewidth=1)
    
    # Slope triangle
    ax.plot([0, 1], [1, 1], 'r--', linewidth=1.5)
    ax.plot([1, 1], [1, 3], 'r--', linewidth=1.5)
    ax.text(0.5, 0.8, '1', color='red', fontsize=10)
    ax.text(1.1, 2, '2', color='red', fontsize=10)
    
    ax.set_title("Pendiente de la recta", fontsize=14)
    save_plot("C21_P279_Q3781.png")

# Q3784: Parabola y = x^2 - 4x
def plot_parabola_vertex():
    x = np.linspace(0, 4, 100)
    y = x**2 - 4*x
    
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.plot(x, y, 'g-', linewidth=2, label='y = x² - 4x')
    
    # Vertex at (2, -4)
    ax.plot(2, -4, 'ro')
    ax.text(2.2, -3.8, 'Vértice', color='red', fontsize=12)
    
    # Grid and axes
    ax.grid(True, alpha=0.3)
    ax.axhline(0, color='black', linewidth=1)
    ax.axvline(0, color='black', linewidth=1)
    
    ax.set_title("Vértice de la parábola", fontsize=14)
    save_plot("C21_P279_Q3784.png")

# Q3790: Line through (1,2) and (3,6)
def plot_two_points_line():
    x = np.linspace(0, 4, 100)
    y = 2*x # Equation is y=2x
    
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.plot(x, y, 'purple', linewidth=2)
    
    # Points
    ax.plot(1, 2, 'bo')
    ax.text(0.8, 2.5, '(1, 2)', color='blue', fontsize=10)
    
    ax.plot(3, 6, 'bo')
    ax.text(2.8, 6.5, '(3, 6)', color='blue', fontsize=10)
    
    # Grid and axes
    ax.grid(True, alpha=0.3)
    ax.axhline(0, color='black', linewidth=1)
    ax.axvline(0, color='black', linewidth=1)
    
    ax.set_title("Recta por dos puntos", fontsize=14)
    save_plot("C21_P279_Q3790.png")

# Q3791: System 3x - y = 10, 2x + y = 5
def plot_system_intersection():
    x = np.linspace(0, 5, 100)
    # y = 3x - 10
    y1 = 3*x - 10
    # y = 5 - 2x
    y2 = 5 - 2*x
    
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.plot(x, y1, 'b-', label='3x - y = 10')
    ax.plot(x, y2, 'r-', label='2x + y = 5')
    
    # Intersection at x=3, y=-1
    ax.plot(3, -1, 'ko')
    ax.text(3.2, -0.8, 'Solución', fontsize=12)
    
    # Grid and axes
    ax.grid(True, alpha=0.3)
    ax.axhline(0, color='black', linewidth=1)
    ax.axvline(0, color='black', linewidth=1)
    
    ax.legend()
    ax.set_title("Sistema de Ecuaciones", fontsize=14)
    save_plot("C21_P279_Q3791.png")

if __name__ == "__main__":
    plot_fraction_3_4()
    plot_discount()
    plot_square_perimeter()
    plot_line_slope()
    plot_parabola_vertex()
    plot_two_points_line()
    plot_system_intersection()
