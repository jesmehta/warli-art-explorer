# Changelog

Development history for **Warli Art Annotater**.

This project is currently in an early iterative prototyping phase. Version changes therefore include interaction-design decisions as well as conventional features and fixes.

---

## Unreleased - Annotation Control Refinements

### Added

- Added mouse-wheel resizing for the active crop region.
- Scrolling up enlarges the crop and scrolling down reduces it.
- Wheel resizing preserves the current aspect ratio: squares remain square and rectangles retain their proportions.
- Wheel resizing remains symmetrical around the mouse position.

### Changed

- Consolidated the short and long project READMEs into one authoritative `README.md` without dropping their unique setup, workflow, control, interface, grid, label, storage, architecture, or development content.
- Removed the now-redundant `Warli Art Annotater - README.md` after its unique material was merged into the root README.
- Replaced em dashes in project text with commas, colons, hyphens, or simple placeholders according to context.
- Renamed the three detailed documentation files to use ordinary hyphens, improving filename consistency and command-line compatibility.
- Refreshed the interface typography and color system with a warm paper, earth, clay, and ochre palette suited to the Warli subject matter.
- Restyled fields, buttons, panels, crop overlays, thumbnails, and focus states for clearer hierarchy and more comfortable extended use.
- Placed the primary Tag selector and its Shortcut editor side by side to make their relationship clearer and reduce vertical space.
- Reorganized the annotation sidebar into Primary label, Extra labels, Edit vocabulary, and Crop sections.
- Standardized primary and extra label controls as aligned, side-by-side Category and Tag columns; the primary row includes a compact Key column.
- Moved category/tag creation into a separate vocabulary-editing section so annotation choices and vocabulary management are visually distinct.
- Corrected the in-application control guide so it describes the current centred arrow controls and mouse-wheel resizing.
- Updated the live README version and control descriptions to match the v0.3 implementation.

### Design decisions

- Mouse-wheel resizing changes overall scale rather than independently changing width or height. This makes it a fast, shape-preserving complement to the dimension-specific arrow controls.
- Shortcut editing stays visually adjacent to tag selection because a shortcut belongs to the selected tag, not to the category as a whole.

---

## v0.3 - Centred Crop Resizing

### Changed

- Reworked keyboard resizing so the crop region always remains centred on the mouse cursor.
- Removed asymmetric individual-edge resizing.
- Removed the `Shift + Arrow` resizing behaviour introduced in v0.2.

### Current rectangle controls

- `←`: increase crop width.
- `→`: decrease crop width.
- `↑`: increase crop height.
- `↓`: decrease crop height.

Width and height change symmetrically around the mouse position.

### Current square controls

- `[`: decrease overall square size.
- `]`: increase overall square size.
- If the current crop is rectangular, using `[` or `]` first resets it to a square based on the average of its current width and height, then performs the resize.

### Design decision

The mouse position is treated as the centre of the intended subject/crop.

Keyboard controls modify the dimensions of the region around that centre rather than moving individual crop edges.

This behaviour should be preserved unless deliberately reconsidered through testing.

---

## v0.2 - Faster Annotation Interaction

### Added

- Tag selection near the mouse cursor.
- Clicking an uncaptured region can display tags from the currently selected category near the cursor.
- Selecting a tag from this interface captures the region.
- Keyboard shortcuts for frequently used tags.
- Shortcut + click can capture directly without repeatedly using the tag dropdown.
- Persistent tag-shortcut configuration.
- Automatic shortcut assignment for newly added tags where possible.
- Improved relationship between captured thumbnails and source-image regions.

### Improved

- Hovering a captured thumbnail highlights its corresponding region in the main source image.
- Hovering a previously captured region in the source image highlights its corresponding thumbnail.
- Clicking an existing captured region selects that crop.

### Initial resizing experiment

Introduced an individual-edge resizing model using arrow keys and `Shift`.

This interaction was subsequently rejected and replaced in v0.3.

### Design finding

Repeated use of the sidebar tag dropdown is too slow for large annotation sessions.

The annotation workflow should favour:

- persistent category selection
- cursor-local tag selection
- keyboard shortcuts for repetitive tagging
- minimal mouse travel

---

## v0.1 - Initial Working Prototype

### Added

Initial functional version of the annotation and extraction tool.

### Source images

- Support for multiple JPG source images.
- Source-image selection and switching.
- Browser display scales source images to the available workspace.
- Crops are generated from the **original full-resolution JPG**, not the resized browser representation.

### Crop interaction

- Crop region follows the mouse cursor.
- Adjustable crop size.
- Support for square and rectangular crops.
- Click-based capture.

### Spatial indexing

- Proportional grid overlay over the source image.
- User-selectable grid resolution.
- Spreadsheet-style grid coordinates such as `A1`, `C7`, etc.
- Centre grid coordinate recorded for each crop.
- Grid bounds available for metadata.
- Normalized crop geometry recorded independently of browser/display resolution.

### Labels

- Hierarchical `category → tag` label structure.
- Primary category/tag assignment.
- Support for additional category/tag pairs.
- Persistent label vocabulary.
- Human-editable JSON label definitions.
- Ability to add new labels through the interface.

### Saving

- Automatic crop saving.
- JPG crop output.
- Crop filenames contain useful provenance information including:
  - source image
  - serial number
  - centre grid coordinate
  - primary category
  - primary tag
- Persistent JSON crop metadata.

### Captured-crop interface

- Gallery/thumbnails of previously captured crops.
- Translucent rectangles showing already captured regions over the source image.
- Crop selection.
- Crop deletion.
- Basic undo functionality.

### Architecture

Established the initial local-first architecture:

```text
Browser interface
        ↓
Node.js / Express local server
        ↓
Sharp
        ↓
source JPGs / extracted crops / JSON metadata
```

### Initial project identity

The prototype was initially developed internally under the generic name:

`image-atlas-tool`

The project was subsequently named:

**Warli Art Annotater**

The old `image-atlas-tool` directory/name has no architectural significance and should not be retained in the final repository structure.

---

# Versioning Notes

During early development, versions primarily mark useful working checkpoints rather than formal production releases.

Increment the version when a meaningful set of interaction, schema, or functionality changes produces a new testable state.

Small fixes made between checkpoints do not necessarily require their own release.

For future entries, record:

- **Added**: new functionality
- **Changed**: deliberate changes to existing behaviour
- **Fixed**: bugs or unintended behaviour
- **Removed**: functionality intentionally eliminated
- **Data/Schema**: changes affecting persistent project data
- **Design decisions**: important interaction or architectural choices future developers should understand

Rejected approaches should sometimes remain in the changelog when they explain why the current interaction behaves as it does.
