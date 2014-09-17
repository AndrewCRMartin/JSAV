/** @preserve 
    @file
    JSAV V1.6 17.09.14
    Copyright:  (c) Dr. Andrew C.R. Martin, UCL, 2014
    This program is distributed under the Gnu Public Licence (GPLv2)
*/
/** ***********************************************************************
   Program:    JSAV  
   File:       JSAV.js
   
   Version:    V1.6
   Date:       17.09.14
   Function:   JavaScript Sequence Alignment Viewier
   
   Copyright:  (c) Dr. Andrew C.R. Martin, UCL, 2014
   Author:     Dr. Andrew C.R. Martin
   Address:    Institute of Structural and Molecular Biology
               Division of Biosciences
               University College
               Gower Street
               London
               WC1E 6BT
   EMail:      andrew@bioinf.org.uk
               
**************************************************************************
   This program is distributed under the Gnu Public licence (GPLv2 or 
   above)

   Alternative licences for commercial use are available on request.
**************************************************************************
   Description:
   ============
   JSAV is a simple JavaScript protein sequence alignment viewer. It
   allows you to select a region of the alignment and sort on that
   region.
**************************************************************************
   Revision History:
   =================
   V1.0    06.06.14   Original  By: ACRM
   V1.1    10.06.14   Code cleanup
                      Changed options to a hash
                      Further code cleanup - some code was assuming
                      sequences were stored in an array called 'sequences'
                      Added 'selectable' option
           12.06.14   Added 'deletable' and 'border' options
                      Implemented sequence deletion
           13.06.14   Checks that some sequences are selected before 
                      deletion
                      Cleaned up comments/documentation
                      Cleaned up defaults in printJSAV
                      Changed some routine names
   V1.2    13.06.14   Added highlight option
                      Added submit/submitLabel options
                      Added action/actionLabel options
   V1.2.1  15.06.14   Added height option
                      Changed to use ACRM_alert()
   V1.2.2  16.06.14   Changed to use ACRM_confirm()
   V1.3    16.06.14   Added dotify/nocolour/toggleDotify/toggleNocolour
   V1.4    17.06.14   Added fasta/fastaLabel export options
                      Added consensus sequence display and colourScheme
                      Added selectColour/selectColor and
                      colourChoices/colorChoices
                      Added refresh of options on reload
   V1.5    18.06.14   Added tooltips
   V1.5.1  19.06.14   Added callback option
   V1.6    17.09.14   Changed to manipulate the DOM rather than writing
                      to the document  By: JHN

TODO: 
      1. Bar display of conservation from entropy
      2. Allow user to specify key sequence for sorting
      3. Clean up passing of globals

*************************************************************************/
/**
This is the only routine called by a user. It takes an array of
sequence objects and displays them as a coloured sortable table
optionally with a slider and sort button, delete button, etc

@example 
var options = Array();
options.width = '400px';
options.sortable = true;
options.highlight = [3,5,10,14];
options.submit = "http://www.bioinf.org.uk/cgi-bin/echo.pl";
options.submitLabel = "Submit sequences";
options.action = "myAction";
options.actionLabel = "My Action";
options.consensus = true;
options.deletable = true;
options.fasta = true;
printJSAV('mySeqDisplay', sequenceArray, options);
Where 'mySeqDisplay' is the name of a div that will be created
      sequenceArray  is an array of sequence objects
      options        is an object describing options - see below

@param {object[]}  sequences -  Array of sequence objects
@param {string}    divId     - ID of div to print in
@param {Object}    options   - Options that can be provided - see Properties
@property {bool}      options.sortable       - Should the sorting options be displayed
                                    (default: false)
@property {string}    options.width          - The width of the selection slider with
                                    units (default: '400px')
@property {string}    options.height         - The height of the selection slider with
                                    units (default: '6pt')
@property {bool}      options.selectable     - Should selection checkboxes be displayed
                                    for each sequence
@property {bool}      options.deletable      - Makes it possible to delete sequences
@property {int[]}     options.highlight      - Array of ranges to highlight
@property {string}    options.submit         - URL for submitting selected sequences
@property {string}    options.submitLabel    - Label for submit button
@property {string}    options.action         - Function to call using selected sequences.
                                               This is passed the seqId and array of
                                               currently selected sequence objects
@property {string}    options.actionLabel    - Label for action button
@property {bool}      options.dotify         - Repeated amino acids in the sequence are
                             replaced by a dot
@property {bool}      options.nocolour       - Dotified amino acids are not coloured
                             (except deletions)
@property {bool}      options.toggleDotify   - Create a check box for toggling dotify
@property {bool}      options.toggleNocolour - Create a check box for toggling nocolour
@property {bool}      options.fasta          - Create a FASTA export button 
@property {string}    options.fastaLabel     - Label for FASTA export button
@property {bool}      options.consensus      - Display consensus sequence
@property {string}    options.colourScheme   - Default colour scheme - valid options 
                             depend on the css, but are currently
                             taylor, clustal, zappo, hphob, helix, 
                             strand, turn, buried. Note that this must be
                             specified in lower case
@property {bool}      options.selectColour   - Display a pull-down to choose the colour 
                             scheme.
@property {string[]}  options.colourChoices  - Array of colour scheme names - only used
                                    if the user has added to the CSS. This
                                    can be in mixed case.

@property {bool}      options.plainTooltips    - Don't use JQuery tooltips
@property {callback}  options.callback       - Specify the name of a function to be
                                               called whenever the display is refreshed.
                                               This is passed the seqId

@author 
- 29.05.14 Original  By: ACRM
- 30.05.14 Now just calls JSAV_buildSequencesHTML() and prints the results
- 05.06.14 Added divId parameter and sortable
- 06.06.14 Added width
- 10.06.14 sortable and width parameters now replaced by 'options'
           Added 'selectable' option
           Stores sequence length in global array
- 11.06.14 Added deletable
- 13.06.14 Cleaned up use of defaults
- 13.06.14 Added highlight
- 13.06.14 Added submit and action, submitLabel and actionLabel
- 15.06.14 Added height
- 16.06.14 Added dotify, nocolour, toggleDotify, toggleNocolour
- 17.06.14 Added fasta, fastaLabel
           Added consensus
           Added colourScheme/colorScheme
           Added selectColour/selectColor and colourChoices/colorChoices
- 18.06.14 Added tooltips and plainTooltips option
- 19.06.14 Added callback
- 02.09.14 Avoid using write and writeln. Rather use jQuery to insert into DOM.
           Fixes overwrite issues with using after page closure. By: JHN
*/
function printJSAV(divId, sequences, options)
{
   // Deal with options
   if(options              == undefined) { options = Array();                            }
   if(options.width        == undefined) { options.width          = "400px";             }
   if(options.height       == undefined) { options.height         = "6pt";               }
   if(options.submitLabel  == undefined) { options.submitLabel    = "Submit Sequences";  }
   if(options.actionLabel  == undefined) { options.actionLabel    = "Process Sequences"; }
   if(options.nocolor)                   { options.nocolour       = true;                }
   if(options.toggleNocolor)             { options.toggleNocolour = true;                }
   if(options.fastaLabel   == undefined) { options.fastaLabel     = "Export Selected";   }
   if(options.colorScheme)               { options.colourScheme   = options.colorScheme; }
   if(options.colourScheme == undefined) { options.colourScheme   = "taylor";            }
   if(options.selectColor)               { options.selectColour   = true;                }
   if(options.colorChoices != undefined) { options.colourChoices  = options.colorChoices;}
   if(options.deletable)                 { options.selectable     = true;                }

   // Initialize globals if not yet done
   JSAV_init();

   gOptions[divId]         = options;
   gSequences[divId]       = sequences;
   gSequenceLengths[divId] = sequences[0].sequence.length;

   // Enable JQuery tooltips
   if(!options.plainTooltips)
   {
      $(function() {
         $(document).tooltip();
      });
   }

   if(options.consensus)
   {
       gConsensus[divId] = JSAV_buildConsensus(sequences);
   }
   var div = '';
   if($("#" + divId).length == 0) {
       div = $('<div />').appendTo($('body'));
       div.attr('id', divId);
   }
   else{
       div = $("#" + divId);
   }
   var div_sortable = $('<div />').appendTo(div);
   div_sortable.attr('id', divId + '_sortable');
   div_sortable.attr('class', 'JSAVDisplay');

   var html = JSAV_buildSequencesHTML(divId, sequences, options.sortable, 
                                      options.selectable, options.highlight,
                                      options.dotify, options.nocolour, options.consensus);
   div_sortable.append(html);


   var div_controls = $('<div />').appendTo(div);
   div_controls.attr('id', divId + '_controls');
   div_controls.attr('class', 'JSAVControls');

   if(options.sortable)
   {
      var start = 1;
      var stop  = gSequenceLengths[divId];

      JSAV_printSlider(divId, stop, options.width, options.height);

      var html = "<button type='button' class='tooltip' title='Sort the sequences based on the range specified with the slider' onclick='JSAV_sortAndRefreshSequences(\"" + divId + "\", true, " + options.selectable + ", " + options.border + ")'>Sort</button>";
      div_controls.append(html);

   }

   if(options.deletable)
   {
      JSAV_printDelete(divId);
   }

   if(options.submit != undefined)
   {
      JSAV_printSubmit(divId, options.submit, options.submitLabel);
   }

   if(options.action != undefined)
   {
      JSAV_printAction(divId, options.action, options.actionLabel);
   }

   if(options.fasta)
   {
      JSAV_printFASTA(divId);
   }

   // Colour related - on a new line
   if(options.selectColour || options.toggleDotify)
   {
       div_controls.append("<br />");
   }
   if(options.selectColour)
   {
       JSAV_printColourSelector(divId, options);
   }
   if(options.toggleDotify)
   {
       JSAV_printToggleDotify(divId, options);
       if(options.toggleNocolour)
       {
           JSAV_printToggleNocolour(divId, options);
       }
   }

   if(options.border)
   {
       JSAV_modifyCSS(divId);
   }

    // Ensure buttons etc match the data
    window.onload = function(){JSAV_refreshSettings(divId);};

    if(options.callback != undefined)
    {
        window[options.callback](divId);
    }
}

