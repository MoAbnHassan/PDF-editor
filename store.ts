
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppState, PDFPage, PDFElement, ElementType } from './types';
import { A4_HEIGHT, A4_WIDTH } from './constants';

const DEFAULT_MARGINS = { top: 60, bottom: 60, left: 60, right: 60 }; 
const DEFAULT_GRID_SIZE = 24; 

const generatePageWithBody = (overrides?: Partial<PDFPage>) => {
  const pageId = uuidv4();
  const bodyId = uuidv4();
  
  const width = overrides?.width || A4_WIDTH;
  const height = overrides?.height || A4_HEIGHT;
  const margins = overrides?.margins || DEFAULT_MARGINS;

  const bodyElement: PDFElement = {
    id: bodyId,
    type: 'text',
    isBody: true,
    x: margins.left,
    y: margins.top,
    width: width - margins.left - margins.right,
    height: height - margins.top - margins.bottom,
    text: '',
    htmlContent: '<p></p>',
    fontSize: 12,
    fontFamily: 'Inter',
    fill: '#000000',
    align: 'left',
    verticalAlign: 'top',
    lineHeight: 2, 
    opacity: 1,
    rotation: 0,
    snapToGrid: true // Body always snaps technically, but fixed position
  };

  const page: PDFPage = {
    id: pageId,
    elements: [bodyId],
    width,
    height,
    background: '#ffffff',
    orientation: 'portrait',
    margins,
    ...overrides
  };

  return { page, bodyElement };
};

const createElement = (type: ElementType, gridSize: number = 24): PDFElement => {
  const base = {
    id: uuidv4(),
    type,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    opacity: 1,
    rotation: 0,
    fill: type === 'text' ? '#000000' : '#333333',
    snapToGrid: true // Default to snapped for cleanliness, user can toggle to free
  };

  if (type === 'text') {
    return {
      ...base,
      x: 0, y: 0,
      text: 'New Text',
      htmlContent: '<p>New Text</p>',
      fontSize: 12,
      fontFamily: 'Inter',
      width: 300,
      height: gridSize * 2, 
      fill: '#000000',
      align: 'left',
      verticalAlign: 'top',
      lineHeight: 2,
      letterSpacing: 0
    };
  }
  
  if (type === 'rect' || type === 'circle' || type === 'image') {
    return { ...base, width: gridSize * 4, height: gridSize * 4, fill: '#525252' };
  }

  if (type === 'line') {
    return { 
      ...base, 
      width: gridSize * 5, 
      height: 2, 
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    };
  }

  if (type === 'path') {
    return {
        ...base,
        width: 0, height: 0,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
        pathData: ''
    };
  }

  return base;
};

// Initial State Setup
const { page: initialPage, bodyElement: initialBody } = generatePageWithBody();

