
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

# Period II Images

def q11_limit_graph():
    x = np.linspace(0, 4, 100)
    y = x + 1
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, 'b')
    # Hole at (2, 3)
    plt.plot(2, 3, 'wo', markeredgecolor='b', markersize=8)
    # Point at (2, 1)
    plt.plot(2, 1, 'bo', markersize=8)
    plt.title("f(x)")
    save_plot("C21_P281_Q11_LimiteGrafico.png")

def q12_properties():
    # Just text or simple graph of parabola
    x = np.linspace(1, 4, 100)
    y = 2*x**2 - 5*x + 1
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.plot(3, 4, 'ro')
    plt.text(3.1, 4, '(3, 4)')
    save_plot("C21_P281_Q12_PropiedadesLim.png")

def q13_lateral():
    x1 = np.linspace(-1, 1, 50)
    y1 = x1 + 1
    x2 = np.linspace(1, 3, 50)
    y2 = x2**2
    plt.figure(figsize=(6, 6))
    plt.plot(x1, y1, 'b', label='x+1 (x<1)')
    plt.plot(x2, y2, 'g', label='x^2 (x>=1)')
    plt.plot(1, 2, 'wo', markeredgecolor='b') # Limit from left is 2
    plt.plot(1, 1, 'go') # Limit from right is 1
    plt.legend()
    save_plot("C21_P281_Q13_LimiteLateral.png")

def q14_technique():
    # Graph of (x^2-4)/(x-2) which is x+2 with hole at 2
    x = np.linspace(0, 4, 100)
    y = x + 2
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.plot(2, 4, 'wo', markeredgecolor='b')
    plt.title("f(x) = (x^2-4)/(x-2)")
    save_plot("C21_P281_Q14_TecnicaLimite.png")

def q15_asymptote():
    x = np.linspace(0, 6, 200)
    mask = np.abs(x - 3) > 0.1
    x_m = x[mask]
    y_m = 1 / (x_m - 3)
    plt.figure(figsize=(6, 6))
    plt.plot(x_m, y_m)
    plt.axvline(3, color='r', linestyle='--', label='x=3')
    plt.ylim(-10, 10)
    plt.legend()
    save_plot("C21_P281_Q15_Asintota.png")

def q16_trig_limit():
    x = np.linspace(-1, 1, 200)
    y = np.sin(5*x)/x
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.plot(0, 5, 'wo', markeredgecolor='b')
    plt.title("y = sin(5x)/x")
    save_plot("C21_P281_Q16_LimTrig.png")

def q17_continuity():
    # Graph with jump at x=1
    x1 = np.linspace(-1, 1, 50)
    y1 = x1
    x2 = np.linspace(1, 3, 50)
    y2 = x2 + 1
    plt.figure(figsize=(6, 6))
    plt.plot(x1, y1, 'b')
    plt.plot(x2, y2, 'b')
    plt.plot(1, 1, 'bo')
    plt.plot(1, 2, 'wo', markeredgecolor='b')
    save_plot("C21_P281_Q17_Continuidad.png")

def q18_derivative_concept():
    x = np.linspace(0, 4, 100)
    y = x**2
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='f(x)')
    # Tangent at x=2, y=4, slope=4. y-4 = 4(x-2) => y = 4x - 4
    t_x = np.linspace(1, 3, 100)
    t_y = 4*t_x - 4
    plt.plot(t_x, t_y, 'r--', label='Tangente')
    plt.plot(2, 4, 'ko')
    plt.legend()
    save_plot("C21_P281_Q18_ConceptoDerivada.png")

def q19_power_rule():
    # Just text usually, but graph helps
    x = np.linspace(-1.5, 1.5, 100)
    y = 3*x**4 - 2*x**2 + 5
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.title("f(x) = 3x^4 - 2x^2 + 5")
    save_plot("C21_P281_Q19_DerivadaPotencia.png")

def q20_product_rule():
    x = np.linspace(-2, 1, 100)
    y = x * np.exp(x)
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.title("f(x) = x e^x")
    save_plot("C21_P281_Q20_ReglaProducto.png")

