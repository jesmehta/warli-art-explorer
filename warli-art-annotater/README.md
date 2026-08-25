# Warli Art Annotater v0.2

A local-first browser tool for annotating larger Warli source images and extracting full-resolution JPG crops with reusable spatial and label metadata.

## Setup

1. Install Node.js 18+.
2. Put source JPG/JPEG files in `project/source/`.
3. From the project folder run:

   ```bash
   npm install
   npm start
   ```

   If Windows PowerShell blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd start`, or run the commands in Command Prompt.

4. Open `http://localhost:3000`.

## Core interaction

- Move the mouse to position the crop region.
- `[` / `]` decrease/increase the overall **square** size. If the current region is rectangular, either key first resets it to a square based on the average of its width and height, then resizes it.
- The crop region always remains centred on the mouse. Arrow keys resize width or height symmetrically:
  - `←` increases width
  - `→` decreases width
  - `↑` increases height
  - `↓` decreases height
- `Alt` makes arrow or bracket adjustments finer.
- Plain click opens a tag cloud for the currently selected category beside the cursor. Clicking a tag captures the region.
- Hold a tag shortcut key and click to capture immediately with that tag.
- `Ctrl/Cmd + Z` removes the most recent crop for the current source image.
- `Delete` removes the selected crop.
- `Esc` closes the tag cloud and clears selection.

## Labels and shortcuts

Labels remain editable in `project/data/labels.json`. Categories can be selected once and kept active while many crops are captured.

Each tag can have a one-character shortcut. Shortcuts are stored in `project/data/project.json` under `tagShortcuts`, for example:

```json
{
  "tagShortcuts": {
    "animal": {
      "peacock": "p",
      "cow": "c"
    },
    "activity": {
      "meal": "m"
    }
  }
}
```

The interface automatically proposes unused characters for new tags. Select a tag in the sidebar to change its shortcut manually.

## Files

```text
project/
├─ source/       original JPG source images
├─ crops/        extracted full-resolution JPG crops
└─ data/
   ├─ crops.json    crop records and normalized bounds
   ├─ labels.json   hand-editable categories and tags
   └─ project.json  project settings, default grid, shortcuts
```

Crop filenames keep the source ID, serial number, centre grid cell, primary category, and primary tag. Richer information—including grid bounds, normalized crop bounds, and additional labels—lives in `crops.json`.

## v0.2 changes

- One-handed crop sizing: brackets for square size; arrows resize width/height symmetrically around the mouse.
- Rectangles reset to their average-sized square when brackets are used.
- Hovering a captured thumbnail highlights the matching source region without changing selection.
- Hovering an existing source-region overlay highlights the matching thumbnail; clicking it selects that crop.
- Plain click opens an in-place tag cloud from the active category.
- Tag shortcut + click captures immediately.
- Persistent per-category tag shortcuts.
