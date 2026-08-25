# Warli Art Annotater — Project Context

## Purpose

Warli Art Annotater is a tool for identifying, extracting, annotating, and spatially indexing visual elements contained within larger Warli artworks.

A single source artwork may contain many independently meaningful visual elements:

- people
- animals
- plants
- objects
- activities
- structures
- patterns
- scenes
- other motifs

The tool allows these elements to be extracted while preserving their relationship to the source artwork.

The long-term project therefore has two broad halves:

### 1. Annotation and extraction

A working interface for:

- viewing source artwork
- identifying regions
- extracting full-resolution crops
- assigning semantic labels
- recording spatial relationships
- managing previously extracted elements

### 2. Exploration and display

A future interface in which:

- the complete artwork can be explored
- extracted elements can be browsed independently
- elements can be filtered/grouped by their labels
- thumbnails can call back to their location in the source artwork
- locations in the artwork can call out associated extracted elements

The second half is intentionally not yet defined in detail.

The annotation dataset should therefore remain flexible enough to support multiple future display approaches.

---

# Core Design Principles

## Original images remain authoritative

The image shown in the browser may be resized to fit the available canvas.

Extraction must nevertheless occur against the **original full-resolution source image**.

Display dimensions must never determine crop resolution.

---

## Spatial information must survive resizing

Raw screen coordinates are not a suitable persistent spatial reference.

Two complementary representations are therefore used.

### Grid coordinates

A standardized proportional grid provides human-readable locations such as:

```text
C7
F12
J4
```

The grid resolution is currently selectable while the appropriate standard is evaluated.

The filename records the grid cell containing the centre of the crop.

### Normalized coordinates

Exact geometry is stored as proportions of the source image:

```text
x = 0–1
y = 0–1
width = 0–1
height = 0–1
```

This allows exact crop locations to be reconstructed at any display resolution.

The grid is therefore the **human-readable spatial reference**, while normalized geometry is the **machine-readable spatial reference**.

Do not replace one with the other.

---

# Crop Interaction Model

The crop region follows the mouse cursor.

The mouse position is always the **centre of the crop region**.

Resizing must remain symmetrical around this point.

## Rectangle controls

```text
←   increase width
→   decrease width

↑   increase height
↓   decrease height
```

These controls modify dimensions, not individual edges.

Do not implement asymmetric edge resizing.

## Square controls

```text
[   decrease square size
]   increase square size
```

If the crop is currently rectangular, either bracket key:

1. calculates the average of the current width and height
2. converts the region to a square of that size
3. performs the requested increase/decrease

The rectangle therefore remembers no separate "square mode."

The geometry itself determines its current state.

---

# Annotation Workflow

Annotation needs to support rapid repetitive work.

A user may annotate dozens or hundreds of elements from one artwork.

Reducing mouse travel and repeated dropdown interaction is therefore important.

## Categories

A category can remain selected for a period of work.

Examples:

```text
animal
activity
object
person
structure
```

## Tags

Each category contains tags.

For example:

```text
animal
    cow
    peacock
    fish

activity
    harvest
    dance
    sleep
```

Tags should be selectable close to the annotation location rather than requiring constant travel back to a sidebar.

Current interaction approaches include:

### Cursor tag selection

Clicking can display a tag cloud/menu around or near the cursor containing tags from the selected category.

Selecting a tag captures the crop.

### Keyboard tag shortcuts

Frequently used tags can have keyboard shortcuts.

Example:

```text
P + click → peacock
M + click → meal
```

Keyboard shortcuts should be configurable rather than permanently hard-coded into application logic.

---

# Multiple Labels

A crop is not necessarily semantically described by only one thing.

Each crop therefore has:

### Primary label

One:

```text
category + tag
```

pair.

This label is used in the filename.

### Additional labels

Zero or more additional:

```text
category + tag
```

pairs.

For example:

```text
Primary:
animal → cow

Additional:
activity → ploughing
object → plough
```

The schema should not artificially limit the number of additional labels.

---

# Filename Philosophy

Extracted files should remain partially self-describing even when separated from the project database.

A filename therefore contains:

```text
source
serial
centre grid coordinate
primary category
primary tag
```

Example:

```text
village-scene_023_F7_animal_peacock.jpg
```

Do not attempt to encode every metadata field into the filename.

Detailed metadata belongs in the dataset.

The filename provides useful provenance; the JSON provides complete provenance.

---

# Crop Metadata

A crop record should be capable of representing at least:

