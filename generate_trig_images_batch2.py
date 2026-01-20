
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

# 1. Reference Angle 210 degrees (Unit Circle)
def plot_ref_angle_210():
    fig, ax = plt.subplots(figsize=(5, 5))
    
    # Unit circle
    theta = np.linspace(0, 2*np.pi, 100)
    ax.plot(np.cos(theta), np.sin(theta), 'k-', alpha=0.3)
    
    # Axes
    ax.axhline(0, color='black', linewidth=1)
    ax.axvline(0, color='black', linewidth=1)
    
    # Angle 210 deg
    angle_rad = np.radians(210)
    ax.plot([0, np.cos(angle_rad)], [0, np.sin(angle_rad)], 'b-', linewidth=2, label='210°')
    
    # Reference angle 30 deg (from 180 to 210)
    ref_theta = np.linspace(np.pi, angle_rad, 20)
    ax.plot(0.3*np.cos(ref_theta), 0.3*np.sin(ref_theta), 'r-', linewidth=2)
    ax.text(-0.4, -0.15, '30°', color='red', fontsize=12, fontweight='bold')
    
    ax.set_aspect('equal')
    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-1.2, 1.2)
    ax.axis('off')
    ax.set_title("Ángulo de Referencia", fontsize=14)
    
    save_plot("C21_P280_Q_RefAngle210.png")

# 2. Sine Wave Amplitude (y = 2 + 3sin(4x - pi))
def plot_sine_amplitude():
    x = np.linspace(0, 2*np.pi, 400)
    y = 2 + 3 * np.sin(4*x - np.pi)
    
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.plot(x, y, 'b-', linewidth=2)
    
    # Center line y=2
    ax.axhline(2, color='gray', linestyle='--', alpha=0.7, label='Eje central (y=2)')
    
    # Max and Min lines
    ax.axhline(5, color='r', linestyle=':', alpha=0.5)
    ax.axhline(-1, color='r', linestyle=':', alpha=0.5)
    
    # Arrow for amplitude
    ax.annotate('', xy=(np.pi/8 + np.pi/4, 2), xytext=(np.pi/8 + np.pi/4, 5),
                arrowprops=dict(arrowstyle='<->', color='green', lw=2))
    ax.text(1.3, 3.5, 'Amplitud = ?', color='green', fontsize=12, fontweight='bold')
    
    ax.set_title(r"$y = 2 + 3\sin(4x - \pi)$", fontsize=14)
    ax.grid(True, alpha=0.3)
    ax.set_ylim(-2, 6)
    
    save_plot("C21_P280_Q_SineAmplitude.png")

# 3. Law of Sines (Triangle ABC)
def plot_law_sines():
    fig, ax = plt.subplots(figsize=(6, 4))
    
    # Triangle vertices (approx for A=30, B=45, C=105)
    # c/sin(105) = a/sin(30) = b/sin(45)
    # Let a = 10
    a = 10
    rad_A = np.radians(30)
    rad_B = np.radians(45)
    rad_C = np.radians(105)
    
    b = a * np.sin(rad_B) / np.sin(rad_A) # 10 * 0.707 / 0.5 = 14.14
    c = a * np.sin(rad_C) / np.sin(rad_A)
    
    # Coordinates
    # C at origin (0,0) -> No, let's put A at origin for simplicity?
    # Let's place C at top. A at (0,0). B at (c, 0).
    # A = 30 deg.
    # Actually, let's just draw a generic triangle and label it.
    
    A = np.array([0, 0])
    B = np.array([10, 0]) # Base c (arbitrary length for visual)
    C = np.array([7, 5])  # Arbitrary
    
    # Better: Construct specific triangle
    # A at (0,0)
    # B at (c, 0)
    # C at (b*cosA, b*sinA)
    # We know a=10, A=30, B=45.
    # b = 14.14
    # c = 19.3
    
    b_len = 14.14
    c_len = 19.32
    
    A_coord = np.array([0, 0])
    C_coord = np.array([b_len * np.cos(np.radians(30)), b_len * np.sin(np.radians(30))])
    B_coord = np.array([c_len, 0])
    
    triangle = plt.Polygon([A_coord, B_coord, C_coord], fill=None, edgecolor='blue', linewidth=2)
    ax.add_patch(triangle)
    
    # Labels
    ax.text(-1, -1, 'A (30°)', fontsize=12, fontweight='bold')
    ax.text(c_len, -1, 'B (45°)', fontsize=12, fontweight='bold')
    ax.text(C_coord[0]-1, C_coord[1]+1, 'C', fontsize=12, fontweight='bold')
    
    # Sides
    ax.text(c_len/2, -2, 'c', fontsize=12)
    ax.text(C_coord[0]/2 - 1, C_coord[1]/2 + 1, 'b = ?', fontsize=12, color='red', fontweight='bold')
    ax.text((B_coord[0]+C_coord[0])/2 + 0.5, (B_coord[1]+C_coord[1])/2 + 1, 'a = 10', fontsize=12)
    
    ax.set_xlim(-2, 22)
    ax.set_ylim(-3, 10)
    ax.axis('off')
    ax.set_title("Ley de Senos", fontsize=14)
    
    save_plot("C21_P280_Q_LawSines.png")

