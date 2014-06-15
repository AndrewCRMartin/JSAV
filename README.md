JavaScript Sequence Alignment Viewer (JSAV)
===========================================

JSAV is a simple JavaScript sequence alignment viewer

Look at index.html amd index2.html for example usage information

The main user entry point is:
```javascript
    printJSAV(divId, sequenceArray, options);
```

Where:
- `divId` is the name of a div that will be created
- `sequenceArray`  is an array of sequence objects - these contain `id` and `sequence` fields 
- `options`        is an object describing options - see below

The options for controlling the display are:

- `sortable` - Should the sorting options be displayed (default: false)
- `width` - The width of the selection slider with units (default: '400px')
- `height` - The height of the selection slider with units. This is actually a font size
and the actualy slider height is relative to this (default: '6pt')
- `selectable`  - Should selection checkboxes be displayed for each sequence
- `deletable`   - Makes it possible to delete sequences
- `highlight`   - Array of ranges to highlight (e.g. [24,34,50,56] would highlight
positions 24-34 and 50-56)
- `submit`      - URL for submitting selected sequences
- `submitLabel` - Label for submit button
- `action`      - Function to call using selected sequences - the function will be passed 
the divId and array of sequence objects
- `actionLabel` - Label for action button

Prerequisites
-------------

You must have JQuery and JQuery-UI installed - simply download them
from http://www.jqueryui.com/ and access the two JavaScript files and
the CSS file from your HTML. You can customize the look and feel of
the slider and the confirmation/alert boxes by choosing a different
(or customized) JQuery-UI theme.

Note
----
In future, the slider may be replaced with 
   http://refreshless.com/nouislider/
which works better on touchscreens.

