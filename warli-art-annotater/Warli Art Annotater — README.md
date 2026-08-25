# Warli Art Annotater

A local-first web tool for extracting, annotating, and cataloguing visual elements from larger source images.

The tool is initially being developed for working with **Warli artwork**, where a larger image may contain many individual figures, animals, activities, objects, scenes, and motifs worth identifying and extracting.

The application is not intended to be only an image cropper. Its larger purpose is to create **structured spatial and semantic data** connecting extracted visual elements back to their locations in the original artwork.

The resulting dataset is intended to support a future interactive browsing/exploration interface.

## Current Status

Early working prototype.

Current version: **v0.3**

The basic workflow is functional, but the interface and interaction model are expected to undergo substantial iteration through actual use.

## Core Workflow

1. Add one or more JPG source images to the project.
2. Open the application locally.
3. Select a source image.
4. Move the crop region over an element in the artwork.
5. Resize the crop region using the keyboard.
6. Assign a category/tag.
7. Capture the region.
8. The crop is extracted from the **original full-resolution image**.
9. The cropped JPG is saved automatically.
10. Metadata describing the crop is written to the project dataset.
11. Previously captured regions remain visible over the source image and in the captured-crops gallery.

## Crop Controls

The crop region is always centred on the mouse cursor.

### Rectangle sizing

- `←` — increase width
- `→` — decrease width
- `↑` — increase height
- `↓` — decrease height

Width and height always expand or contract symmetrically around the cursor.

### Square sizing

- `[` — decrease square size
- `]` — increase square size

If the current crop region is rectangular, pressing `[` or `]` first converts it to a square using the average of its current width and height.

The bracket operation then resizes that square.

### Capture and tagging

The currently selected category determines which tags are available.

A normal click can open the available tags near the cursor for rapid selection.

Tags may also have keyboard shortcuts.

For example:

`P + click → peacock`

This allows repeated annotation of similar elements without continually returning to the sidebar.

## Grid

The source image is overlaid with a selectable proportional grid.

Typical grids may include:

- 10 × 10
- 20 × 20
- other resolutions during experimentation

Grid coordinates use spreadsheet-style notation:

`A1`, `C7`, `J10`, etc.

The crop filename records the grid cell containing the **centre of the crop**.

The dataset can additionally record the complete grid bounds covered by the crop.

The grid exists primarily as a human-readable and resolution-independent spatial reference.

Exact crop locations are additionally stored as normalized coordinates.

## Labels

Labels use a hierarchical:

`category → tag`

structure.

Examples:

```text
animal → peacock
animal → cow

activity → harvest
activity → dance

object → basket
object → instrument
```

Each crop has one **primary category/tag pair**.

Additional category/tag pairs may also be attached to the same crop.

For example, one crop might eventually contain:

```text
animal → cow
activity → ploughing
object → plough
```

Label definitions are stored in an editable JSON file so that they can be cleaned up or reorganized outside the interface when necessary.

## Saved Data

A crop filename contains enough information to remain useful even if the file becomes separated from the project dataset.

Example:

```text
source-image_003_C7_animal_peacock.jpg
```

More detailed information is stored in JSON.

This includes information such as:

- crop ID
- source image
- serial number
- centre grid coordinate
- grid bounds
- normalized crop bounds
- primary label
- additional labels
- output filename

## Spatial Data

Crop geometry is stored independently of display resolution.

For example:

```json
{
  "x": 0.2143,
  "y": 0.5712,
  "width": 0.0931,
  "height": 0.1264
}
```

These normalized coordinates refer to proportions of the original source image rather than screen pixels.

This allows the crop location to be reconstructed when the image is displayed at different sizes.

## Project Structure

```text
warli-art-annotater/
├── package.json
├── server.js
├── public/
├── project/
│   ├── source/
│   ├── crops/
│   └── data/
├── docs/
│   └── PROJECT.md
└── README.md
```

### `project/source/`

Original full-resolution JPG artwork.

### `project/crops/`

Automatically generated crops.

### `project/data/`

Persistent project data, including crop metadata, label definitions, and project configuration.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Then open the local address reported by the server, normally:

```text
http://localhost:3000
```

On Windows systems where PowerShell prevents `npm.ps1` from running, either use Command Prompt or:

```powershell
npm.cmd install
npm.cmd start
```

## Technology

The current prototype uses:

- HTML/CSS/JavaScript browser interface
- Node.js
- Express
- Sharp for full-resolution server-side image cropping
- JSON for persistent project data

## Development Principle

The annotation interface and the eventual public exploration interface are separate concerns.

The annotater's job is to create a reliable dataset containing:

**source image → spatial region → extracted image → semantic labels**

Future interfaces should be able to consume this dataset without depending on the annotation UI itself.

## Development Status

This is an exploratory tool under active development.

Expect interaction patterns, controls, schema details, and interface layout to change as it is tested against real Warli artwork.

Where possible, keep the underlying saved data stable and explicit even when the annotation interface changes.