// ---------------------------------------------------------------------
/**
Updates the buttons to match the settings. This is called when the
window is reloaded

@param {string} divId   - The ID of the div we are printing in

@author 
- 17.06.14 Original   By: ACRM
*/
function JSAV_refreshSettings(divId)
{
    if(gOptions[divId].selectColour)
    {
        // Colour scheme
        var tag = "#" + divId + "_selectColour";
        $(tag).val(gOptions[divId].colourScheme);
    }
    if(gOptions[divId].toggleDotify)
    {
        // Dotify option
        var tag = "#" + divId + "_toggleDotify";
        if(gOptions[divId].dotify == undefined)
        {
            $(tag).prop('checked', false);
        }
        else
        {
            $(tag).prop('checked', gOptions[divId].dotify);
        }
    }
    if(gOptions[divId].toggleNocolour)
    {
        // Dotify-nocolour option
        var tag = "#" + divId + "_toggleNocolour";
        if(gOptions[divId].nocolour == undefined)
        {
            $(tag).prop('checked', false);
        }
        else
        {
            $(tag).prop('checked', gOptions[divId].nocolour);
        }
    }
    if(gOptions[divId].selectable)
    {
        // Selectable
        var tag = "#" + divId + "_AllNone";
        $(tag).prop('checked', false);
//        JSAV_unselectAll(divId);
    }
}