def q21_chain_rule():
    x = np.linspace(-2, 1, 100)
    y = (2*x + 1)**3
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.title("f(x) = (2x+1)^3")
    save_plot("C21_P281_Q21_ReglaCadena.png")

def q22_implicit():
    # Circle
    theta = np.linspace(0, 2*np.pi, 100)
    x = 5 * np.cos(theta)
    y = 5 * np.sin(theta)
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.axis('equal')
    plt.title("x^2 + y^2 = 25")
    save_plot("C21_P281_Q22_DerivadaImplicita.png")

def q23_higher_order():
    x = np.linspace(0, 2*np.pi, 100)
    y = np.sin(x)
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label='sin(x)')
    plt.plot(x, -np.sin(x), '--', label="-sin(x) (f'')")
    plt.legend()
    save_plot("C21_P281_Q23_OrdenSuperior.png")

# Period III Images

def q24_increasing():
    x = np.linspace(-1, 3, 100)
    y = -(x-1)**2 + 2 # Parabola opening down, vertex at (1, 2)
    # Wait, question says increasing (0,2)? Let's make a cubic or something matching the answer
    # Answer: (0, 2). So increasing between 0 and 2.
    # f(x) = -x^3 + 3x^2. f'(x) = -3x^2 + 6x = 3x(2-x). + on (0,2).
    x = np.linspace(-1, 3, 100)
    y = -x**3 + 3*x**2
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.axvline(0, color='g', linestyle='--')
    plt.axvline(2, color='g', linestyle='--')
    plt.title("Intervalo Creciente")
    save_plot("C21_P281_Q24_Crecimiento.png")

def q25_concavity():
    x = np.linspace(-2, 2, 100)
    y = x**3
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.text(1, 1, "Cóncava Arriba")
    plt.text(-1, -1, "Cóncava Abajo")
    save_plot("C21_P281_Q25_Concavidad.png")

def q26_second_deriv_test():
    x = np.linspace(-2, 2, 100)
    y = x**2
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.plot(0, 0, 'ro')
    plt.title("f'(c)=0, f''(c)>0 => Minimo")
    save_plot("C21_P281_Q26_Criterio2da.png")

def q27_max_min():
    x = np.linspace(-1, 4, 100)
    y = -0.5*(x-1.5)**2 + 3
    plt.figure(figsize=(6, 6))
    plt.plot(x, y)
    plt.plot(1.5, 3, 'ro')
    plt.text(1.6, 3, 'Max Absoluto')
    save_plot("C21_P281_Q27_MaximosMinimos.png")

def q28_optimization():
    # Rectangle
    plt.figure(figsize=(6, 6))
    plt.plot([0, 5, 5, 0, 0], [0, 0, 5, 5, 0], 'b')
    plt.text(2, 2.5, "Area Maxima\nCuadrado 5x5")
    plt.xlim(-1, 6)
    plt.ylim(-1, 6)
    save_plot("C21_P281_Q28_Optimizacion.png")

def q29_rates():
    # Concentric circles
    theta = np.linspace(0, 2*np.pi, 100)
    plt.figure(figsize=(6, 6))
    for r in [1, 3, 5]:
        plt.plot(r*np.cos(theta), r*np.sin(theta), 'b--')
    plt.axis('equal')
    plt.title("dr/dt = 1 => dA/dt = ?")
    save_plot("C21_P281_Q29_RazonCambio.png")

if __name__ == "__main__":
    q11_limit_graph()
    q12_properties()
    q13_lateral()
    q14_technique()
    q15_asymptote()
    q16_trig_limit()
    q17_continuity()
    q18_derivative_concept()
    q19_power_rule()
    q20_product_rule()
    q21_chain_rule()
    q22_implicit()
    q23_higher_order()
    q24_increasing()
    q25_concavity()
    q26_second_deriv_test()
    q27_max_min()
    q28_optimization()
    q29_rates()