export const useStore = create<AppState>((set, get) => ({
  pages: [initialPage],
  elements: { [initialBody.id]: initialBody },
  activePageId: initialPage.id,
  selectedElementIds: [],
  zoom: 1, // Start at 100%
  
  pageNumbering: {
    enabled: true,
    position: 'bottom-center',
    startFrom: 1,
    format: '1'
  },
  
  isGridEnabled: false, 
  gridSize: DEFAULT_GRID_SIZE,

  isDrawing: false,
  drawingTool: null,

  addPage: () => set((state) => {
    const lastPage = state.pages[state.pages.length - 1];
    const { page, bodyElement } = generatePageWithBody({
        width: lastPage.width,
        height: lastPage.height,
        margins: lastPage.margins
    });

    return { 
      pages: [...state.pages, page],
      elements: { ...state.elements, [bodyElement.id]: bodyElement },
      activePageId: page.id
    };
  }),

  // New action to support pagination flow
  addPageAfter: (afterPageId: string) => set((state) => {
    const pageIndex = state.pages.findIndex(p => p.id === afterPageId);
    if (pageIndex === -1) return state;

    // Check if next page exists and has space? 
    // For now, simple logic: insert new blank page
    const sourcePage = state.pages[pageIndex];
     const { page, bodyElement } = generatePageWithBody({
        width: sourcePage.width,
        height: sourcePage.height,
        margins: sourcePage.margins
    });

    const newPages = [...state.pages];
    newPages.splice(pageIndex + 1, 0, page);

    return {
        pages: newPages,
        elements: { ...state.elements, [bodyElement.id]: bodyElement },
        activePageId: page.id // Focus new page
    };
  }),

  duplicatePage: (id) => set((state) => {
    const pageIndex = state.pages.findIndex(p => p.id === id);
    if (pageIndex === -1) return state;
    
    const sourcePage = state.pages[pageIndex];
    const newPageId = uuidv4();
    
    const newElementIds: string[] = [];
    const newElementsMap: Record<string, PDFElement> = {};
    
    sourcePage.elements.forEach(elId => {
        const el = state.elements[elId];
        if (el) {
            const newElId = uuidv4();
            newElementIds.push(newElId);
            newElementsMap[newElId] = { ...el, id: newElId };
        }
    });

    const newPage: PDFPage = {
        ...sourcePage,
        id: newPageId,
        elements: newElementIds
    };
    
    const newPages = [...state.pages];
    newPages.splice(pageIndex + 1, 0, newPage);
    
    return {
        pages: newPages,
        elements: { ...state.elements, ...newElementsMap },
        activePageId: newPageId
    };
  }),

  removePage: (id) => set((state) => {
    if (state.pages.length <= 1) return state;
    const newPages = state.pages.filter(p => p.id !== id);
    const pageToRemove = state.pages.find(p => p.id === id);
    const newElements = { ...state.elements };
    if (pageToRemove) {
        pageToRemove.elements.forEach(elId => delete newElements[elId]);
    }

    return {
      pages: newPages,
      elements: newElements,
      activePageId: state.activePageId === id ? newPages[0].id : state.activePageId
    };
  }),

  updatePage: (id, updates) => set((state) => {
      // 1. Update the page itself
      const newPages = state.pages.map(p => p.id === id ? { ...p, ...updates } : p);
      
      // 2. Check if we need to update the Body Element (Margins/Size changed)
      let newElements = { ...state.elements };
      
      if (updates.margins || updates.width || updates.height) {
          const updatedPage = newPages.find(p => p.id === id);
          if (updatedPage) {
              const bodyId = updatedPage.elements.find(eid => state.elements[eid]?.isBody);
              if (bodyId) {
                 const bodyEl = state.elements[bodyId];
                 newElements[bodyId] = {
                     ...bodyEl,
                     x: updatedPage.margins.left,
                     y: updatedPage.margins.top,
                     width: updatedPage.width - updatedPage.margins.left - updatedPage.margins.right,
                     height: updatedPage.height - updatedPage.margins.top - updatedPage.margins.bottom
                 };
              }
          }
      }
      return { pages: newPages, elements: newElements };
  }),

  selectPage: (id) => set({ activePageId: id, selectedElementIds: [] }),

  reorderPages: (dragIndex, hoverIndex) => set((state) => {
    const newPages = [...state.pages];
    const [movedPage] = newPages.splice(dragIndex, 1);
    newPages.splice(hoverIndex, 0, movedPage);
    return { pages: newPages };
  }),

  setPageNumbering: (config) => set((state) => ({
    pageNumbering: { ...state.pageNumbering, ...config }
  })),

  setPages: (newPagesData) => set((state) => {
     return {
         pages: [],
         elements: {},
     };
  }),

  addElement: (pageId, type) => set((state) => {
    const newEl = createElement(type, state.gridSize);
    
    const page = state.pages.find(p => p.id === pageId);
    if (!page) return state;

    if (state.isGridEnabled) {
        newEl.x = Math.round(page.margins.left / state.gridSize) * state.gridSize;
        newEl.y = Math.round(page.margins.top / state.gridSize) * state.gridSize + (state.gridSize * 2);
        
        if (type !== 'text') {
             newEl.x = Math.round(100 / state.gridSize) * state.gridSize;
             newEl.y = Math.round(100 / state.gridSize) * state.gridSize;
        }
    } else {
        newEl.x = 100;
        newEl.y = 100;
    }

    const pageIndex = state.pages.findIndex(p => p.id === pageId);
    const newPages = [...state.pages];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      elements: [...newPages[pageIndex].elements, newEl.id]
    };

    return {
      pages: newPages,
      elements: { ...state.elements, [newEl.id]: newEl },
      selectedElementIds: [newEl.id],
      isDrawing: false,
      drawingTool: null
    };
  }),

  updateElement: (id, updates) => set((state) => ({
    elements: {
      ...state.elements,
      [id]: { ...state.elements[id], ...updates }
    }
  })),

  removeElement: (id) => set((state) => {
    if (state.elements[id]?.isBody) return state;

    const { [id]: removed, ...remainingElements } = state.elements;
    const newPages = state.pages.map(p => ({
      ...p,
      elements: p.elements.filter(eid => eid !== id)
    }));
    return {
      elements: remainingElements,
      pages: newPages,
      selectedElementIds: state.selectedElementIds.filter(sid => sid !== id)
    };
  }),

  selectElement: (id, multi) => set((state) => ({
    selectedElementIds: multi 
      ? (state.selectedElementIds.includes(id) 
          ? state.selectedElementIds.filter(sid => sid !== id) 
          : [...state.selectedElementIds, id])
      : [id]
  })),

  clearSelection: () => set({ selectedElementIds: [] }),

  setZoom: (zoom) => set({ zoom }),
  
  setGridSettings: (enabled, size) => set(state => ({
      isGridEnabled: enabled,
      gridSize: size || state.gridSize
  })),

  setDrawingMode: (tool) => set({ 
    isDrawing: tool !== null, 
    drawingTool: tool,
    selectedElementIds: [] 
  }),

  moveElementLayer: (id, direction) => set((state) => {
    const page = state.pages.find(p => p.elements.includes(id));
    if (!page) return state;

    const oldElements = [...page.elements];
    const index = oldElements.indexOf(id);
    if (index === -1) return state;

    if (direction === 'up' && index < oldElements.length - 1) {
        [oldElements[index], oldElements[index + 1]] = [oldElements[index + 1], oldElements[index]];
    } else if (direction === 'down' && index > 0) {
        [oldElements[index], oldElements[index - 1]] = [oldElements[index - 1], oldElements[index]];
    } else if (direction === 'front') {
        oldElements.splice(index, 1);
        oldElements.push(id);
    } else if (direction === 'back') {
        oldElements.splice(index, 1);
        oldElements.unshift(id);
    }

    const newPages = state.pages.map(p => p.id === page.id ? { ...p, elements: oldElements } : p);
    return { pages: newPages };
  }),

}));