# 4. Law of Cosines (Triangle SSS)
def plot_law_cosines():
    fig, ax = plt.subplots(figsize=(6, 4))
    
    # Sides 5, 6, 7
    # A at (0,0)
    # B at (7, 0) (side c=7? No, let's say side c=6 is base)
    # Let side c=6 be on x-axis. A=(0,0), B=(6,0).
    # Side b=5. C = (5 cosA, 5 sinA).
    # Side a=7 (opposite A).
    # a^2 = b^2 + c^2 - 2bc cosA
    # 49 = 25 + 36 - 60 cosA -> 49 = 61 - 60 cosA -> -12 = -60 cosA -> cosA = 0.2
    # A = 78.5 deg
    
    # Wait, the question asks for angle opposite side 7.
    # So if sides are 5, 6, 7. Let's call them a=7, b=5, c=6.
    # We want angle A (opposite a=7).
    
    c_len = 6
    b_len = 5
    angle_A = np.arccos(0.2) # radians
    
    A_coord = np.array([0, 0])
    B_coord = np.array([c_len, 0])
    C_coord = np.array([b_len * np.cos(angle_A), b_len * np.sin(angle_A)])
    
    triangle = plt.Polygon([A_coord, B_coord, C_coord], fill=None, edgecolor='purple', linewidth=2)
    ax.add_patch(triangle)
    
    # Labels
    ax.text(-0.5, -0.5, 'A = ?', fontsize=12, color='red', fontweight='bold')
    ax.text(c_len, -0.5, 'B', fontsize=12)
    ax.text(C_coord[0], C_coord[1]+0.5, 'C', fontsize=12)
    
    # Sides
    ax.text(c_len/2, -0.8, '6', fontsize=12, fontweight='bold')
    ax.text(C_coord[0]/2 - 0.5, C_coord[1]/2, '5', fontsize=12, fontweight='bold')
    ax.text((B_coord[0]+C_coord[0])/2 + 0.2, (B_coord[1]+C_coord[1])/2, '7', fontsize=12, fontweight='bold')
    
    ax.set_xlim(-1, 7)
    ax.set_ylim(-1, 6)
    ax.axis('off')
    ax.set_title("Ley de Cosenos", fontsize=14)
    
    save_plot("C21_P280_Q_LawCosines.png")

# 5. Complex Number (Modulus 2, Arg pi/3)
def plot_complex_number():
    fig, ax = plt.subplots(figsize=(5, 5))
    
    # Axes
    ax.axhline(0, color='black', linewidth=1)
    ax.axvline(0, color='black', linewidth=1)
    
    # Point
    r = 2
    theta = np.pi/3
    x = r * np.cos(theta)
    y = r * np.sin(theta)
    
    ax.plot([0, x], [0, y], 'b-', linewidth=2)
    ax.plot(x, y, 'bo')
    
    # Dashed lines
    ax.plot([x, x], [0, y], 'k--', alpha=0.3)
    ax.plot([0, x], [y, y], 'k--', alpha=0.3)
    
    # Angle arc
    arc_theta = np.linspace(0, theta, 20)
    ax.plot(0.5*np.cos(arc_theta), 0.5*np.sin(arc_theta), 'r-', linewidth=1.5)
    ax.text(0.6, 0.3, r'$\pi/3$', color='red', fontsize=12)
    
    # Label r
    ax.text(0.8, 1.0, 'r = 2', color='blue', fontsize=12, fontweight='bold')
    
    ax.set_xlim(-0.5, 2.5)
    ax.set_ylim(-0.5, 2.5)
    ax.set_aspect('equal')
    ax.grid(True, alpha=0.3)
    ax.set_title("Número Complejo", fontsize=14)
    
    save_plot("C21_P280_Q_ComplexNum.png")

if __name__ == "__main__":
    plot_ref_angle_210()
    plot_sine_amplitude()
    plot_law_sines()
    plot_law_cosines()
    plot_complex_number()
