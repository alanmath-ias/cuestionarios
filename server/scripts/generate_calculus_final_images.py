
import matplotlib.pyplot as plt
import numpy as np
import os

# Output directory
OUTPUT_DIR = "imagenes temporales preguntas"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def save_plot(filename):
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.axhline(0, color='black', linewidth=1)
    plt.axvline(0, color='black', linewidth=1)
    plt.savefig(os.path.join(OUTPUT_DIR, filename), dpi=100, bbox_inches='tight')
    plt.close()

def q1_inequality():
    # Number line -1 < x < 5
    fig, ax = plt.subplots(figsize=(8, 2))
    ax.set_xlim(-5, 10)
    ax.set_ylim(-1, 1)
    ax.spines['left'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)
    ax.yaxis.set_visible(False)
    ax.spines['bottom'].set_position('center')
    
    # Draw line
    ax.plot([-1, 5], [0, 0], color='blue', linewidth=3)
    ax.plot([-1], [0], marker='o', markerfacecolor='white', markeredgecolor='blue', markersize=10) # Open
    ax.plot([5], [0], marker='o', markerfacecolor='white', markeredgecolor='blue', markersize=10) # Open
    
    ax.set_xticks(np.arange(-5, 11, 1))
    
    plt.title("|x - 2| < 3")
    plt.savefig(os.path.join(OUTPUT_DIR, "C21_P281_Q1_Inecuacion.png"), bbox_inches='tight')
    plt.close()

def q3_parabola():
    x = np.linspace(0, 4, 100)
    y = x**2 - 4*x + 3
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='y = x^2 - 4x + 3')
    plt.plot(2, -1, 'ro')
    plt.text(2.1, -1, 'V(2, -1)')
    plt.legend()
    save_plot("C21_P281_Q3_Parabola.png")

def q5_piecewise():
    x1 = np.linspace(-2, 0, 50) # x < 0
    y1 = x1 + 1
    x2 = np.linspace(0, 2, 50) # x >= 0
    y2 = x2**2
    
    plt.figure(figsize=(6, 6))
    # x < 0
    plt.plot(x1, y1, 'b', label='x+1 (x<0)')
    plt.plot(0, 1, 'wo', markeredgecolor='b') # Open at x=0 for x+1
    
    # x >= 0
    plt.plot(x2, y2, 'g', label='x^2 (x>=0)')
    plt.plot(0, 0, 'go') # Closed at x=0 for x^2
    
    plt.legend()
    save_plot("C21_P281_Q5_Trozos.png")

def q6_injective():
    x = np.linspace(-2, 2, 100)
    y = x**3
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='f(x) = x^3')
    plt.title("Función Inyectiva")
    plt.legend()
    save_plot("C21_P281_Q6_Inyectiva.png")

def q9_limit():
    x = np.linspace(0, 4, 100)
    y = x + 2
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.plot(2, 4, 'wo', markeredgecolor='b')
    plt.title("f(x) = (x^2-4)/(x-2)")
    save_plot("C21_P281_Q9_Limite.png")

def q10_lateral():
    x1 = np.linspace(-1, 1, 50)
    y1 = 3*x1 - 1
    x2 = np.linspace(1, 3, 50)
    y2 = x2 + 4
    plt.figure(figsize=(6, 6))
    plt.plot(x1, y1, 'b', label='3x-1 (x<=1)')
    plt.plot(1, 2, 'bo')
    
    plt.plot(x2, y2, 'g', label='x+4 (x>1)')
    plt.plot(1, 5, 'wo', markeredgecolor='g')
    
    plt.legend()
    save_plot("C21_P281_Q10_LimLateral.png")

def q12_asymptote():
    x = np.linspace(-5, 5, 200)
    y = (3*x**2 - 2*x) / (2*x**2 + 1)
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.axhline(1.5, color='r', linestyle='--', label='y = 3/2')
    plt.legend()
    save_plot("C21_P281_Q12_Asintota.png")

def q15_derivative_concept():
    x = np.linspace(0, 4, 100)
    y = x**2
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='f(x)')
    # Tangent at x=2, y=4, slope=4
    t_x = np.linspace(1, 3, 100)
    t_y = 4*t_x - 4
    plt.plot(t_x, t_y, 'r--', label='Tangente')
    plt.title("Derivada = Pendiente Tangente")
    plt.legend()
    save_plot("C21_P281_Q15_DerivadaConcepto.png")

def q20_critical_points():
    x = np.linspace(-2, 2, 100)
    y = x**3 - 3*x
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.plot([-1, 1], [2, -2], 'ro')
    plt.text(-1.2, 2.2, 'Max (-1, 2)')
    plt.text(0.8, -2.5, 'Min (1, -2)')
    plt.title("f(x) = x^3 - 3x")
    save_plot("C21_P281_Q20_PuntosCriticos.png")

def q22_box():
    # Diagram of square with corners cut
    plt.figure(figsize=(6, 6))
    plt.plot([0, 10, 10, 0, 0], [0, 0, 10, 10, 0], 'k') # Outer square
    
    # Corners
    plt.plot([0, 1, 1, 0], [0, 0, 1, 1], 'r--') # BL
    plt.plot([9, 10, 10, 9], [0, 0, 1, 1], 'r--') # BR
    plt.plot([9, 10, 10, 9], [9, 9, 10, 10], 'r--') # TR
    plt.plot([0, 1, 1, 0], [9, 9, 10, 10], 'r--') # TL
    
    plt.text(0.2, 0.2, 'x')
    plt.text(5, -1, '30 cm')
    plt.axis('off')
    plt.title("Caja: V(x) = x(30-2x)^2")
    save_plot("C21_P281_Q22_Caja.png")

if __name__ == "__main__":
    q1_inequality()
    q3_parabola()
    q5_piecewise()
    q6_injective()
    q9_limit()
    q10_lateral()
    q12_asymptote()
    q15_derivative_concept()
    q20_critical_points()
    q22_box()
