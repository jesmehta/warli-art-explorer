# Image Atlas Cropper — prototype v0.1

Local-first browser tool for extracting full-resolution JPG crops while recording portable spatial and semantic metadata.

## Run

1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Put source `.jpg`/`.jpeg` files in `project/source/`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Data model

- `project/source/` — untouched source JPGs.
- `project/crops/` — automatically generated full-resolution crops.
- `project/data/crops.json` — reusable crop metadata.
- `project/data/labels.json` — hand-editable category → tag hierarchy.
- `project/data/project.json` — project settings, currently default grid resolution.

Filename convention:

`<source>_<serial>_<centre-grid>_<primary-category>_<primary-tag>.jpg`

Example: `market-scene_003_C7_animal_fish.jpg`

Each crop also stores normalized x/y/width/height, grid centre, grid bounds, primary label, and additional label pairs. Normalized bounds allow later interfaces to locate a crop precisely at any display size.

## Current controls

- Mouse: move crop rectangle.
- Click: capture from original full-resolution source.
- `S + arrows`: resize as a square.
- `R + left/right`: width; `R + up/down`: height.
- `Shift`: larger resize step.
- `Alt`: finer resize step.
- `Ctrl/Cmd + Z`: delete/undo latest crop for current source.
- `Delete`: delete selected crop.

## Implemented in v0.1

Multiple source images; source switching; selectable 10/15/20/25/30 grids; spreadsheet-style grid coordinates; full-resolution extraction; hierarchical labels; extra label pairs; persistent hand-editable labels JSON; automatic JPG saving; crop metadata; thumbnail history; translucent previous-crop overlays; thumbnail/location highlighting; delete and basic undo.

## Intentional next-stage items

Relabel existing captures; drag/resize an existing crop; filters/search; stronger undo history; label keyboard shortcuts; project creation/import UI; validation when `labels.json` is hand-edited; downstream public exploration interface.