```json
{
  "id": "village-scene_023",
  "source": "village-scene.jpg",
  "serial": 23,

  "grid": {
    "centre": "F7",
    "bounds": {
      "start": "E6",
      "end": "G8"
    }
  },

  "bounds": {
    "x": 0.42,
    "y": 0.31,
    "width": 0.08,
    "height": 0.11
  },

  "primaryLabel": {
    "category": "animal",
    "tag": "peacock"
  },

  "labels": [
    {
      "category": "animal",
      "tag": "peacock"
    }
  ],

  "filename": "village-scene_023_F7_animal_peacock.jpg"
}
```

The precise schema may evolve.

Avoid destructive schema changes once real annotation work begins.

If the schema needs to change later, prefer explicit migration.

---

# Source Images

A project contains multiple source images.

The annotater must allow switching between them.

Each source image should retain enough information to interpret its annotations independently.

Useful source metadata includes:

```text
ID
filename
original width
original height
grid configuration
```

The current source format is JPG.

---

# Grid

The grid resolution is currently user-selectable.

Possible working resolutions include:

```text
10 × 10
20 × 20
```

The appropriate standard will be determined through use.

Grid coordinates follow spreadsheet convention:

```text
A1
A2
B1
B2
...
```

If grid resolution eventually exceeds 26 columns, column naming should continue using spreadsheet convention:

```text
Z
AA
AB
AC
...
```

Do not tie spatial metadata exclusively to a particular grid resolution.

Normalized bounds remain the authoritative exact geometry.

---

# Existing Crop Visualization

Previously captured areas should appear over the source image as translucent rectangles.

This serves primarily to prevent accidental duplicate extraction and provide annotation context.

Interaction should work in both directions:

```text
thumbnail → source region
source region → thumbnail
```

Hovering a thumbnail should highlight its corresponding region.

Hovering a captured region should highlight its corresponding thumbnail.

Selecting either representation should select the same underlying crop record.

---

# Crop Management

The annotater should support management of mistakes and revisions.

Current/expected operations include:

- undo recent capture
- select crop
- delete crop
- relabel crop
- inspect crop
- locate crop in source image

Future editing may include adjusting an existing crop's bounds.

Deletion must keep saved files and metadata synchronized.

---

# Data Storage

The application is intentionally local-first.

A lightweight local Node server allows the browser interface to write directly into the project structure.

Conceptually:

```text
project/
├── source/
├── crops/
└── data/
    ├── crops.json
    ├── labels.json
    └── project.json
```

## `source/`

Original artwork.

## `crops/`

Extracted JPG regions.

## `crops.json`

Annotation records.

## `labels.json`

Human-editable category/tag vocabulary.

## `project.json`

Project-level configuration such as grid settings and keyboard shortcuts.

---

# Label Vocabulary

The label system must remain human-editable.

Do not bury category/tag definitions inside application JavaScript.

The UI should read them from persistent data.

This allows:

- typo correction
- vocabulary cleanup
- category restructuring
- manual additions
- future migration

Care should eventually be taken when renaming labels already used by existing crops.

A future vocabulary-management interface may handle these migrations.

---

# Architecture

The current implementation is deliberately lightweight.

```text
Browser
    ↓
HTML / CSS / JavaScript annotation interface
    ↓
local API
    ↓
Node.js + Express
    ↓
Sharp
    ↓
source images / crops / JSON
```

Sharp performs cropping against the original image rather than the resized browser representation.

Avoid adding a database unless the scale or workflow demonstrates a genuine need for one.

Human-readable files and JSON are currently preferable.

---

# Separation of Concerns

Keep these systems conceptually separate:

## Annotation interface

Responsible for creating and editing annotation data.

## Dataset

The durable representation of images, crops, labels, and spatial relationships.

## Exploration interface

A future consumer of the dataset.

The public exploration site should not need the annotation application's internal state in order to understand the data.

Likewise, changes to the public display should not require changing the annotation workflow.

---

# Development Approach

The project is currently in an iterative interaction-design phase.

Real use against Warli artwork should drive interface decisions.

Prioritize:

1. annotation speed
2. low mouse travel
3. clear spatial feedback
4. easy correction of mistakes
5. reliable metadata
6. non-destructive evolution of the dataset

Do not prematurely optimize visual polish or introduce unnecessary framework complexity.

The working interaction is more important than a polished UI at this stage.

---

# Current Prototype

As of **v0.3**, the project has an initial functional prototype supporting the basic annotation workflow.

Significant tweaking is expected.

When modifying the application, preserve this document as the description of **project intent** rather than assuming every current implementation detail represents a permanent requirement.

If implementation and project intent diverge, document the decision rather than silently changing the underlying model.