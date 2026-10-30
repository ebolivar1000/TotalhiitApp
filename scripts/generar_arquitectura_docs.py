# -*- coding: utf-8 -*-
"""
Generador de documentacion tecnica de arquitectura para el ecosistema TOTALHIIT:
1. Actualiza C:\\Users\\Everth\\ProyectosIA\\MiPrimeraApp\\docs\\arquitectura.docx con la seccion 2.4 (relacion con la App Movil y GitHub).
2. Genera C:\\Users\\Everth\\ProyectosIA\\TotalhiitApp\\docs\\arquitectura_app.docx con toda la arquitectura detallada de la App / APK.
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

COLOR_MAGENTA = RGBColor(176, 0, 80)     # #B00050 (Magenta Totalhiit)
COLOR_TEXTO = RGBColor(32, 32, 32)       # #202020
COLOR_GRIS = RGBColor(100, 100, 100)     # #646464
COLOR_ROSA_BG = "FDF2F8"                 # Rosa claro para fondos
COLOR_GRIS_BG = "F4F4F5"                 # Gris claro para tablas
HEX_MAGENTA = "B00050"

def set_cell_background(cell, hex_color):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="none"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def format_paragraph(p, space_after=6, line_spacing=1.15):
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing

def add_callout(doc, text, title="NOTA IMPORTANTE", hex_bg=COLOR_ROSA_BG, hex_border=HEX_MAGENTA):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    
    cell = table.cell(0, 0)
    set_cell_background(cell, hex_bg)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    # Borde izquierdo grueso
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{hex_border}"/>
            <w:top w:val="none"/>
            <w:right w:val="none"/>
            <w:bottom w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    format_paragraph(p, space_after=2)
    run_t = p.add_run(f"📌 {title}: ")
    run_t.bold = True
    run_t.font.name = "Calibri"
    run_t.font.size = Pt(10)
    run_t.font.color.rgb = COLOR_MAGENTA
    
    run_b = p.add_run(text)
    run_b.font.name = "Calibri"
    run_b.font.size = Pt(9.5)
    run_b.font.color.rgb = COLOR_TEXTO
    
    # Espacio después del callout
    p_after = doc.add_paragraph()
    format_paragraph(p_after, space_after=4)

def actualizar_arquitectura_web():
    path_web = r"C:\Users\Everth\ProyectosIA\MiPrimeraApp\docs\arquitectura.docx"
    if not os.path.exists(path_web):
        print(f"No se encontro {path_web}")
        return
    
    doc = Document(path_web)
    
    # 1. Actualizar Tabla 0 si no tiene la fila de la App Movil
    tabla0 = doc.tables[0]
    tiene_app = any("TotalhiitApp" in c.text or "App Móvil" in c.text for r in tabla0.rows for c in r.cells)
    if not tiene_app:
        row = tabla0.add_row()
        row.cells[0].text = "App Móvil / APK (TOTALHIIT)"
        row.cells[1].text = "https://totalhiit-app.caribialabs.workers.dev (APK v1.0.3 en C:\\Users\\Everth\\ProyectosIA\\TotalhiitApp)"
        row2 = tabla0.add_row()
        row2.cells[0].text = "Relación de repositorios"
        row2.cells[1].text = "ebolivar1000/Totalhiit aloja la WEB; TotalhiitApp es repo local independiente."
        print("Fila de App Movil agregada a tabla 0 en arquitectura.docx")

    # 2. Buscar si ya existe la seccion 2.4
    tiene_sec_24 = any("2.4" in p.text and "TotalhiitApp" in p.text for p in doc.paragraphs)
    if not tiene_sec_24:
        # Buscar el final de la seccion 2.3 (parrafo 80 o donde empieza 3. Stack tecnologico)
        idx_stack = -1
        for i, p in enumerate(doc.paragraphs):
            if p.text.strip().startswith("3. Stack tecnológico"):
                idx_stack = i
                break
        
        texto_24 = (
            "TOTALHIIT opera como un ecosistema compuesto por dos proyectos complementarios pero completamente "
            "independientes en código y repositorio:\n"
            "1. Web Pública (MiPrimeraApp): Landing page oficial en https://totalhiit.pages.dev. Aloja la presentación comercial, "
            "venta del Bootcamp TOTAL+40, precios y checkout manual por WhatsApp. Está conectada al repositorio GitHub "
            "https://github.com/ebolivar1000/Totalhiit (rama main).\n"
            "2. App Móvil / APK (TotalhiitApp): Aplicación nativa y PWA en https://totalhiit-app.caribialabs.workers.dev. "
            "Aloja la experiencia de las alumnas: entrenamientos guiados en video, nutrición antiinflamatoria diaria y semanal, "
            "calculadoras metabólicas, seguimiento de hábitos y ciclo menstrual cifrado estilo Flo/Clue.\n\n"
            "¿Ambos proyectos están en el mismo repositorio de GitHub?\n"
            "RESPUESTA: NO. El repositorio https://github.com/ebolivar1000/Totalhiit contiene ÚNICAMENTE este sitio web (MiPrimeraApp). "
            "La aplicación móvil TotalhiitApp vive en C:\\Users\\Everth\\ProyectosIA\\TotalhiitApp con su propio repositorio Git local. "
            "Esta separación garantiza que la web de ventas nunca sufra caídas ni conflictos por cambios en la aplicación Android.\n\n"
            "Guía de ejecución simultánea en localhost:\n"
            "• Sitio Web (MiPrimeraApp): ejecutar 'npm run dev' desde C:\\Users\\Everth\\ProyectosIA\\MiPrimeraApp (Puerto 5173).\n"
            "• App Móvil (TotalhiitApp): ejecutar 'npm run dev' desde C:\\Users\\Everth\\ProyectosIA\\TotalhiitApp (Puerto 5174).\n"
            "Ambos proyectos tienen configurado 'strictPort: true', permitiendo modificarlos y probarlos al mismo tiempo sin colisión de puertos."
        )
        
        if idx_stack != -1:
            p_head = doc.paragraphs[idx_stack].insert_paragraph_before("2.4 Ecosistema TOTALHIIT: Relación con la App Móvil (TotalhiitApp) y Repositorios", style="Heading 2")
            p_head.runs[0].font.color.rgb = COLOR_MAGENTA
            p_desc = doc.paragraphs[idx_stack].insert_paragraph_before(texto_24, style="Normal")
            format_paragraph(p_desc, space_after=12)
            print("Sección 2.4 insertada antes de 3. Stack tecnológico en arquitectura.docx")
        else:
            p_head = doc.add_paragraph("2.4 Ecosistema TOTALHIIT: Relación con la App Móvil (TotalhiitApp) y Repositorios", style="Heading 2")
            p_desc = doc.add_paragraph(texto_24, style="Normal")

    doc.save(path_web)
    print("Guardado con exito:", path_web)

def generar_arquitectura_app():
    doc = Document()
    
    # Margenes de 1 pulgada
    for sec in doc.sections:
        sec.top_margin = Inches(1.0)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(1.0)
    
    # Portada / Titulo Principal
    p_title = doc.add_paragraph()
    format_paragraph(p_title, space_after=2)
    run_t = p_title.add_run("TOTALHIIT APP")
    run_t.font.name = "Calibri"
    run_t.font.size = Pt(28)
    run_t.bold = True
    run_t.font.color.rgb = COLOR_MAGENTA
    
    p_sub = doc.add_paragraph()
    format_paragraph(p_sub, space_after=4)
    run_s = p_sub.add_run("Documentación Técnica de Arquitectura, Aplicación Android (APK) y PWA")
    run_s.font.name = "Calibri"
    run_s.font.size = Pt(14)
    run_s.font.color.rgb = COLOR_GRIS
    run_s.bold = True

    p_desc = doc.add_paragraph()
    format_paragraph(p_desc, space_after=16)
    run_d = p_desc.add_run("Especificación integral de arquitectura local-first, código fuente, Capacitor 8, módulos funcionales, cifrado y flujos de publicación para Android, Fire OS y Web.")
    run_d.font.name = "Calibri"
    run_d.font.size = Pt(10)
    run_d.italic = True
    run_d.font.color.rgb = COLOR_GRIS

    # Tabla de resumen rapido de accesos y estado
    tbl_meta = doc.add_table(rows=7, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_meta.autofit = False
    tbl_meta.columns[0].width = Inches(2.2)
    tbl_meta.columns[1].width = Inches(4.3)
    set_table_borders(tbl_meta)
    
    datos_meta = [
        ("Proyecto / Aplicación", "TOTALHIIT App (Android APK + PWA iOS/Web)"),
        ("Versión actual", "v1.0.3 (Build 4) — 30 de Octubre de 2026"),
        ("Ruta local en PC", "C:\\Users\\Everth\\ProyectosIA\\TotalhiitApp"),
        ("Despliegue Web / PWA", "https://totalhiit-app.caribialabs.workers.dev"),
        ("Descarga directa de APK", "https://totalhiit-app.caribialabs.workers.dev/totalhiit.apk"),
        ("Panel de Administración", "Ajustes > Panel de Administración (Clave maestra: totalhiit2026)"),
        ("Repositorio GitHub", "Local independiente (Recomendado crear: ebolivar1000/TotalhiitApp)"),
    ]
    
    for i, (k, v) in enumerate(datos_meta):
        c0, c1 = tbl_meta.cell(i, 0), tbl_meta.cell(i, 1)
        set_cell_background(c0, COLOR_GRIS_BG)
        set_cell_margins(c0, 80, 80, 100, 100)
        set_cell_margins(c1, 80, 80, 100, 100)
        
        p0 = c0.paragraphs[0]
        format_paragraph(p0, space_after=0)
        r0 = p0.add_run(k)
        r0.font.name = "Calibri"
        r0.font.size = Pt(9.5)
        r0.bold = True
        
        p1 = c1.paragraphs[0]
        format_paragraph(p1, space_after=0)
        r1 = p1.add_run(v)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)

    doc.add_paragraph() # Espacio

    def add_h1(text):
        p = doc.add_paragraph()
        format_paragraph(p, space_after=6)
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(16)
        run.bold = True
        run.font.color.rgb = COLOR_MAGENTA
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        format_paragraph(p, space_after=4)
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(12)
        run.bold = True
        run.font.color.rgb = COLOR_TEXTO
        return p

    def add_p(text, bold_prefix=None, space_after=6):
        p = doc.add_paragraph()
        format_paragraph(p, space_after=space_after)
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.name = "Calibri"
            rb.font.size = Pt(10)
            rb.bold = True
            rb.font.color.rgb = COLOR_TEXTO
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = COLOR_TEXTO
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        format_paragraph(p, space_after=3)
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.name = "Calibri"
            rb.font.size = Pt(10)
            rb.bold = True
            rb.font.color.rgb = COLOR_TEXTO
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = COLOR_TEXTO
        return p

    # SECCION 1: RESUMEN EJECUTIVO
    add_h1("1. Resumen Ejecutivo")
    add_p("TOTALHIIT App es la aplicación móvil oficial de entrenamiento interactivo, nutrición antiinflamatoria, cálculo de métricas metabólicas y bienestar hormonal diseñada específicamente para mujeres mayores de 40 años.")
    add_p("A diferencia del sitio web principal (que funciona como una vitrina pública de captación y venta), la App TOTALHIIT es la herramienta interactiva de uso diario para las alumnas y suscriptoras. Permite seguir las 12 clases progresivas del Bootcamp TOTAL+40 y las 2 sesiones de estiramiento, organizar menús semanales deterministas, consultar recetas diarias, registrar el progreso corporal sin presiones y llevar el seguimiento del ciclo menstrual mediante un diseño intuitivo inspirado en Flo y Clue, con privacidad absoluta (cifrado local AES-GCM-256).")
    add_p("El proyecto se compila simultáneamente como aplicación nativa Android (APK) mediante Capacitor 8 y como Progressive Web App (PWA) instalable en iOS y navegadores modernos a través de Cloudflare Workers.")

    # SECCION 2: RELACION CON EL SITIO WEB Y REPOSITORIOS GITHUB
    add_h1("2. Ecosistema TOTALHIIT: Relación de Proyectos y Repositorios en GitHub")
    add_callout(doc, 
        "¿Ambos proyectos están en el mismo repositorio de GitHub? \n"
        "RESPUESTA DIRECTA: NO. Actualmente NO están en el mismo repositorio. "
        "El repositorio https://github.com/ebolivar1000/Totalhiit contiene EXCLUSIVAMENTE el sitio web comercial (MiPrimeraApp). "
        "Por su parte, la App móvil (TotalhiitApp) vive en un repositorio Git local independiente en C:\\Users\\Everth\\ProyectosIA\\TotalhiitApp.",
        "ACLARACIÓN CRÍTICA SOBRE GITHUB")

    add_h2("2.1 ¿Por qué están separados y cómo se vinculan a GitHub?")
    add_p("Los dos proyectos se mantienen intencionalmente separados por tres razones fundamentales de arquitectura:")
    add_bullet(" La web en https://totalhiit.pages.dev es la landing de ventas pública. Mantener la App separada asegura que cualquier compilación de Android, actualización de Capacitor o cambio de dependencias jamás rompa o altere el sitio web de producción.", "1. Aislamiento y Estabilidad: ")
    add_bullet(" Cloudflare Pages compila automáticamente la web cuando se hace 'git push' al repo Totalhiit. Si se mezclaran los códigos, Cloudflare intentaría compilar el SDK de Android, generando fallos en el pipeline.", "2. Flujos de Despliegue Diferentes: ")
    add_bullet(" La App requiere herramientas nativas (Capacitor 8, Gradle, Android SDK, Keystores) y dependencias de IndexedDB/PDF que no aplican a la landing page.", "3. Stack Tecnológico Específico: ")

    add_p("Cómo respaldar TotalhiitApp en GitHub (Paso a Paso Recomendado):", "Vinculación a GitHub: ")
    add_p("Para subir la App a GitHub sin interferir con la web, se recomienda crear un nuevo repositorio en GitHub llamado TotalhiitApp (o Totalhiit-Mobile):")
    add_bullet("1. Entrar en GitHub con tu cuenta (ebolivar1000) y hacer clic en 'New Repository'.")
    add_bullet("2. Asignar el nombre: TotalhiitApp (marcarlo como Privado).")
    add_bullet("3. En tu terminal de PowerShell, ejecutar:")
    
    p_code = doc.add_paragraph()
    format_paragraph(p_code, space_after=6)
    r_c = p_code.add_run("cd C:\\Users\\Everth\\ProyectosIA\\TotalhiitApp\n"
                         "git remote add origin https://github.com/ebolivar1000/TotalhiitApp.git\n"
                         "git branch -M main\n"
                         "git push -u origin main")
    r_c.font.name = "Consolas"
    r_c.font.size = Pt(9)
    r_c.font.color.rgb = COLOR_MAGENTA

    add_h2("2.2 Matriz de Ejecución y Puertos (Trabajar en Ambos Proyectos)")
    add_p("Ambos proyectos pueden ejecutarse al mismo tiempo en tu computadora sin ningún conflicto, ya que utilizan puertos estrictos distintos:")

    tbl_comp = doc.add_table(rows=6, cols=3)
    tbl_comp.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_comp.columns[0].width = Inches(1.8)
    tbl_comp.columns[1].width = Inches(2.4)
    tbl_comp.columns[2].width = Inches(2.3)
    set_table_borders(tbl_comp)
    
    headers_comp = ["Parámetro", "Sitio Web (MiPrimeraApp)", "App Móvil (TotalhiitApp)"]
    for j, h in enumerate(headers_comp):
        cell = tbl_comp.cell(0, j)
        set_cell_background(cell, HEX_MAGENTA)
        set_cell_margins(cell, 80, 80, 80, 80)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    filas_comp = [
        ("Directorio Local", "C:\\Users\\Everth\\ProyectosIA\\MiPrimeraApp", "C:\\Users\\Everth\\ProyectosIA\\TotalhiitApp"),
        ("Comando Dev (Local)", "npm run dev", "npm run dev"),
        ("Puerto Local (strict)", "http://localhost:5173", "http://localhost:5174"),
        ("URL de Producción", "https://totalhiit.pages.dev", "https://totalhiit-app.caribialabs.workers.dev"),
        ("Comando de Publicación", "git push origin main (o wrangler pages deploy)", "npx wrangler deploy (Web) + gradlew (APK)"),
    ]
    for i, (p0, p1, p2) in enumerate(filas_comp, start=1):
        c0, c1, c2 = tbl_comp.cell(i, 0), tbl_comp.cell(i, 1), tbl_comp.cell(i, 2)
        set_cell_background(c0, COLOR_GRIS_BG)
        set_cell_margins(c0, 60, 60, 80, 80)
        set_cell_margins(c1, 60, 60, 80, 80)
        set_cell_margins(c2, 60, 60, 80, 80)
        for c, text in [(c0, p0), (c1, p1), (c2, p2)]:
            p = c.paragraphs[0]
            format_paragraph(p, space_after=0)
            r = p.add_run(text)
            r.font.name = "Calibri"
            r.font.size = Pt(9)
            if c == c0:
                r.bold = True

    doc.add_paragraph()

    # SECCION 3: STACK TECNOLOGICO
    add_h1("3. Stack Tecnológico de la App")
    add_bullet(" React 19 + TypeScript 5.9 / 7.0 + Vite 8.3 + Tailwind CSS 4.3 + React Router 8 (v7.9).", "Frontend: ")
    add_bullet(" Dexie 4.0 (wrapper de IndexedDB de alto rendimiento con 7 versiones de esquemas). Permite que la app funcione 100% sin conexión a internet.", "Persistencia Local-First: ")
    add_bullet(" Capacitor 8.6 (@capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/filesystem, @capacitor/share). Genera el puente nativo para Android y tablets.", "Capa Nativa Móvil: ")
    add_bullet(" pdf-lib (cargado en chunk diferido). Genera planes de comidas y recetas en PDF A4 con marca de agua oficial y tablas nutricionales.", "Generación de Documentos: ")
    add_bullet(" WebCrypto API estándar (AES-GCM de 256 bits + derivación de claves PBKDF2 con 100.000 iteraciones). Los datos del ciclo menstrual se guardan cifrados.", "Criptografía Zero-Knowledge: ")
    add_bullet(" Vitest 5.0 (25 suites de prueba, 196 pruebas unitarias automáticas).", "Testing y Calidad: ")
    add_bullet(" OpenJDK 21 Temurin / Microsoft JDK + Android SDK 36 (targetSdkVersion 36, minSdkVersion 24) + Gradle 8.14.3.", "Toolchain Android: ")
    add_bullet(" Cloudflare Workers (servidor de assets estáticos ultrarrápido, manifest version.json y hosting del instalador totalhiit.apk).", "Infraestructura Cloud: ")

    # SECCION 4: ESTRUCTURA DEL REPOSITORIO
    add_h1("4. Estructura del Repositorio y Rutas Principales")
    add_p("Organización de carpetas en TotalhiitApp:")
    
    arbol = (
        "TotalhiitApp/\n"
        "├── android/                 # Proyecto nativo Gradle de Android (Capacitor)\n"
        "│   ├── app/build.gradle    # Configuración de SDK (min 24, target 36), versionCode 4, versionName 1.0.3\n"
        "│   └── app/src/main/res/   # Iconos oficiales adaptativos de TOTALHIIT (mipmap mdpi a xxxhdpi)\n"
        "├── public/                  # Archivos estáticos servidos directamente\n"
        "│   ├── _headers            # Políticas de caché (no-cache para version.json y totalhiit.apk)\n"
        "│   ├── version.json        # Manifiesto de actualización in-app\n"
        "│   ├── totalhiit.apk       # Archivo APK compilado listo para descarga\n"
        "│   ├── images/             # Banners fotográficos temáticos y assets de Valentina\n"
        "│   └── videos/             # Video en bucle de portada y entrenamientos\n"
        "├── src/                     # Código fuente de la aplicación\n"
        "│   ├── componentes/        # Componentes UI reutilizables (BannerSeccion, ReproductorVideo, ui.tsx)\n"
        "│   ├── hooks/              # Custom hooks (usePerfil, useSuscripcion, useConexion)\n"
        "│   ├── lib/                # Lógica pura de negocio y utilidades\n"
        "│   │   ├── admin/          # Servicio de administración y anuncios\n"
        "│   │   ├── auth/           # Autenticación local-first e identidades\n"
        "│   │   ├── ciclo/          # Estimaciones de ciclo, fases (Flo/Clue) y cifrado AES-GCM\n"
        "│   │   ├── datos/          # Base de datos Dexie (db.ts) y repositorio de datos\n"
        "│   │   ├── entrenamiento/  # Catálogo de 14 sesiones, filtros y favoritos\n"
        "│   │   ├── nutricion/      # Catálogo de recetas, motor de alérgenos, compras y PDF\n"
        "│   │   ├── progreso/       # Métricas de rachas, promedios y recomendaciones\n"
        "│   │   ├── salud/          # Calculadoras BMR, TDEE, agua, proteína e IMC\n"
        "│   │   └── version/        # Módulo de comprobación remota de actualizaciones\n"
        "│   ├── paginas/            # Pantallas de la aplicación (Inicio, Entrenamientos, Nutricion, Plan, etc.)\n"
        "│   └── App.tsx             # Enrutador principal y layout general\n"
        "├── scripts/                 # Scripts de utilidad (generar keystore, optimizar imágenes)\n"
        "├── docs/                    # Documentación técnica del proyecto\n"
        "├── capacitor.config.ts      # Configuración de Capacitor (ID: com.totalhiit.app)\n"
        "├── vite.config.ts           # Configuración de Vite (puerto 5174, PWA Workbox)\n"
        "└── wrangler.jsonc           # Configuración de despliegue en Cloudflare Workers"
    )
    p_arb = doc.add_paragraph()
    format_paragraph(p_arb, space_after=8)
    r_arb = p_arb.add_run(arbol)
    r_arb.font.name = "Consolas"
    r_arb.font.size = Pt(8.5)

    # SECCION 5: MODULOS FUNCIONALES
    add_h1("5. Módulos Funcionales de la Aplicación")
    
    add_h2("5.1 Inicio y Dashboard Principal (/)")
    add_p("Presenta el estado general de la alumna: banner Hero con video en bucle de Valentina (intro-totalhiit.mp4), tablón de anuncios administrativos (promociones o novedades de la versión), acceso a su plan semanal y tarjetas temáticas con acceso directo a Salud, Entrenamientos, Nutrición, Progreso y Ciclo Menstrual. El llamado a descargar el APK se oculta automáticamente si la usuaria ya abrió la app instalada.")

    add_h2("5.2 Módulo de Entrenamientos en Video (/entrenamientos)")
    add_p("Catálogo estructurado del programa TOTAL+40 compuesto por 12 clases progresivas y 2 clases de estiramiento. Características:")
    add_bullet(" Arriba muestra la insignia 'Coach Valentina' y en la base el resumen de las 14 clases.", "Banner visual limpio: ")
    add_bullet(" Pestañas dedicadas para Semana 1, Semana 2, Semana 3, Semana 4, Estiramientos o Todas.", "Filtro por Semanas: ")
    add_bullet(" Clases 0 y 1 de acceso libre. El resto muestra candado informativo para suscriptoras activas.", "Modo Demostración: ")
    add_bullet(" Portada de alta definición, badge de tiempo y apertura compatible con cuentas Google (@gmail.com) para visualizar videos privados en YouTube sin errores en tablets Fire.", "Reproductor Optimizado: ")

    add_h2("5.3 Módulo de Nutrición Antiinflamatoria (/nutricion)")
    add_p("Pestaña dual de consulta:")
    add_bullet(" Muestra en una sola pantalla las 4 comidas que tocan el día de hoy (Desayuno, Almuerzo, Cena, Snack) con calorías, proteína y tiempo de cocción, rotando automáticamente cada día de la semana.", "☀️ Recetas para hoy: ")
    add_bullet(" Biblioteca completa de 12 recetas antiinflamatorias con buscador por ingrediente ('¿qué tienes en casa?'), filtros por categoría y favoritos.", "📚 Catálogo completo: ")

    add_h2("5.4 Planificador Semanal y Compras (/plan)")
    add_p("Menú estructurado de 7 días (lunes a domingo) con 4 comidas por día. Diseñado con carga inmediata garantizada (nunca en blanco). Permite regenerar la semana, reemplazar platos puntuales, consolidar la lista de compras exacta según porciones familiares y descargar el plan en formato PDF A4 listo para imprimir.")

    add_h2("5.5 Ciclo Menstrual y Bienestar Hormonal (/ciclo) — Estilo Flo / Clue")
    add_p("Módulo completamente rediseñado inspirado en las aplicaciones líderes de fertilidad y ciclo:")
    add_bullet(" Muestra el día exacto del ciclo, el nombre de la fase fisiológica (Fase Menstrual, Folicular, Ovulatoria o Lútea), barra de progreso continuo de las 4 semanas y recomendación física.", "Hero Card '¿En qué semana estás hoy?': ")
    add_bullet(" Botón directo '▶️ Ir a videos de la Semana X' que abre entrenamientos preseleccionando la semana adecuada a su energía hormonal.", "Vinculación con Entrenamientos: ")
    add_bullet(" Próximo período con cuenta regresiva ('Faltan X días', 'Hoy'), duración promedio y variación habitual (± X días).", "Panel de Métricas Rápidas: ")
    add_bullet(" Tarjetas ordenadas cronológicamente mes a mes con duración del ciclo y etiqueta de regularidad.", "Seguimiento Mes a Mes: ")
    add_bullet(" Los datos íntimos (flujo, síntomas, notas) se cifran localmente con AES-GCM antes de guardarse en IndexedDB.", "Privacidad Estricta: ")

    add_h2("5.6 Salud, Progreso y Administración")
    add_bullet(" Calculadoras de BMR (Mifflin-St Jeor), TDEE por nivel de actividad, ingesta hídrica, proteína óptima y medidor visual de IMC con rangos de peso saludable.", "/salud: ")
    add_bullet(" Registro diario voluntario de hábitos (peso, energía, ánimo, sueño, agua), racha de días activos y gráficos de tendencia sin dependencias externas pesadas.", "/progreso: ")
    add_bullet(" Protegido por clave maestra (totalhiit2026). Permite activar correos suscriptores (@gmail.com) para desbloquear el catálogo completo, publicar anuncios y cambiar o recuperar la contraseña.", "/admin: ")
    add_bullet(" Ajustes de sincronización en la nube, privacidad, botón de cierre de sesión y comprobador de actualizaciones nativas.", "/ajustes: ")
    add_bullet(" Política de privacidad oficial pública requerida para tiendas (Amazon Appstore y Google Play).", "/privacidad: ")

    # SECCION 6: PERSISTENCIA Y CRIPTOGRAFIA
    add_h1("6. Arquitectura de Datos (Dexie IndexedDB v7)")
    add_p("La base de datos local 'TotalhiitDB' opera con 11 almacenes estructurados:")
    add_bullet(" perfiles, objetivos, preferencias, consentimientos (versión 1)", "Cuentas y Biometría: ")
    add_bullet(" sesiones (historial de entrenamiento), favoritos (sesiones y recetas) (versión 2)", "Actividad Deportiva: ")
    add_bullet(" preparaciones (recetas preparadas con contador de veces) (versión 3)", "Nutrición: ")
    add_bullet(" entradasDiario (peso, sueño, hidratación, notas diarias) (versión 4)", "Hábitos Diarios: ")
    add_bullet(" ciclo (registros íntimos con payload cifrado AES-GCM) (versión 5)", "Ciclo Menstrual: ")
    add_bullet(" planes (menús semanales de 7 días por usuario) (versión 6)", "Planes Semanales: ")
    add_bullet(" suscriptores (correos autorizados con plan activo), anuncios (avisos y promociones) (versión 7)", "Administración: ")

    # SECCION 7: ANDROID Y AMAZON APPSTORE
    add_h1("7. Compilación Nativa Android y Validación Amazon Appstore")
    add_h2("7.1 Flujo de Compilación del APK")
    add_p("Para compilar el archivo instalable de Android se ejecuta la siguiente cadena de comandos:")
    
    p_apk = doc.add_paragraph()
    format_paragraph(p_apk, space_after=6)
    r_apk = p_apk.add_run(
        "$env:JAVA_HOME = \"C:\\Program Files\\Microsoft\\jdk-21.0.13.21-hotspot\"\n"
        "$env:ANDROID_HOME = \"C:\\Users\\Everth\\AppData\\Local\\Android\\Sdk\"\n"
        "cd C:\\Users\\Everth\\ProyectosIA\\TotalhiitApp\n"
        "npm run build\n"
        "npx cap sync android\n"
        "cd android; .\\gradlew.bat assembleDebug"
    )
    r_apk.font.name = "Consolas"
    r_apk.font.size = Pt(9)
    r_apk.font.color.rgb = COLOR_MAGENTA

    add_p("El archivo resultante se ubica en android/app/build/outputs/apk/debug/app-debug.apk (~18,6 MB) y se copia automáticamente a public/totalhiit.apk y dist/totalhiit.apk para su descarga.")

    add_h2("7.2 Cumplimiento de Políticas de Amazon Appstore")
    add_bullet(" La app no tiene dependencias duras de bibliotecas propietarias de Google Play Services (causa principal de rechazos en Amazon). Funciona de forma nativa en tablets Amazon Fire (Fire 7, HD 8, HD 10, Max 11).", "Compatibilidad Fire OS: ")
    add_bullet(" Configurada en targetSdkVersion = 36 y minSdkVersion = 24 (superando el mínimo exigido de SDK 34).", "Nivel de API: ")
    add_bullet(" Solo solicita INTERNET y ACCESS_NETWORK_STATE. No accede a contactos, SMS, cámara ni ubicación.", "Permisos Mínimos: ")
    add_bullet(" Disponible en https://totalhiit-app.caribialabs.workers.dev/privacidad.", "Política de Privacidad Pública: ")
    add_bullet(" Botón 'Borrar mis datos' visible y operativo en /ajustes (purga IndexedDB y storage local).", "Eliminación de Datos: ")
    add_bullet(" Credenciales de prueba para el revisor: caribialabs@gmail.com / clave admin: totalhiit2026.", "Instrucciones de Revisión: ")

    # SECCION 8: ACTUALIZACIONES Y MANTENIMIENTO
    add_h1("8. Mantenimiento y Actualizaciones In-App")
    add_p("La aplicación cuenta con un actualizador automático sin desinstalación:")
    add_bullet(" Al descargar e instalar un nuevo APK, Android detecta la misma firma y preserva intactos todos los registros locales de IndexedDB (datos de ciclo, peso, favoritos y preferencias). La usuaria jamás debe desinstalar la app.", "1. Conservación de Datos: ")
    add_bullet(" El archivo public/version.json define la versión remota. Al subir versionCode y versionName en build.gradle, la app avisa a las usuarias en Ajustes con el botón 'Descargar e instalar nueva versión'.", "2. Manifiesto Remoto: ")
    add_bullet(" Servido con encabezados 'max-age=0, no-cache' en Cloudflare para garantizar que las descargas siempre entreguen el archivo más reciente.", "3. Descarga Inmediata: ")

    # SECCION 9: GLOSARIO
    add_h1("9. Glosario Técnico")
    add_bullet(" Entorno nativo multiplataforma que envuelve la aplicación web dentro de un WebView de alto rendimiento para Android e iOS.", "Capacitor: ")
    add_bullet(" Enfoque de desarrollo donde todos los datos se procesan y almacenan en el dispositivo local, garantizando funcionamiento autónomo sin conexión.", "Local-First: ")
    add_bullet(" Estándar de cifrado simétrico autenticado que protege la confidencialidad e integridad de la información médica o íntima.", "AES-GCM: ")
    add_bullet(" Sistema operativo de las tablets Amazon Kindle Fire basado en Android Open Source Project (AOSP), sin servicios de Google.", "Fire OS: ")
    add_bullet(" Formato de paquete instalable de aplicaciones para el sistema operativo Android.", "APK: ")

    path_app = r"C:\Users\Everth\ProyectosIA\TotalhiitApp\docs\arquitectura_app.docx"
    doc.save(path_app)
    print("Documento arquitectura_app.docx generado exitosamente en:", path_app)

if __name__ == '__main__':
    print("Iniciando actualizacion y generacion de documentos...")
    actualizar_arquitectura_web()
    generar_arquitectura_app()
    print("Proceso completado exitosamente.")
