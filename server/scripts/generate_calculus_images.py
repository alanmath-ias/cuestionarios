
import matplotlib.pyplot as plt
import numpy as np
import os

# Output directory
OUTPUT_DIR = "generated_images_calculus"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def save_plot(filename):
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.axhline(0, color='black', linewidth=1)
    plt.axvline(0, color='black', linewidth=1)
    plt.savefig(os.path.join(OUTPUT_DIR, filename), dpi=100, bbox_inches='tight')
    plt.close()

def q1_inequality():
    # Number line x <= -5
    fig, ax = plt.subplots(figsize=(8, 2))
    ax.set_xlim(-10, 10)
    ax.set_ylim(-1, 1)
    ax.spines['left'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)
    ax.yaxis.set_visible(False)
    ax.spines['bottom'].set_position('center')
    
    # Draw line
    ax.plot([-10, -5], [0, 0], color='blue', linewidth=3)
    ax.plot([-5], [0], marker='o', color='blue', markersize=10) # Closed circle
    
    # Ticks
    ax.set_xticks(np.arange(-10, 11, 1))
    
    plt.title("x <= -5")
    plt.savefig(os.path.join(OUTPUT_DIR, "C21_P281_Q1_Inecuacion.png"), bbox_inches='tight')
    plt.close()

def q2_abs_value():
    # Number line (-1, 5)
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
    
    plt.title("-1 < x < 5")
    plt.savefig(os.path.join(OUTPUT_DIR, "C21_P281_Q2_ValorAbsoluto.png"), bbox_inches='tight')
    plt.close()

def q3_linear():
    x = np.linspace(-2, 5, 100)
    y = 2 * x
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='y = 2x')
    plt.scatter([1, 3], [2, 6], color='red', zorder=5)
    plt.text(1.2, 2, '(1, 2)')
    plt.text(3.2, 6, '(3, 6)')
    plt.legend()
    save_plot("C21_P281_Q3_Recta.png")

def q4_quadratic():
    x = np.linspace(0, 6, 100)
    y = x**2 - 6*x + 5
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='y = x^2 - 6x + 5')
    plt.scatter([3], [-4], color='red', zorder=5)
    plt.text(3.2, -4, 'V(3, -4)')
    plt.legend()
    save_plot("C21_P281_Q4_Parabola.png")

def q5_rational():
    x = np.linspace(-5, 5, 200)
    # Mask values near asymptotes
    mask = (np.abs(x - 2) > 0.1) & (np.abs(x + 2) > 0.1)
    x_masked = x[mask]
    y_masked = (x_masked + 1) / (x_masked**2 - 4)
    
    plt.figure(figsize=(6, 6))
    plt.scatter(x_masked, y_masked, s=1) # Use scatter for discontinuous plot or plot segments
    # Better to plot segments
    
    plt.axvline(2, color='red', linestyle='--', label='x=2')
    plt.axvline(-2, color='red', linestyle='--', label='x=-2')
    plt.ylim(-5, 5)
    plt.legend()
    save_plot("C21_P281_Q5_Racional.png")

def q6_log():
    x = np.linspace(0.1, 10, 100)
    y = np.log2(x)
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='y = log2(x)')
    plt.scatter([2, 4, 8], [1, 2, 3], color='red', zorder=5)
    plt.text(2.2, 1, '(2, 1)')
    plt.text(4.2, 2, '(4, 2)')
    plt.text(8.2, 3, '(8, 3)')
    plt.legend()
    save_plot("C21_P281_Q6_Logaritmo.png")

def q7_piecewise():
    x1 = np.linspace(-2, 1, 50)
    y1 = 2 * x1
    x2 = np.linspace(1, 4, 50)
    y2 = 3 * np.ones_like(x2)
    
    plt.figure(figsize=(6, 6))
    # Remove last point of x1 for open circle effect if needed, but simple plot is fine
    plt.plot(x1[x1<1], y1[x1<1], 'b', label='2x (x < 1)')
    plt.plot(x2, y2, 'g', label='3 (x >= 1)')
    
    # Circles
    plt.plot(1, 2, 'bo', fillstyle='none') # Open at (1,2)
    plt.plot(1, 3, 'go') # Closed at (1,3)
    
    plt.legend()
    save_plot("C21_P281_Q7_Trozos.png")

def q8_injective():
    x = np.linspace(-2, 2, 100)
    y = x**2
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='y = x^2')
    plt.axhline(2, color='red', linestyle='--', label='y=2')
    plt.scatter([-1.414, 1.414], [2, 2], color='red')
    plt.legend()
    plt.title("Prueba de la Recta Horizontal")
    save_plot("C21_P281_Q8_Inyectiva.png")

def q9_operations():
    x = np.linspace(-2, 2, 100)
    f = 3*x**2 + 2
    g = 2*x - 1
    
    plt.figure(figsize=(6, 6))
    plt.plot(x, f, label='f(x) = 3x^2 + 2')
    plt.plot(x, g, label='g(x) = 2x - 1')
    plt.legend()
    save_plot("C21_P281_Q9_Operaciones.png")

def q10_composition():
    x = np.linspace(-1, 5, 100)
    y = np.sqrt(x + 1)
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='y = sqrt(x+1)')
    plt.scatter([-1], [0], color='red')
    plt.legend()
    save_plot("C21_P281_Q10_Composicion.png")

if __name__ == "__main__":
    q1_inequality()
    q2_abs_value()
    q3_linear()
    q4_quadratic()
    q5_rational()
    q6_log()
    q7_piecewise()
    q8_injective()
    q9_operations()
    q10_composition()
