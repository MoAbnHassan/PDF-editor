# Onyx PDF Editor

Onyx is a high-performance, dark-themed, browser-based PDF editor designed for technical workflows and structured note-taking. Built with **React 19**, **TypeScript**, and **Tailwind CSS**, it features a sophisticated canvas engine that combines SVG graphics with rich text capabilities.

![Onyx Editor Preview](
<img src="Screenshot 2026-01-19 140627.png">

## 🚀 Key Features

### 📄 Page & Layout Management
- **Infinite Canvas:** Smooth scrolling viewport with zoom controls (25% - 200%).
- **Smart Page Setup:** Custom page sizes (A4, A5, Letter), orientation switching, and precise margin controls.
- **Notebook Mode:** A "Snap-to-Grid" toggle that renders ruled lines and forces text/objects to align perfectly, mimicking a physical notebook.
- **Pagination:** Drag-and-drop page reordering, duplication, and automatic page numbering.

### ✍️ Advanced Text Editing
- **Hybrid Rendering:** Uses SVG `foreignObject` to embed a powerful Rich Text Editor (Tiptap) directly onto the canvas.
- **Strict Overflow Handling:** Text boxes enforce hard limits preventing content from spilling outside page boundaries.
- **Body Text vs. Floating Text:** 
  - **Body Text:** A fixed main writing area that resizes dynamically with margins.
  - **Floating Text:** Draggable text boxes for annotations and labels.
- **Formatting Tools:** Full control over font family, size, alignment (including justify), bold/italic, and colors via a floating context menu.

### 🎨 Drawing & Shapes
- **Vector Tools:** Add Rectangles, Circles, Lines, and Arrows.
- **Freehand Drawing:** Pen and Brush tools using SVG path rendering.
- **Smart Positioning:** Toggle between **"Snap to Line"** (for structured layouts) and **"Free Movement"** (pixel-perfect placement).
- **Layer Management:** Reorder elements (Bring to Front/Send to Back) and control opacity.

### 💾 Import & Export
- **PDF Generation:** Client-side PDF generation using `jspdf`, preserving vector quality and text alignment.
- **PDF Import:** Parse existing PDF documents into editable canvas pages using `pdfjs-dist`.

## 🛠 Tech Stack

- **Core:** React 19, TypeScript, Vite.
- **State Management:** Zustand (for high-performance canvas state updates).
- **Styling:** Tailwind CSS (Dark Mode first).
- **Rich Text:** Tiptap (Headless wrapper around ProseMirror).
- **PDF Engines:** `jspdf` (Export) & `pdfjs-dist` (Import).
- **Icons:** Lucide React.

## 📦 Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/onyx-pdf-editor.git
   cd onyx-pdf-editor 



### نصائح إضافية لـ GitHub:

1.  **لقطة الشاشة (Screenshot):** في السطر 6، قمت بوضع رابط صورة مؤقت (`placeholder`). يفضل جداً أن تأخذ "سكرين شوت" حقيقية للتطبيق وهو يعمل (بوضع الـ Dark Mode) وترفعها في مجلد بالمشروع وتستبدل الرابط، لأن الصور تجذب الانتباه أكثر من النص.
2.  **الشعار (Logo):** إذا كان لديك شعار بسيط، ضعه في أعلى الملف.
3.  **العنوان:** تأكد من تغيير `yourusername` في قسم التثبيت إلى اسم حسابك الحقيقي على GitHub.
