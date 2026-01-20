
import matplotlib.pyplot as plt
import numpy as np
import os

# Configuration
OUTPUT_DIR = r"L:\PAGINA WEB\APP CUESTIONARIOS\imagenes temporales preguntas"
QUIZ_PREFIX = "C21_P280"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def save_plot(filename):
    path = os.path.join(OUTPUT_DIR, filename)
    plt.savefig(path, bbox_inches='tight', dpi=100)
    plt.close()
    print(f"Generated: {filename}")

def setup_plot(title="", grid=False):
    plt.figure(figsize=(6, 4))
    if title:
        plt.title(title)
    if grid:
        plt.grid(True, linestyle='--', alpha=0.6)
    plt.axis('equal')

# 1. Right Triangle (SOHCAHTOA)
def plot_right_triangle():
    setup_plot()
    # Triangle vertices
    A = (0, 0)
    B = (4, 0)
    C = (4, 3)
    
    plt.plot([A[0], B[0], C[0], A[0]], [A[1], B[1], C[1], A[1]], 'b-', linewidth=2)
    
    # Right angle symbol
    plt.plot([3.6, 3.6, 4], [0, 0.4, 0.4], 'k-', linewidth=1)
    
    # Labels
    plt.text(2, -0.3, "4", ha='center')
    plt.text(4.1, 1.5, "3", va='center')
    plt.text(1.8, 1.6, "5", ha='center', va='center')
    plt.text(0.5, 0.2, "θ", fontsize=12)
    
    plt.axis('off')
    save_plot(f"{QUIZ_PREFIX}_Q1_Right_Triangle.png")

# 2. Angle of Elevation
def plot_angle_elevation():
    setup_plot()
    # Ground
    plt.plot([0, 10], [0, 0], 'k-', linewidth=2)
    # Tower
    plt.plot([8, 8], [0, 6], 'k-', linewidth=3)
    # Line of sight
    plt.plot([0, 8], [0, 6], 'b--', linewidth=1.5)
    # Horizontal line from eye
    plt.plot([0, 5], [0, 0], 'k:', linewidth=1)
    
    # Angle arc
    theta = np.linspace(0, 36.87, 20) # approx 37 deg
    r = 2
    x = r * np.cos(np.radians(theta))
    y = r * np.sin(np.radians(theta))
    plt.plot(x, y, 'r-')
    
    plt.text(2.5, 0.5, "30°", fontsize=10)
    plt.text(8.2, 3, "h = ?", fontsize=10)
    plt.text(4, -0.5, "50 m", ha='center')
    
    plt.axis('off')
    save_plot(f"{QUIZ_PREFIX}_Q5_Angle_Elevation.png")

# 3. Unit Circle (30 degrees)
def plot_unit_circle():
    setup_plot(grid=True)
    # Circle
    theta = np.linspace(0, 2*np.pi, 100)
    plt.plot(np.cos(theta), np.sin(theta), 'k-', alpha=0.5)
    
    # Axes
    plt.axhline(0, color='black', linewidth=1)
    plt.axvline(0, color='black', linewidth=1)
    
    # Angle 30 deg
    angle = np.radians(30)
    plt.plot([0, np.cos(angle)], [0, np.sin(angle)], 'r-', linewidth=2)
    plt.plot([np.cos(angle), np.cos(angle)], [0, np.sin(angle)], 'b--', linewidth=1)
    
    plt.text(0.2, 0.05, "30°")
    plt.text(0.9, 0.25, "P(x,y)")
    
    plt.xlim(-1.2, 1.2)
    plt.ylim(-1.2, 1.2)
    save_plot(f"{QUIZ_PREFIX}_Q8_Unit_Circle.png")

# 4. Oblique Triangle (Sine Law)
def plot_oblique_triangle():
    setup_plot()
    # Vertices
    A = (0, 0)
    B = (5, 0)
    C = (3, 4) # Not accurate for specific angles, just generic oblique
    
    plt.plot([A[0], B[0], C[0], A[0]], [A[1], B[1], C[1], A[1]], 'g-', linewidth=2)
    
    plt.text(-0.3, -0.3, "A")
    plt.text(5.1, -0.3, "B")
    plt.text(3, 4.2, "C")
    
    plt.text(2.5, -0.3, "c = 10")
    plt.text(1.2, 2.2, "b = ?")
    plt.text(4.2, 2.2, "a = 8")
    
    plt.text(0.5, 0.2, "45°")
    plt.text(4.3, 0.2, "60°")
    
    plt.axis('off')
    save_plot(f"{QUIZ_PREFIX}_Q25_Sine_Law.png")

# 5. Parabola
def plot_parabola():
    setup_plot(grid=True)
    x = np.linspace(-4, 4, 100)
    y = 0.5 * x**2
    
    plt.plot(x, y, 'b-', linewidth=2)
    plt.plot(0, 0.5, 'ro') # Focus approx
    plt.axhline(-0.5, color='g', linestyle='--') # Directrix approx
    
    plt.text(0.2, 0.6, "Foco")
    plt.text(2, -0.8, "Directriz")
    
    plt.xlim(-5, 5)
    plt.ylim(-2, 8)
    save_plot(f"{QUIZ_PREFIX}_Q30_Parabola.png")

# 6. Ellipse
def plot_ellipse():
    setup_plot(grid=True)
    t = np.linspace(0, 2*np.pi, 100)
    a = 4
    b = 2
    x = a * np.cos(t)
    y = b * np.sin(t)
    
    plt.plot(x, y, 'm-', linewidth=2)
    plt.plot([-3.46, 3.46], [0, 0], 'ro') # Foci c=sqrt(16-4)=sqrt(12)=3.46
    
    plt.text(-3.5, 0.3, "F1")
    plt.text(3.5, 0.3, "F2")
    
    plt.xlim(-5, 5)
    plt.ylim(-3, 3)
    save_plot(f"{QUIZ_PREFIX}_Q32_Ellipse.png")

if __name__ == "__main__":
    print("Generating images...")
    plot_right_triangle()
    plot_angle_elevation()
    plot_unit_circle()
    plot_oblique_triangle()
    plot_parabola()
    plot_ellipse()
    print("Done.")
