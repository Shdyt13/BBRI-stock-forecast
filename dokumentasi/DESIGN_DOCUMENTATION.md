# Design Documentation - Sistem Prediksi Saham BBRI

## Overview
Dokumen ini menjelaskan implementasi desain visual berdasarkan referensi gambar yang diberikan untuk aplikasi Sistem Prediksi Saham BBRI.

## Design System Implementation

### 🎨 Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary Dark Blue | `#100b72` | Sidebar background, primary buttons, table headers |
| Accent Blue | `#5c56b6` | Active menu state, chart lines, highlights |
| Light Gray | `#cccccc` | Background color untuk content area |
| Background Gray | `#d1d1d1` | Main content background |
| White | `#ffffff` | Card containers, table backgrounds |
| Success Green | `#22c55e` | Success indicators, icons |
| Danger Red | `#ff4444` | Prediction lines, alerts |

### 📐 Layout Structure

#### Sidebar
- **Width**: 280px (fixed)
- **Height**: 100vh
- **Background**: `#100b72`
- **Position**: Fixed left
- **Features**:
  - Logo BRI di bagian atas
  - Navigation menu dengan 5 items
  - Active state menggunakan `#5c56b6` dengan left border putih 4px

#### Main Content Area
- **Margin Left**: 280px (offset dari sidebar)
- **Background**: `#d1d1d1`
- **Padding**: 32px (2rem)
- **Features**:
  - White container dengan border-radius 32px
  - Min-height: calc(100vh - 4rem)
  - Shadow minimal

### 🔤 Typography

```css
Font Family: 'Inter', 'Roboto', 'Poppins', sans-serif
```

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| H1 (Page Title) | 36px (2.25rem) | Bold (700) | `#100b72` |
| H2 (Section Title) | 24px (1.5rem) | Semibold (600) | `#100b72` |
| H3 (Card Header) | 18px (1.125rem) | Semibold (600) | White/Dark |
| Body Text | 16px (1rem) | Regular (400) | `#374151` |
| Large Numbers | 48px (3rem) | Bold (700) | `#100b72` |

### 📦 Components

#### 1. Sidebar Navigation
```jsx
- Fixed width: 280px
- Logo section dengan padding 24px
- Menu items dengan hover dan active states
- Active state: background #5c56b6 + left border 4px white
```

#### 2. File Upload Component
```jsx
- Border: 2px dashed #100b72
- Padding: 32px (2rem)
- Border-radius: 16px
- Background: gray-50
- Icon: Upload (lucide-react)
- Button: Rounded-full, bg #100b72
```

#### 3. Date Range Card
```jsx
- Border: 2px solid black
- Border-radius: 16px
- Padding: 24px
- Background: white
- Text: Bold, centered, xl size
```

#### 4. Data Summary Card
```jsx
- Background: gray-300
- Border: 1px solid gray-400
- Border-radius: 16px
- Padding: 32px
- Label: #100b72, semibold, 2xl
- Value: Black, bold, 5xl
```

#### 5. Feature Table
```jsx
Header:
- Background: #100b72
- Text: White, semibold
- Padding: 12px 16px

Body:
- Background: White
- Border-bottom: gray-200
- Icons: CheckCircle2 (blue) / MinusCircle (blue)
```

#### 6. Model Evaluation Cards
```jsx
Header:
- Background: #100b72
- Text: White, semibold
- Text-align: center

Body:
- 3 columns dengan divider vertikal
- Metrics: Large bold numbers (#100b72)
- Labels: Small gray text
```

## 📊 Chart Implementations

### Line/Area Chart (SVR & RF Prediction)
```javascript
Library: Recharts
Type: AreaChart + Line (dashed for prediction)
Features:
- Area fill dengan gradient (#5c56b6)
- Dashed line untuk forecast (#ff4444)
- X-axis: Rotated -45 degrees
- Y-axis: Formatted currency
- Tooltip dengan format Rupiah
- Legend dengan icons
```