// ---------------------------------------------------------------------
/** 
Prints a pulldown menu to select a colour scheme

@param {string} divId   - The ID of the div we are printing in
@param {object} options - User options

@author 
- 17.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than writing to document  By: JHN
*/
function JSAV_printColourSelector(divId, options)
{
   // Initialize colour choices if not provided
   if(options.colourChoices == undefined)
   {
      options.colourChoices = JSAV_initColourChoices();
   }

    var id   = divId + "_selectColour";
    var html = "<select class='tooltip' title='Select colour scheme' id = '" + id + "' onchange='JSAV_setColourScheme(\"" + divId + "\", this)'>";
    for(var i=0; i<options.colourChoices.length; i++)
    {
        var lcChoice = options.colourChoices[i].toLowerCase();
        var selected = "";
        if(options.colourScheme == lcChoice)
        {
            selected = " selected='selected'";
        }
        html += "<option value='" + lcChoice + "'" + selected + ">" + 
                options.colourChoices[i] + "</option>";
    }
    html += "</select>";
    var parrenttag = '#' + divId + '_controls';
    $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Called when the colour scheme selector is changed. Sets the selected
colour scheme and refreshes the display

@param {object}  select   - The select pull-down
@param {string}  divId    - The ID of the div we are working in

@author 
- 17.06.14  Original   By: ACRM
*/
function JSAV_setColourScheme(divId, select)
{
    gOptions[divId].colourScheme = select.value;

    var options = gOptions[divId];
    if(options.sorted)
    {
        JSAV_sortAndRefreshSequences(divId, options.sortable, options.selectable, options.border)
    }
    else
    {
        JSAV_refresh(divId, gSequences[divId], options.sortable, options.selectable, options.border, gStartPos[divId]-1, gStopPos[divId]-1, options.highlight, options.dotify, options.nocolour, options.consensus);
    }
}

// ---------------------------------------------------------------------
/**
Prints the button to allow FASTA export

@param {string} divId   - The ID of the div we are printing in

@author 
- 17.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
*/
function JSAV_printFASTA(divId)
{
   var parrenttag = '#' + divId + '_controls';
   var label = gOptions[divId].fastaLabel;
   var html = "<button type='button' class='tooltip' title='Export the selected sequences, or all sequences if none selected' onclick='JSAV_exportFASTA(\"" + divId + "\")'>"+label+"</button>";
   $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Exports the selected sequences as FASTA

@param {string} divId   - The ID of the div we are printing in

@author 
- 17.06.14 Original   By: ACRM
*/
function JSAV_exportFASTA(divId)
{
   var sequenceText = JSAV_buildFASTA(divId);

   ACRM_dialog("FASTA Export", sequenceText, 600, true);
}

// ---------------------------------------------------------------------
/** 
Print a checkbox for toggling dotify mode

@param {string}  divId    The div that we are working in
@param {object}  options  The options

@author 
- 16.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
*/
function JSAV_printToggleDotify(divId, options)
{
    var html = "";
    var checked = "";
    if(options.dotify) { checked = " checked='checked'"; };
    var id = divId + "_toggleDotify";
    var idText = " id='" + id + "'";
    var onclick = " onclick='JSAV_toggleOption(\"" + divId + "\", \"" + id + "\", \"dotify\")'";
    var tooltip = "Replace repeated residues with dots";

    html += "<span><input type='checkbox'" + idText + checked + onclick + "/><label for='"+id+"' class='tooltip' title='"+tooltip+"'>Dotify</label></span>";

    var parrenttag = '#' + divId + '_controls';
    $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/** 
Print a checkbox for toggling nocolour-dotify mode

@param {string}  divId    The div that we are working in
@param {object}  options  The options

@author 
- 16.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
*/
function JSAV_printToggleNocolour(divId, options)
{
    var html = "";
    var checked = "";
    if(options.nocolour) { checked = " checked='checked'"; };
    var id = divId + "_toggleNocolour";
    var idText = " id='" + id + "'";
    var onclick = " onclick='JSAV_toggleOption(\"" + divId + "\", \"" + id + "\", \"nocolour\")'";
    var tooltip = "Do not colour repeated residues";

    html += "<span><input type='checkbox'" + idText + checked + onclick + "/><label for='"+id+"' class='tooltip' title='"+tooltip+"'>Do not colour dots</label></span>";
    var parrenttag = '#' + divId + '_controls';
    $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/** 
Read a checkbox and toggle the associated option, refreshing the display

@param {string}  divId     The div that we are working in
@param {string}  theButton The ID of the checkbox we are looking at
@param {string}  theOption The name of the option we are toggling

@author 
- 16.06.14 Original   By: ACRM
- 17.06.14 Added consensus
*/
function JSAV_toggleOption(divId, theButton, theOption)
{
    var tag     = "#" + theButton;
    var options = gOptions[divId];
    options[theOption] = $(tag).prop('checked');
    if(options.sorted)
    {
        JSAV_sortAndRefreshSequences(divId, options.sortable, options.selectable, options.border)
    }
    else
    {
        JSAV_refresh(divId, gSequences[divId], options.sortable, options.selectable, options.border, gStartPos[divId]-1, gStopPos[divId]-1, options.highlight, options.dotify, options.nocolour, options.consensus);
    }
}

// ---------------------------------------------------------------------
/**
Builds HTML for table rows that highlight a region in the alignment as
being important (e.g. CDRs of antibodies). Note that ranges for highlighting
count from zero.

@param {string}  divId      - The div we are working in
@param {int}     seqLen     - The length of the alignment
@param {bool}    selectable - Are there sequences selection boxes
@param {int[]}   highlight  - Array of residue ranges to highlight

@author 
- 13.06.14   Original   By: ACRM
*/
function JSAV_buildHighlightHTML(divId, seqLen, selectable, highlight)
{
    var html = "";

    if(selectable)
    {
        html += "<tr class='highlightrow'><th></th>";
        html += "<td></td>";
    }
    else
    {
        html += "<tr class='highlightrow'><td></td>";
    }

    for(var i=0; i<seqLen; i++)
    {
        var displayClass = 'unhighlighted';
        for(var j=0; j<highlight.length; j+=2)
        {
            var start = highlight[j];
            var stop  = highlight[j+1];
            if((i >= start) && (i <= stop))
            {
                displayClass = 'highlighted';
                break;
            }
        }
        html += "<td class='" + displayClass + "' /></td>";
    }
    html += "</tr>\n";
    return(html);
}

// ---------------------------------------------------------------------
/**
Prints the delete button

@param {string}  divId   - The ID of the div to print in

@author 
- 12.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
*/
function JSAV_printDelete(divId)
{
   var parrenttag = '#' + divId + '_controls';
   var html = "<button type='button' class='tooltip' title='Delete the selected sequences' onclick='JSAV_deleteSelectedSequences(\"" + divId + "\")'>Delete Selected</button>";
   $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Prints the submit button

@param {string}  divId   - The ID of the div to print in
@param {string}  url     - URL to which we are submitting
@param {string}  label   - Label for submit button

@author 
- 12.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 02.09.14 Modifies the DOM rather than printing to the document By: JHN
*/
function JSAV_printSubmit(divId, url, label)
{
   var parrenttag = '#' + divId + '_controls';
   var html = "<button type='button' class='tooltip' title='Submit the selected sequences, or all sequences if none selected' onclick='JSAV_submitSequences(\"" + divId + "\")'>" + label + "</button>";
   $(parrenttag).append(html);

   // Build a hidden sequences text box in the form to contain
   var formId = divId + "_form"; 
   var html = "<div style='display:none'><form id='" + formId + "' action='" + url + "' method='post'>";
   var textId = divId + "_submit";
   html += "<textarea id='" + textId + "' name='sequences'></textarea>";
   html += "</form></div>";
   $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Prints the action button

@param {string}  divId   - The ID of the div to print in
@param {string}  action  - Function to call
@param {string}  label   - Label for action button

@author 
- 13.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
*/
function JSAV_printAction(divId, action, label)
{
   var parrenttag = '#' + divId + '_controls';
   var html = "<button type='button' class='tooltip' title='Process the selected sequences, or all sequences if none selected' onclick='JSAV_wrapAction(\"" + divId + "\", \"" + action + "\")'>" + label + "</button>";
   $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/**
Wrap the action function. When the action button is clicked, this function
is called to extract the relevant sequence data and call the user specified
function, passing the divId and an array of sequence objects

@param {string}  divId   - The ID of the div to work in
@param {string}  action  - The name of the user function

@author 
- 13.06.14  Original   By: ACRM
*/
function JSAV_wrapAction(divId, action)
{
   var selectedSequences = Array();

   // See if any checkboxes are set
   var count = 0;
   var toSubmit = Array();
   // Find the selected sequences
   var tag = "#" + divId + " .selectCell input";
   $(tag).each(function(index) {
       if($(this).prop('checked'))
       {
           var id = $(this).parent().parent().attr('id');
           toSubmit[id] = 1;
           count++;
       }
   });

   var textTag = "textarea#" + divId + "_submit";
   var sequenceText = "";
   var sequences = gSequences[divId];
   for(var i=0; i<sequences.length; i++)
   {
      if((count == 0) || (count == sequences.length) || (toSubmit[sequences[i].id] == 1))
      {
         selectedSequences.push({ id: sequences[i].id, sequence: sequences[i].sequence});
      }
   }

   window[action](divId, selectedSequences);
}

// ---------------------------------------------------------------------
/**
Handles the user clicking the submit button. Build a FASTA version of the
sequences that have been selected, fills them into a textarea in a form
and then submits the form.

@param {string} divId  - The ID of the div we are working in

@author 
- 13.06.14  Original   By: ACRM
- 17.06.14  Split out the JSAV_buildFASTA() section
*/
function JSAV_submitSequences(divId)
{
   var sequenceText = JSAV_buildFASTA(divId);

   var textTag = "textarea#" + divId + "_submit";
   $(textTag).text(sequenceText);

   var formTag = "#" + divId + "_form";
   $(formTag).submit();
}

// ---------------------------------------------------------------------
/**
Builds a FASTA version of the sequences that are currently selected, or all
sequences if none are selected

@param {string} divId   - The ID of the div we are printing in

@author 
- 17.06.14 Split out from JSAV_submitSequences()  By: ACRM
*/
function JSAV_buildFASTA(divId)
{
   // See if any checkboxes are set
   var count = 0;
   var toFASTA = Array();
   // Find the selected sequences
   var tag = "#" + divId + " .selectCell input";
   $(tag).each(function(index) {
       if($(this).prop('checked'))
       {
           var id = $(this).parent().parent().attr('id');
           toFASTA[id] = 1;
           count++;
       }
   });

   var sequenceText = "";
   var sequences = gSequences[divId];
   for(var i=0; i<sequences.length; i++)
   {
       if((count == 0) || (count == sequences.length) || (toFASTA[sequences[i].id] == 1))
       {
           sequenceText += ">" + sequences[i].id + "\n";
           sequenceText += sequences[i].sequence + "\n";
       }
   }

   return(sequenceText);
}

// ---------------------------------------------------------------------
/**
Deletes a set of sequences that have been clicked

@param {string}  divId   - The ID of the div to work in

@author 
- 12.06.14 Original   By: ACRM
- 15.06.14 Changed from alert() to ACRM_alert()
- 16.06.14 Changed from confirm() to ACRM_confirm()
- 17.06.14 Added consensus
*/
function JSAV_deleteSelectedSequences(divId)
{
    var count = 0;
    var toDelete = Array();
    // Find the selected sequences
    var tag = "#" + divId + " .selectCell input";
    $(tag).each(function(index) {
        if($(this).prop('checked'))
        {
            var id = $(this).parent().parent().attr('id');
            toDelete.push(id);
            count++;
        }
    });

    if(count == 0)
    {
        ACRM_alert("Error!","You must select some sequences!");
    }
    else if(count == gSequences[divId].length)
    {
        ACRM_alert("Error!","You can't delete all the sequences!");
    }
    else
    {
        var message = "Delete " + count + " selected sequences?";
        ACRM_confirm("Confirm", message, function(confirm){
            if(confirm)
            {
                // Run through the global sequence array deleting the selected objects
                for(var i=0; i<toDelete.length; i++)
                {
                    ACRM_deleteItemByLabel('id', toDelete[i], gSequences[divId]);
                }

                var options = gOptions[divId];

                // Update the consensus
                if(options.consensus)
                {
                    gConsensus[divId] = JSAV_buildConsensus(gSequences[divId]);
                }

                // Refresh the display
                JSAV_refresh(divId, gSequences[divId], options.sortable, 
                             options.selectable, options.border, 
                             gStartPos[divId]-1, gStopPos[divId]-1, options.highlight,
                             options.dotify, options.nocolour, options.consensus);
                options.sorted = false;
            }
        });
    }
}

// ---------------------------------------------------------------------
/**
Toggle selection of all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
*/
function JSAV_selectAllOrNone(divId)
{
   var tag = "#" + divId + "_AllNone";

   if($(tag).prop('checked'))
   {
       JSAV_selectAll(divId);
   }
   else
   {
       JSAV_unselectAll(divId);
   }
}


// ---------------------------------------------------------------------
/**
Select all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
*/
function JSAV_selectAll(divId)
{
   var tag = "#" + divId + " .selectCell input";
   $(tag).prop('checked', true);
}

// ---------------------------------------------------------------------
/**
Unselect all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
*/
function JSAV_unselectAll(divId)
{
   var tag = "#" + divId + " .selectCell input";
   $(tag).prop('checked', false);
}

// ---------------------------------------------------------------------
/**
Change the <td> elements to have a white border

@param {string}  divId   - The ID of the div to work in

@author 
- 12.06.14 Original   By: ACRM
*/
function JSAV_modifyCSS(divId)
{
    var selector = "#" + divId + " .JSAV td";
    $(selector).css("border", "1px solid white");
}

// ---------------------------------------------------------------------
/**
Builds the HTML for printing a sequence as a table row. The row 
starts with the identifier and is followed by each amino acid in a 
separate <td> tag with a class to indicate the amino acid type 
(e.g. taylorW for a tryptophan in Willie Taylor scheme). 

@param {string}   id            The identifier
@param {string}   sequence      A string containing the sequence
@param {string}   prevSequence  A string containing the previous sequence
@param {bool}     selectable    Display a selection checkbox
@param {bool}     dotify        Dotify the sequence
@param {bool}     nocolour      Don't colour dotified residues
@param {bool}     isConsensus   This is the consensus sequence
@returns {string} text          HTML snippet

@author 
- 30.05.14 Original  By: ACRM
- 16.06.14 Added dotify and nocolour - now takes prevSequence parameter
- 17.06.14 Added isConsensus and colourScheme
- 18.06.14 Added tooltip
*/
function JSAV_buildASequenceHTML(id, sequence, prevSequence, selectable, dotify, nocolour,
                                isConsensus, colourScheme)
{
    var seqArray = sequence.split("");
    var prevSeqArray = undefined;

    if(dotify && (prevSequence != undefined))
    {
        prevSeqArray = prevSequence.split("");
    }

    var tableLine = "";
    if(isConsensus)
    {
        tableLine = "<tr class='tooltip' title='The consensus shows the most frequent amino acid. This is lower case if &le;50% of the sequences have that residue.' id='" + id + "'>";
    }
    else
    {
        tableLine = "<tr id='" + id + "'>";
    }
    tableLine += "<th class='titleCell'>" + id + "</th>";

    if(selectable)
    {
        if(isConsensus)
        {
            tableLine += "<th class='consensusSelectCell'></th>";
        }
        else
        {
            var name = "select_" + id;
            tableLine += "<th class='selectCell'><input type='checkbox' name='" + name + "' /></th>";
        }
    }

    var consensusClass = "";
    if(isConsensus)
    {
        consensusClass = " consensusCell";
    }

    var nResidues = seqArray.length;
    if(dotify && !isConsensus)
    {
        for(var i=0; i<nResidues; i++)
        {
            var aa     = seqArray[i];
            var prevAa = '#';

            var colourClass = colourScheme + aa.toUpperCase();
            if(nocolour)
            {
                if(aa == "-") 
                { 
                    colourClass = "aaDel"; 
                }
            }

            if(prevSeqArray != undefined)
            {
                prevAa = prevSeqArray[i];
            }
            if(aa == prevAa)
            {
                if(nocolour)
                {
                    if(aa == '-')
                    {
                        colourClass = "aaDel";
                    }
                    else
                    {
                        colourClass = "aaDot";
                    }
                }
                if(aa != '-') {aa = '.';}
            }
            tableLine += "<td class='" + colourClass + "'>" + aa + "</td>";
        }
    }
    else
    {
        for(var i=0; i<nResidues; i++)
        {
            var aa = seqArray[i];
            tableLine += "<td class='" + colourScheme + aa.toUpperCase() + consensusClass + "'>" + aa + "</td>";
        }
    }
    tableLine += "</td></tr>";

    return(tableLine);
}

// ---------------------------------------------------------------------
/**
Builds and prints the slider for selecting a maximum and minimum position for
sorting. Also calls routine to display the currently selected range -
i.e. the whole sequence length

@param {string}   divId   The name of the div used for the display
@param {int}      seqLen  The length of the sequence alignment
@param {string}   width   The width of the slider
@param {string}   height  The height of the slider (text size)

@author 
- 06.06.14  Original   By: ACRM
- 10.06.14  Removed redundant variable and changed divs to spans
- 15.06.14 Added height
*/
function JSAV_printSlider(divId, seqLen, width, height)
{

   var parrenttag = '#' + divId + '_controls';
   var id = divId + "_slider";
   var tag = "#" + id;

   var span_showrange = $("<span id='" + divId + "_showrange'></span>").appendTo(parrenttag);
   var span_slider = $("<span id='" + divId + "_slider'></span>").appendTo(parrenttag);

   $(tag).css('width',   width);
   $(tag).css('margin',  '10px');
   $(tag).css('display', 'block');

   $(tag).slider({
         range: true,
         min: 1,
         max: seqLen,
         values: [1, seqLen],
         slide: JSAV_showRange
   });

   // Initial display of the range
   JSAV_showRange(divId);
}

// ---------------------------------------------------------------------
/**
Displays the currently selected range as text and calls the routine
to higlight that range in the alignment view.

Called as JSAV_showRange(divID), or as a callback from a slider event

@param {JQEvent}   eventOrId    JQuery Event
@param {JQ-UI}     ui           JQuery UI object
--OR--
@param {text}      ebentOrId    Identifier of the display div
@param {null}      ui           Must be set to null

@author 
- 06.06.14  Original   By: ACRM
- 10.06.14  Removed redundant .closest() from finding parent
*/
function JSAV_showRange(eventOrId, ui)
{
   // Here the eventOrId is the id of the div where we are working
   if(ui == null)
   {
      // Get the values out of the slider
      var tag = "#" + eventOrId + "_slider";
      gStartPos[eventOrId] = $(tag).slider("values", 0);
      gStopPos[eventOrId]  = $(tag).slider("values", 1);

      // Display the range currently selected
      tag = "#" + eventOrId + "_showrange";
      var html = "Sort from: " + gStartPos[eventOrId] + " to: " + gStopPos[eventOrId];
      $(tag).text(html);
      JSAV_markRange(eventOrId, gSequenceLengths[eventOrId], gStartPos[eventOrId]-1, gStopPos[eventOrId]-1);
   }
   else
   {
      var id = $(this).parent().parent().attr("id");
      var tag = "#" + id + "_showrange";

      // Get the values out of the slider
      gStartPos[id] = ui.values[0];
      gStopPos[id]  = ui.values[1];

      // Display the range currently selected
      var html = "Sort from: " + gStartPos[id] + " to: " + gStopPos[id];
      $(tag).text(html);
      JSAV_markRange(id, gSequenceLengths[id], gStartPos[id]-1, gStopPos[id]-1);
   }
}

// ---------------------------------------------------------------------
/**
Simple wrapper function to obtain the currently selected range

@param   {string}   divId    Identifier for display div
@returns {int[]}             Start and stop of range

@author 
- 06.06.14  Original   By: ACRM
*/
function JSAV_getRange(divId)
{
   var start = gStartPos[divId]-1;
   var stop  = gStopPos[divId]-1;
   return([start, stop]);
}

// ---------------------------------------------------------------------
/**
Takes an array of sequence objects and builds the HTML to display
them as a coloured table

@param   {string}     divId       ID of div in which to print
@param   {object[]}   sequences   Array of sequence objects
@param   {bool}       sortable    Should the marker line be displayed
                                  for sortable displays
@param   {bool}       selectable  Should check marks be displayed
@param   {int[]}      highlight   Ranges to be highlighted
@param   {bool}       dotify      Dotify the sequence alignment
@param   {bool}       nocolour    Don't colout dotified residues
@returns {string}                 HTML

@author 
- 30.05.14 Original  By: ACRM
- 06.06.14 Added call to build the marker row of selected residues
- 10.06.14 Added sortable and selectable parameters
- 13.06.14 Added highlight
- 16.06.14 Added dotify
- 17.06.14 Added consensus
*/
function JSAV_buildSequencesHTML(divId, sequences, sortable, selectable, highlight,
                                 dotify, nocolour, consensus)
{
   var html = "";
   html += "<div class='JSAV'>\n";
   html += "<table border='0'>\n";

   if(selectable)
   {
       // Create the toggle all/none selection button
       html += JSAV_buildSelectAllHTML(divId, gSequenceLengths[divId]);
   }

   if(highlight != undefined)
   {
       // If we are highlighting regions in the sequence, do so
       html += JSAV_buildHighlightHTML(divId, gSequenceLengths[divId], selectable, highlight);
   }

   // Build the actual sequence entries
   for(var i=0; i<sequences.length; i++)
   {
      var prevSequence = undefined;
      if(i>0) { prevSequence = sequences[i-1].sequence; }
      html += JSAV_buildASequenceHTML(sequences[i].id, sequences[i].sequence, prevSequence, 
                                      selectable, dotify, nocolour, false, 
                                      gOptions[divId].colourScheme) + "\n";
   }

   if(consensus != undefined)
   {
       html += JSAV_buildASequenceHTML('Consensus', gConsensus[divId], undefined, selectable,
                                       dotify, nocolour, true, gOptions[divId].colourScheme) + "\n";
   }

   if(highlight != undefined)
   {
       // If we are highlighting regions in the sequence, do so again at the bottom of the table
       html += JSAV_buildHighlightHTML(divId, gSequenceLengths[divId], selectable, highlight);
   }

   if(sortable)
   {
      // The marker section which shows the range selected for sorting
      html += JSAV_buildMarkerHTML(divId, gSequenceLengths[divId], selectable);
   }

   html += "</table>\n";
   html += "</div>\n";
   return(html);
}

// ---------------------------------------------------------------------
/**
Build the HTML for creating a row in the table that contains a checkbox
for selecting/deselecting all sequences

@param {string}  divId  - ID of the div we are working in
@param {int}     seqLen - sequence length

@author 
- 09.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
*/
function JSAV_buildSelectAllHTML(divId, seqLen)
{
   var html;
   var id = divId + "_AllNone";

   html = "<tr><th>All/None</th><th><input class='tooltip' title='Select or deselect all sequences' id='" + id + "' type='checkbox' onclick='JSAV_selectAllOrNone(\"" + divId + "\");' /></th>";
   for(var i=0; i<seqLen; i++)
   {
      html += "<td></td>";
   }
   html += "</tr>";
   return(html);
}

// ---------------------------------------------------------------------
/**
Creates the HTML to display the marker row that indicates the selected
residues to be used for sorting

@param {string}   divId      - Identifier of display div
@param {int}      seqLen     - Length of sequences alignement
@param {int}      selectable - Do we have select boxes?

@author 
- 06.06.14  Original   By: ACRM
- 10.06.14  Added 'selectable'
*/
function JSAV_buildMarkerHTML(divId, seqLen, selectable)
{
    var html = "";

    if(selectable)
    {
        html += "<tr class='markerrow'><th>Sort Region:</th>";
        html += "<th class='selectCell'></th>";
    }
    else
    {
        html += "<tr class='markerrow'><td class='titleCell'>Sort Region:</td>";
    }

    for(var i=0; i<seqLen; i++)
    {
        var id = divId + "_JSAVMarker" + i;
        html += "<td id='" + id + "' class='unmarked'>&nbsp;</td>";
    }
    html += "</tr>\n";
    return(html);
}

// ---------------------------------------------------------------------
/**
Finds the real ends of a sequence stored in an array by skipping over
'-' characters. Returns the offsets of the actual ends. 
NOTE: Consequently to loop over the sequence you now need to do 
   for(var i=seqEnds[0]; i<=seqEnds[1]; i++)
i.e. <= rather than < the last position

@param   {char[]}   seqArray   Sequence stored in an array
@returns {int[]}               Offsets of first and last real
                               amino acid

@author 
- 04.06.14 Original   By: ACRM
*/
function JSAV_FindRealSequenceEnds(seqArray)
{
   var seqEnds = [];

   // Find the real start - just increment the counter while there is a - in the sequence
   seqEnds[0] = 0;
   while((seqArray[seqEnds[0]] == '-') || (seqArray[seqEnds[0]] == ' '))
   {
      seqEnds[0]++;
   }

   // Find the real end - just decrement the counter while there is a - in the sequence
   seqEnds[1] = seqArray.length - 1;
   while((seqArray[seqEnds[1]] == '-') || (seqArray[seqEnds[1]] == ' '))
   {
      seqEnds[1]--;
   }

   return(seqEnds);
}

// ---------------------------------------------------------------------
/**
Choose a representative from a difference matrix. The difference
matrix contains the number of differences between each pair of 
sequences. This routine simply totals up the number of differences
for each sequence compared with all the other sequences and then
chooses the one with fewest differences

@param {int-2DArray}  differenceMatrix  Differences between each pair
                                    of sequences
@eturns {int}                        Index of the representative
                                    sequence

@author 
- 29.05.14 Original   By: ACRM
*/
function JSAV_chooseRepresentative(differenceMatrix)
{
   var totalDiffs = [];
   var nSeqs = differenceMatrix.length;

   // For each sequence, find its total differences from all other 
   // sequences
   for(var i=0; i<nSeqs; i++)
   {
      totalDiffs[i] = 0;
      for(var j=0; j<differenceMatrix[i].length; j++)
      {
         totalDiffs[i] += differenceMatrix[i][j];
      }
   }

   // Find which sequence is most similar to all the other sequences
   var lowestDiff = 1000000;
   var representative = -1;
   for(var i=0; i<nSeqs; i++)
   {
      if(totalDiffs[i] < lowestDiff)
      {
         lowestDiff = totalDiffs[i];
         representative = i;
      }
   }

   return(representative);
}

// ---------------------------------------------------------------------
/**
Takes an array of sequence indexes, the index of a reference sequence
and the difference matrix between all sequences. It then returns an
array of sequence indexes for all the sequences most similar to the
reference sequence

@param  {int[]}       sequenceIndexes   Indexes of a set of sequences to search
@param  {int}         refSeq            Index of the sequence to compare with
@param  {int-2DArray} differenceMatrix  differences between sequences
@eturns {int[]}                         Indexes of the sequences closest to
                                        the reference sequence

@author 
- 04.06.14 Original    By: ACRM
*/
function JSAV_findClosestSequences(sequenceIndexes, refSeq, differenceMatrix)
{
   var closestSequences = [];
   var smallestDifference = 1000000;

   for(var i=0; i<sequenceIndexes.length; i++)
   {
      // Find the difference between the specified reference sequence
      var thisDifference =
         differenceMatrix[sequenceIndexes[i]][refSeq]; 
      if(thisDifference < smallestDifference)
      {
         smallestDifference = thisDifference;
         closestSequences = [];
         closestSequences.push(sequenceIndexes[i]);
      }
      else if(thisDifference == smallestDifference)
      {
         closestSequences.push(sequenceIndexes[i]);
      }
   }
   
   return(closestSequences);
}


// ---------------------------------------------------------------------
/**
Sorts an array of sequence objects to group similar sequences together.
The sorting method chooses a representative sequence (one
which is most similar to all the other sequences) placing that first
in the list. To add to the sorted list, it iteratively chooses the
sequences that are most similar to the last one in the list and, of
those chooses the sequence most similar to the representative
sequence

@param   {object[]}   sequences   Array of sequence objects
@param   {int}        start       Offset of start of region to sort
@param   {int}        stop        Offset of end of region to sort
@returns {object[]}               Sorted array of sequence objects

@author 
- 29.05.14 Original   By: ACRM
- 04.06.14 Added ignoreEnds (true) to JSAV_calcDifferenceMatrix() call
         Range version
*/
function JSAV_sortSequences(sequences, start, stop)
{
   var sortedSequences = [];
   var sortedIndexes   = [];
   var nSeqs           = sequences.length;
   var ignoreEnds      = false;

   // If the start or stop is specified as -1, or we are looking at the
   // whole sequence, then ignore missing residues at the ends during 
   // the sort

   if((start < 0) || (stop < 0) ||
      ((start == 0) && (stop == (sequences[0].sequence.length - 1))))
   {
      ignoreEnds = true;
   }

   // Initialize array of sequences that have been used in the sorted 
   // output
   var used = [];
   for(var i=0; i<nSeqs; i++)
   {
      used[i] = 0;
   }

   // Choose a representative sequence for the top of the list
   var differenceMatrix = JSAV_calcDifferenceMatrix(sequences, start, stop, ignoreEnds);
   var representative   = JSAV_chooseRepresentative(differenceMatrix);
   sortedIndexes[0]     = representative;
   used[representative] = 1;
   var nSortedSeqs      = 1;

   while(nSortedSeqs < nSeqs)
   {
      // Initialize array of sequence IDs to contain all unused sequences
      var unusedSequences = [];
      for(var i=0; i<nSeqs; i++)
      {
         if(!used[i])
         {
            unusedSequences.push(i);
         }
      }
      
      // Find the sequences which are closest to the last sequence in the
      // sorted list
      var closestSequencesToLast = 
         JSAV_findClosestSequences(unusedSequences, sortedIndexes[nSortedSeqs-1], differenceMatrix);

      // Of the sequences most similar to the last one in the sorted
      // list, find the ones most similar to the representative sequence
      var closestSequencesToReference = 
         JSAV_findClosestSequences(closestSequencesToLast, sortedIndexes[0], differenceMatrix);

      // Take the first of these as the next sequence in the sorted list
      var mostSimilar = closestSequencesToReference[0];
      sortedIndexes[nSortedSeqs++] = mostSimilar;
      used[mostSimilar] = 1;
   }

   // Finally copy across the sequences in sorted order
   for(var i=0; i<nSeqs; i++)
   {
      sortedSequences[i] = sequences[sortedIndexes[i]];
   }

   return(sortedSequences);
}


// ---------------------------------------------------------------------
/**
Takes an array of sequence objects and generates a 2D difference
matrix. This contains the number of differences between each pair
of sequences

@param  {object[]}  sequences    Array of sequence objects
@param  {int}       start        Offset of start of region to sort
@param  {int}       stop         Offset of end of region to sort
@param  {BOOL}      ignoreEnds   Ignore insert characters at
                                 ends of sequences
@eturns {int-2DArray}                Differences between each pair
                                 of sequences

@author 
- 29.05.14 Original   By: ACRM
- 04.06.14 Added ignoreEnds handling
         Range version
*/
function JSAV_calcDifferenceMatrix(sequences, start, stop, ignoreEnds)
{
   var nSeq = sequences.length;

   var differenceMatrix = ACRM_array(nSeq, nSeq);
   for(var i=0; i<nSeq; i++)
   {
      for(var j=0; j<nSeq; j++)
      {
         differenceMatrix[i][j] =
         JSAV_calcDifference(sequences[i].sequence, sequences[j].sequence, start, stop, ignoreEnds);
      }
   }
   return(differenceMatrix);
}


// ---------------------------------------------------------------------
/**
Takes two sequences as strings and calculates the number of 
differences between them (effectively the Hamming distance).
If ignoreEnds is specified then don't include gap characters at 
the ends of the sequences

@param   {string} seq1        Sequence string
@param   {string} seq2        Sequence string
@param   {int}    regionStart Offset of start of region to sort
@param   {int}    regionStop  Offset of end of region to sort
@param   {BOOL}   ignoreEnds  Ignore gaps at the end of the sequences
                              in calculating differences
@returns {int}                Number of differences between the sequences

@author 
- 29.05.14 Original  By: ACRM
- 04.06.14 Added ignoreEnds handling
         Created this Range version
*/
function JSAV_calcDifference(seq1, seq2, regionStart, regionStop, ignoreEnds)
{
   var seqArray1   = [];seq1.substring(regionStart, regionStop+1).split("");
   var seqArray2   = [];

   if((regionStart < 0) || (regionStop < 0))
   {
      seqArray1 = seq1.split("");
      seqArray2 = seq2.split("");
   }
   else
   {
      seqArray1 = seq1.substring(regionStart, regionStop+1).split("");
      seqArray2 = seq2.substring(regionStart, regionStop+1).split("");
   }

   var differences = 0;

   var seqLen = Math.max(seqArray1.length, seqArray2.length);

   var start = 0;
   var stop  = seqLen - 1;
   
   if(ignoreEnds)
   {
      // Find the offsets of the first and last real residue in the sequences
      var seq1Ends = JSAV_FindRealSequenceEnds(seqArray1);
      var seq2Ends = JSAV_FindRealSequenceEnds(seqArray2);

      start = Math.max(seq1Ends[0], seq2Ends[0]);
      stop  = Math.min(seq1Ends[1], seq2Ends[1]);
   }

   for(var i=start; i<=stop; i++)
   {
      if(seqArray1[i] != seqArray2[i])
      {
         differences++;
      }
   }
   return(differences);
}


// ---------------------------------------------------------------------
/**
Sorts a set of sequences and refreshes the display in a div with
the specified ID - the idea is that the unsorted sequences would
be displayed here and then this is tied to the action on a button
that sorts and refreshes the display.

@param {char}  divId        ID of an HTML <div>
@param {bool}  sortable     Is the display sortable
@param {bool}  selectable   Are checkboxes shown next to sequences
@param {bool}  border       Should CSS be updated to show a border

@author 
- 29.05.14 Original   By: ACRM
- 11.06.14 sequences is now global
- 12.06.14 split out the JSAV_refresh() part
- 16.06.14 Added dotify and nocolour options to refresh call
- 17.06.14 Added consensus
*/
function JSAV_sortAndRefreshSequences(divId, sortable, selectable, border)
{
   var id = divId + "_JSAVStart";

   var range=JSAV_getRange(divId);
   var sortedSequences = JSAV_sortSequences(gSequences[divId], range[0], range[1]);

   JSAV_refresh(divId, sortedSequences, sortable, selectable, border, 
                range[0], range[1], gOptions[divId].highlight, 
                gOptions[divId].dotify, gOptions[divId].nocolour, 
                gOptions[divId].consensus);

   // Record the fact that the display has been sorted
   gOptions[divId].sorted = true;

   return(false);
}


// ---------------------------------------------------------------------
/**
Refreshes the content of the divId_sortable div with the new sequence table
Also updates the marked range and the CSS if the border option is set

@param {char}     divId        ID of an HTML <div>
@param {object[]} sequences    Array of sequence objects
@param {bool}     sortable     Is the display sortable
@param {bool}     selectable   Are checkboxes shown next to sequences
@param {bool}     border       Should CSS be updated to show a border
@param {int}      start        start of selected region
@param {int}      stop         end of selected region
@param {int[]}    highlight    regions to be highlighted
@param {bool}     dotify        Dotify the sequence
@param {bool}     nocolour      Don't colour dotified residues

@author 
- 12.06.14  Original split out from JSAV_sortAndRefreshSequences() By: ACRM
- 16.06.14  Added dotify and nocolour
- 17.06.14  Added consensus
- 19.06.14  Added callback
*/
function JSAV_refresh(divId, sequences, sortable, selectable, border, 
                      start, stop, highlight, dotify, nocolour, consensus)
{
   var html = JSAV_buildSequencesHTML(divId, sequences, sortable, 
                                      selectable, highlight, dotify, nocolour, consensus);
   var element = document.getElementById(divId + "_sortable");
   element.innerHTML = html;
   if(border)
   {
       JSAV_modifyCSS(divId);
   }
   JSAV_markRange(divId, gSequenceLengths[divId], start, stop);

    if(gOptions[divId].callback != undefined)
    {
        window[gOptions[divId].callback](divId);
    }

}

// ---------------------------------------------------------------------
/**
Marks a range of residues in the main sequence display table.
The special marker row is used for this and we simply alter the
class to pick up the appropriate colour for the cells from CSS

@param {string}    divId   Identifier for the display div
@param {int}       seqLen  Length of the alignment
@param {int}       start   Offset of first residue to be
                           marked (0-based)
@param {int}       stop    Offset of last residue to be
                           marked (0-based)

@author 
- 06.06.14  Original   By: ACRM
- 13.06.14  Changed from highlighted to marked
*/
function JSAV_markRange(divId, seqLen, start, stop)
{
   for(var i=0; i<seqLen; i++)
   {
       var id = divId + "_JSAVMarker" + i;
       document.getElementById(id).className = 'unmarked';
   }
   if((start >= 0) && (stop >= 0))
   {
      for(var i=start; i<=stop; i++)
      {
          var id = divId + "_JSAVMarker" + i;
          document.getElementById(id).className = 'marked';
      }
   }
}

// ---------------------------------------------------------------------
/**
Initializes global arrays

@author 
- 09.06.14 Original   By: ACRM
- 12.06.14 Added more arrays
- 17.06.14 Added gConsensus array
*/
function JSAV_init()
{
   // Indexed by divId and used to store the values
   try
   {
       if(gSequences == undefined)
       {
           ;
       }
   }
   catch(err)
   {
       gSequences = Array();
       gOptions   = Array();
       gStartPos  = Array();
       gStopPos   = Array();
       gConsensus = Array();
       gSequenceLengths = Array();
   }
}


// ---------------------------------------------------------------------
/**
Simply returns an array of the available colouring schemes in the CSS
file

@returns {string[]}   - Colour schemes

@author 
- 17.06.14   Original   By: ACRM
*/
function JSAV_initColourChoices()
{
    return(['Taylor', 'Clustal', 'Zappo', 'HPhob', 'Helix', 'Strand',
            'Turn', 'Buried']);
}

// ---------------------------------------------------------------------
/**
Calculates a consensus sequence

@param   {object[]}  sequences  - Array of sequence objects
@returns {string}               - Consensus sequence

@author 
- 17.06.14  Original   By: ACRM
*/
function JSAV_buildConsensus(sequences)
{
    var nSeqs    = sequences.length;
    var seqLen   = sequences[0].sequence.length;
    // Initialize array
    var aaCounts = Array(seqLen);
    for(var i=0; i<seqLen; i++)
    {
        aaCounts[i] = Array();
    }

    // Step through the sequences
    for(var seq=0; seq<nSeqs; seq++)
    {
        var seqArray = sequences[seq].sequence.split('');

        // Step through the positions
        for(var pos=0; pos<seqLen; pos++)
        {
            if(aaCounts[pos][seqArray[pos]] == undefined)
            {
                aaCounts[pos][seqArray[pos]] = 1;
            }
            else
            {
                aaCounts[pos][seqArray[pos]]++;
            }
        }
    }

    // Step through the positions to determine the most common residue
    var consensus = "";
    var validAAs = "ACDEFGHIKLMNPQRSTVWY-".split('');
    for(var pos=0; pos<seqLen; pos++)
    {
        var mostCommon = undefined;
        var maxAA      = 0;
        for(var aaCount=0; aaCount<validAAs.length; aaCount++)
        {
            if((aaCounts[pos][validAAs[aaCount]] != undefined) &&
               (aaCounts[pos][validAAs[aaCount]] >  maxAA))
            {
                mostCommon = validAAs[aaCount];
                maxAA = aaCounts[pos][validAAs[aaCount]];
            }
        }
        if(maxAA <= (nSeqs / 2))
        {
            mostCommon = mostCommon.toLowerCase();
        }
        consensus += mostCommon;
    }
    return(consensus);
}


// ---------------------------------------------------------------------
/** 
General purpose routine to delete an object from an array of objects
where the object contains the specified key:value pair.

@param {string}   key   - The key (item in an object or hash key) 
                          to check
@param {string}   value - The value to check
@param {object[]} array - The array of objects to manipulate

@author 
- 12.06.14 Original   By: ACRM
*/
function ACRM_deleteItemByLabel(key, value, array)
{
    for(var i=0; i<array.length; i++)
    {
       if(array[i][key] == value)
       {
           array.splice(i,1);
           break;
       }
    }
}

// ---------------------------------------------------------------------
/**
General purpose function to create a multi-dimensional array

@param   {int/int[]}  length   Size of each dimension
@returns {array}                  (multi-dimensional) Array

Usage:
ACRM_array();     // [] or new Array()
ACRM_array(2);    // new Array(2)
ACRM_array(3, 2); // [new Array(2),
                  //  new Array(2),
                  //  new Array(2)]

@author 
- 29.05.14 Taken from http://stackoverflow.com/questions/966225/
           how-can-i-create-a-two-dimensional-array-in-javascript
*/
function ACRM_array(length) 
{
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) 
    {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = ACRM_array.apply(this, args);
    }

    return arr;
}


// ---------------------------------------------------------------------
/**
General purpose confirm() dialogue using JQueryUI dialog rather than the
simple JavaScript confirm() method

@param {string}   title    - title for the confirm box
@param {string}   msg      - the message to be displayed
@param {function} callback - function to be called after the OK or cancel
                             button is called. A boolean parameter is
                             passed to the function - true for OK, false
                             for cancel

@author 
- 15.06.14 Original   By: ACRM
*/
function ACRM_confirm(title, msg, callback) 
{
    var dialogObj = $("<div style='display:none' title='" + title + "'>"+msg+"</div>");
    $('body').append(dialogObj);
    $(dialogObj).dialog({
        resizable: false,
        modal: true,
        buttons: {
            Cancel: function() {
                callback(false);
                $( this ).dialog( "close" );
                $( this ).remove();
            },
            "OK": function() {
                callback(true);
                $( this ).dialog( "close" );
                $( this ).remove();
            }
        }
    });
};

// ---------------------------------------------------------------------
/**
General purpose alert() dialogue using JQueryUI dialog rather than the
simple JavaScript alert() method

@param {string}   title    - title for the confirm box
@param {string}   msg      - the message to be displayed

@author 
- 15.06.14 Original   By: ACRM
*/
function ACRM_alert(title, msg) 
{
    var dialogObj = $("<div style='display:none' title='" + title + "'>"+msg+"</div>");
    $('body').append(dialogObj);
    $(dialogObj).dialog({
        resizable: false,
        modal: true,
        buttons: {
            "OK": function() {
                $( this ).dialog( "close" );
                $( this ).remove();
            }
        }
    });
};

// ---------------------------------------------------------------------
/**
General purpose dialogue using JQueryUI dialog

@param {string}   title    - title for the confirm box
@param {string}   msg      - the message to be displayed
@param {string}   width    - the width of the window (e.g. '600px')
@param {bool}     pre      - wrap the displayed text in <pre> tags

@author 
- 17.06.14 Original   By: ACRM
*/
function ACRM_dialog(title, msg, width, pre) 
{
    var dialogObj;
    if(pre)
    {
        dialogObj = $("<div style='display:none' title='" + title + "'><pre>"+msg+"</pre></div>");
    }
    else
    {
        dialogObj = $("<div style='display:none' title='" + title + "'>"+msg+"</div>");
    }
    $('body').append(dialogObj);
    $(dialogObj).dialog({
        resizable: false,
        width: width,
        modal: true,
        buttons: {
            "Dismiss": function() {
                $( this ).dialog( "close" );
                $( this ).remove();
            }
        }
    });
};


