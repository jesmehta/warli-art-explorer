# Warli Art Annotater v0.3

A local-first web tool for extracting, annotating, and cataloguing visual elements from larger source images.

The tool is initially being developed for **Warli artwork**, where a larger image may contain many independently meaningful figures, animals, activities, objects, scenes, structures, patterns, and motifs.

The application is not intended to be only an image cropper. Its larger purpose is to create structured spatial and semantic data connecting extracted visual elements back to their locations in the original artwork. The resulting dataset is intended to support a future interactive browsing and exploration interface.

## Current status

Warli Art Annotater is an early working prototype under active development. Current version: **v0.3**.

The basic workflow is functional, but controls, schema details, and interface layout are expected to evolve through use with real Warli artwork. Where possible, the underlying saved data should remain stable and explicit as the interface changes.

## Setup

1. Install Node.js 18 or newer.
2. Put source JPG or JPEG files in `project/source/`.
3. From the project folder, run:

   ```bash
   npm install
   npm start
   ```

   If Windows PowerShell blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd start`, or run the commands in Command Prompt.

4. Open `http://localhost:3000`.

## Core workflow

1. Add one or more JPG source images to the project.
2. Open the application locally.
3. Select a source image.
4. Move the crop region over an element in the artwork.
5. Resize the region using the mouse wheel or keyboard.
6. Assign a category and tag.
7. Capture the region.
8. The server extracts the crop from the original full-resolution image.
9. The cropped JPG is saved automatically.
10. Spatial and label metadata is written to the project dataset.
11. Captured regions remain visible over the source and in the crop gallery.

## Controls

The crop region follows the mouse and always remains centred on it.

### Shape-preserving mouse-wheel sizing

- Scroll up to enlarge the current crop.
- Scroll down to reduce it.
- Wheel resizing preserves the current aspect ratio, so squares remain square and rectangles retain their proportions.

### Rectangle sizing

- `←`: increase width
- `→`: decrease width
- `↑`: increase height
- `↓`: decrease height

Width and height expand or contract symmetrically around the mouse.

### Square sizing

- `[`: decrease square size
- `]`: increase square size

If the current region is rectangular, either bracket key first converts it to a square using the average of its width and height, then performs the requested resize. `Alt` makes arrow and bracket adjustments finer.

### Capture and tagging

- Plain click opens tags from the active category beside the cursor. Clicking a tag captures the region.
- Hold a tag's shortcut key and click to capture immediately with that tag. For example, `P + click` can capture `peacock`.
- `Ctrl/Cmd + Z` removes the most recent crop for the current source image.
- `Delete` removes the selected crop.
- `Esc` closes the tag cloud and clears selection.

### Existing crops

- Hovering a captured thumbnail highlights its source region without changing selection.
- Hovering an existing source-region overlay highlights the matching thumbnail.
- Clicking an existing source-region overlay selects that crop.

## Interface

The annotation sidebar is organized into Primary label, Extra labels, Edit vocabulary, and Crop sections. Primary and extra labels use aligned, side-by-side Category and Tag columns. The primary row also includes a compact one-character Shortcut field.

The interface uses a restrained Warli-inspired palette of natural paper, earth, clay, and ochre with a legible native UI font stack. Clay marks primary actions and captured regions, while ochre highlights hover and active states. The treatment is intended to support extended annotation sessions rather than act as decorative theming.

## Grid and spatial references

The source image has a selectable proportional grid, with working resolutions such as 10 x 10 and 20 x 20. Grid coordinates use spreadsheet-style notation such as `A1`, `C7`, and `J10`.

The crop filename records the grid cell containing the crop centre. The dataset also records the complete grid bounds covered by the crop.

The grid is a human-readable, resolution-independent spatial reference. Exact geometry is stored separately as normalized coordinates, allowing the region to be reconstructed at any display size.

## Labels and shortcuts

Labels use a hierarchical `category → tag` structure. Examples include:

```text
animal → peacock
animal → cow

activity → harvest
activity → dance

object → basket
object → instrument
```

Each crop has one primary category and tag pair. It may also have any number of additional category and tag pairs. For example:

```text
Primary: animal → cow
Additional: activity → ploughing
Additional: object → plough
```

Label definitions remain human-editable in `project/data/labels.json`, allowing typo correction, vocabulary cleanup, category restructuring, and manual additions outside the interface.

Each tag can have a configurable one-character shortcut. Shortcuts are stored per category in `project/data/project.json`:

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

The interface automatically proposes unused characters for new tags. Select a tag in the sidebar to edit its shortcut.

## Saved data

Crop filenames remain partially self-describing even when separated from the project dataset. A filename contains the source ID, serial number, centre grid cell, primary category, and primary tag:

```text
source-image_003_C7_animal_peacock.jpg
```

Detailed JSON metadata includes:

- crop ID
- source image
- serial number
- centre grid coordinate
- grid bounds
- normalized crop bounds
- primary label
- additional labels
- output filename

Normalized crop geometry is independent of browser resolution:

```json
{
  "x": 0.2143,
  "y": 0.5712,
  "width": 0.0931,
  "height": 0.1264
}
```

These values are proportions of the original source image rather than screen pixels.

## Project structure

```text
warli-art-annotater/
├── package.json
├── server.js
├── public/
├── project/
│   ├── source/          original full-resolution JPG artwork
│   ├── crops/           automatically generated JPG crops
│   └── data/
│       ├── crops.json   crop records and normalized bounds
│       ├── labels.json  editable categories and tags
│       └── project.json project settings, default grid, shortcuts
├── README.md
├── Warli Art Annotater - Project Context.md
└── Warli Art Annotater - Changelog.md
```

## Technology and architecture

The current prototype uses:

- HTML, CSS, and JavaScript browser interface
- Node.js
- Express
- Sharp for full-resolution server-side image cropping
- JSON for persistent project data

The browser displays a resized source image, but Sharp always extracts against the original full-resolution JPG. Display dimensions must not determine crop resolution.

## Development principle

The annotation interface and eventual public exploration interface are separate concerns.

The annotater creates a reliable dataset containing:

**source image → spatial region → extracted image → semantic labels**

Future interfaces should be able to consume the dataset without depending on annotation UI state. Changes to the public exploration interface should likewise not require changing the annotation workflow.

For architectural intent, constraints, and design reasoning, see `Warli Art Annotater - Project Context.md`. For chronological implementation history, see `Warli Art Annotater - Changelog.md`.
