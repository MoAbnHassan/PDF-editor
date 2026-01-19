
export type ElementType = 'text' | 'rect' | 'circle' | 'image' | 'line' | 'path';

export interface PDFElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity: number;
  rotation: number;
  
  // Positioning Mode
  snapToGrid?: boolean; // If true, snaps to lines/grid. If false, free movement.
  
  // Special flags
  isBody?: boolean; // Identifies the main content text block of a page

  // Text specific (Rich Text Engine)
  text?: string; // Legacy / Plain text fallback
  htmlContent?: string; // HTML content for WYSIWYG
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  align?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number; 
  letterSpacing?: number; 
  
  // Image specific
  src?: string;
  lockAspectRatio?: boolean;
  
  // Path specific (Drawing)
  points?: string[]; 
  pathData?: string; 
}

export interface PageMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PageNumbering {
  enabled: boolean;
  position: 'bottom-center' | 'bottom-right' | 'top-right' | 'top-center';
  startFrom: number;
  format: '1' | '1/n' | '- 1 -';
}

export interface PDFPage {
  id: string;
  elements: string[]; 
  width: number; 
  height: number; 
  background: string;
  backgroundImage?: string; 
  orientation: 'portrait' | 'landscape';
  margins: PageMargins; // New: Physical margins
}

export interface AppState {
  pages: PDFPage[];
  elements: Record<string, PDFElement>; 
  activePageId: string;
  selectedElementIds: string[];
  zoom: number;
  
  // Global Settings
  pageNumbering: PageNumbering;
  
  // Grid / Structured Mode
  isGridEnabled: boolean; 
  gridSize: number; 
  
  // Tool State
  isDrawing: boolean;
  drawingTool: 'pen' | 'brush' | 'eraser' | null;
  
  // Actions
  addPage: () => void;
  duplicatePage: (id: string) => void;
  removePage: (id: string) => void;
  updatePage: (id: string, updates: Partial<PDFPage>) => void;
  selectPage: (id: string) => void;
  reorderPages: (dragIndex: number, hoverIndex: number) => void;
  setPageNumbering: (config: Partial<PageNumbering>) => void;
  setPages: (pages: PDFPage[]) => void;
  
  addElement: (pageId: string, type: ElementType) => void;
  updateElement: (id: string, updates: Partial<PDFElement>) => void;
  removeElement: (id: string) => void;
  
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  setZoom: (zoom: number) => void;
  setGridSettings: (enabled: boolean, size?: number) => void;
  
  setDrawingMode: (tool: 'pen' | 'brush' | 'eraser' | null) => void;
  moveElementLayer: (id: string, direction: 'up' | 'down' | 'front' | 'back') => void;
}