### Horizontal Bar Chart (Feature Importance)
```javascript
Library: Recharts
Type: BarChart (horizontal)
Features:
- Bars: #100b72 dengan rounded corners
- X-axis: 0.00 to 0.35 scale
- Y-axis: Feature names
- Grid: Vertical only
```

### Grouped Bar Chart (Model Comparison)
```javascript
Library: Recharts
Type: BarChart (grouped)
Features:
- SVR bars: #100b72
- RF bars: #5c56b6
- Rounded top corners
- Values displayed on hover
```

### Multi-line Chart (Comparison)
```javascript
Library: Recharts
Type: LineChart (3 lines)
Features:
- Actual data: Solid #5c56b6 (thick)
- SVR prediction: Dashed #100b72
- RF prediction: Dashed #ff4444
- All with dot markers
```

## 📱 Page-Specific Designs

### 1. Dashboard
**Layout**: 2-column grid system
- Upload section: 2 cards side-by-side
- Date range: 2 cards side-by-side
- Data summary: 2 large cards side-by-side

### 2. SVR Prediction & RF Prediction
**Layout**: Vertical stack
- Header (centered)
- Upload section (2 columns)
- Full-width action button
- Chart container (full-width)

### 3. Feature Selection
**Layout**: Grid system
- Top row: 3 cards (equal width)
- Bottom row: 2 sections (50-50 split)
  - Left: Table
  - Right: Horizontal bar chart

### 4. Model Evaluation
**Layout**: Complex grid
- Header (centered)
- Model cards: 2 columns
- Middle section: 2 columns (chart + summary)
- Bottom: Full-width comparison chart

## 🎯 Pixel-Perfect Details

### Border Radius Standards
- Small elements: 8px
- Medium cards: 16px
- Large containers: 24-32px
- Buttons: 16px
- Full rounded: 9999px (pill-shaped)

### Spacing System (Tailwind)
```
gap-4: 16px
gap-6: 24px
gap-8: 32px
p-4: 16px padding
p-6: 24px padding
p-8: 32px padding
p-10: 40px padding
```

### Shadows
```css
shadow-sm: Minimal shadow untuk cards
hover states: Subtle transition
```

## 🔄 Interactive States

### Buttons
```css
Default: bg-[#100b72]
Hover: bg-[#5c56b6]
Transition: 200ms ease
```

### Navigation Menu
```css
Default: transparent bg, white text
Hover: bg-[#5c56b6]/50 (50% opacity)
Active: bg-[#5c56b6] + border-left white 4px
```

### File Input
```css
File button hover: #5c56b6
Cursor: pointer
```

## ✅ Checklist Implementasi

- [x] Sidebar dengan navigasi 5 menu
- [x] Layout responsive dengan main content area
- [x] Dashboard dengan upload dan data summary
- [x] SVR Prediction dengan chart
- [x] RF Prediction dengan chart (identik dengan SVR)
- [x] Feature Selection dengan table dan bar chart
- [x] Model Evaluation dengan comparison charts
- [x] Color palette sesuai desain
- [x] Typography hierarchy
- [x] Border radius konsisten
- [x] Icon implementation (Lucide React)
- [x] Chart implementation (Recharts)
- [x] Hover states dan transitions
- [x] Dummy data untuk semua visualisasi

## 🚀 Future Enhancements

1. **Responsive Design**: Add mobile breakpoints
2. **Animations**: Smooth page transitions
3. **Loading States**: Skeleton screens dan spinners
4. **Error Handling**: Toast notifications
5. **Dark Mode**: Alternative color scheme
6. **Accessibility**: ARIA labels, keyboard navigation
7. **Performance**: Code splitting, lazy loading

## 📝 Notes

- Semua komponen menggunakan functional components dengan Hooks
- Routing menggunakan React Router v6
- Styling menggunakan Tailwind CSS utility classes
- Chart responsiveness dengan ResponsiveContainer
- Data dummy disediakan untuk semua visualisasi
- Backend API endpoints sudah disiapkan untuk integrasi

---

**Implementasi Status**: ✅ Complete (Frontend UI/UX)  
**Next Phase**: Backend ML Algorithm Implementation & API Integration
