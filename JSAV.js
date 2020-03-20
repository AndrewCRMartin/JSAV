/** @preserve 
    @file
    JSAV V2.0 13.05.19
    Copyright:  (c) Dr. Andrew C.R. Martin, UCL, 2014-2016
    This program is distributed under the Gnu Public Licence (GPLv2)
*/
/** ***********************************************************************
   Program:    JSAV  
   File:       JSAV.js
   
   Version:    V2.0
   Date:       13.05.19
   Function:   JavaScript Sequence Alignment Viewier
   
   Copyright:  (c) Dr. Andrew C.R. Martin, UCL, 2014-2016
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
   V1.7    23.09.15   Added options.toggleDotifyLabel
                      Added options.toggleNocolourLabel and options.toggleNocolorLabel
                      Added options.deleteLabel
                      Added options.idSubmit
                      By: ACRM
   V1.8    24.09.15   Added options.scrollX and options.scrollY
   V1.9    22.12.15   Added options.labels array and label printing
   V1.10   11.02.16   Modified JSAV_wrapAction() to add whole sequence 
                      object to output array rather than just the ID and sequence
                      Added options.idSubmitAttribute so that clicking on an
                      ID can now call a URL with things other than the sequence
   V1.10.1 25.02.16   Delete button is now correctly 'deletebutton' class
                      instead of 'delete' class
   V2.0	   13.05.19   New functiionality includes greatly modified JSAV sequence viewer and datatable viewer.
                      Functionality includes:
                      - Datatable viewer included, with hiding of columns, sorting on column value, 
                        hiding table rows.
                      - Communication between sequence view and datatable view: sorting and row hiding will
                        be duplicated for both views.
                      - Modified sequence sorting routines.
                      - Export to CSV and Excel.

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
var Seqs = [];
Seqs.push({id :"id1b1.L", sequence :"SASSSVNYMYACREFGHIKLMNPTRSTVWY"});
Seqs.push({id :"id1a.L",  sequence :"SASSSTNYMYACDEFGHIKLMNPQRSTVWY"});

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

Note that the sequence object can contain additional fields that mean nothing to
JSAV itself but may be used by 'actions' that are called from JSAV (e.g. an
accession code).


@param {object[]}  sequences                      - Array of sequence objects
@param {string}    divId                          - ID of div to print in
@param {Object}    options                        - Options that can be provided - see Properties
@property {bool}      options.sortable            - Should the sorting options be displayed
                                                    (default: false)
@property {bool}      options.selectable          - Should selection checkboxes be displayed
                                                    for each sequence
@property {bool}      options.deletable           - Makes it possible to delete sequences
@property {bool}      options.hideable	          - Makes it possible to hide sequences and respective
						    datatable rows
@property {bool}      options.hideLabel	       	  - Label for hide button.
@property {bool}      options.showallLabel        - Label for Show All button.
@property {string}    options.deleteLabel         - Label for delete button
@property {int[]}     options.highlight           - Array of ranges to highlight
@property {string}    options.submit              - URL for submitting selected sequences
@property {string}    options.submitLabel         - Label for submit button
@property {bool}      options.idSubmitClean       - Remove non-alpha characters from sequence
                                                    before submitting
@property {string}    options.action              - Function to call using selected sequences.
                                                    This is passed the seqId and array of
                                                    currently selected sequence objects
@property {string}    options.actionLabel         - Label for action button
@property {bool}      options.dotify              - Repeated amino acids in the sequence are
                                                    replaced by a dot
@property {bool}      options.nocolour            - Dotified amino acids are not coloured
                                                    (except deletions)
@property {bool}      options.toggleDotify        - Create a check box for toggling dotify
@property {string}    options.toggleDotifyLabel   - Label for dotify checkbox toggle
@property {bool}      options.toggleNocolour      - Create a check box for toggling nocolour
@property {string}    options.toggleNocolourLabel - Label for nocolour checkbox toggle
@property {bool}      options.fasta               - Create a FASTA export button 
@property {string}    options.sortLabel           - Label for sort button
@property {string}    options.exportLabel         - Label for export buttons
@property {bool}      options.consensus           - Display consensus sequence
@property {string}    options.colourScheme        - Default colour scheme - valid options 
                                                    depend on the css, but are currently
                                                    taylor, clustal, zappo, hphob, helix, 
                                                    strand, turn, buried. Note that this must be
                                                    specified in lower case
@property {bool}      options.selectColour        - Display a pull-down to choose the colour 
                                                    scheme.
@property {string[]}  options.colourChoices       - Array of colour scheme names - only used
                                                    if the user has added to the CSS. This
                                                    can be in mixed case.
@property {callback}  options.callback            - Specify the name of a function to be
                                                    called whenever the display is refreshed.
                                                    This is passed the seqId
@property {string}    options.scrollX             - Specify a width for the sequence display
                                                    div and make it scrollable (e.g. "500px")
                                                    Use "100%" to make it the width of the
                                                    screen (or containing div)
@property {string}    options.scrollY             - Specify a height for the sequence display
                                                    div and make it scrollable (e.g. "500px")
@property {string[]}  options.labels              - Array of residue label strings
@property {bool}      options.autolabels          - Automatically generate label strings
                                                    (overrides options.labels)
@property {string}    options.idSubmit            - URL for submitting a single sequence where its
                                                    id/label has been clicked. 
                                                    See also options.idSubmitAttribute and options.idSubmitKey
@property {string}    options.idSubmitAttribute   - Specifies a colon-separated list of attribute values of the 
                                                    sequence object which should be passed to a URL specified 
                                                    with options.idSubmit. Default is 'sequence'.
@property {string}    options.idSubmitKey         - Specifies a colon-separated list of attribute keys which 
                                                    should be passed to the URL specified with options.idSubmit.
@property {string}    options.sortColumn	  - Column to be used for initial sort (optional).
@property {string}    options.sortDirection       - Specifies direction of sort when sortColumn is used.
 
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
- 23.09.15 Added toggleDotifyLabel 
           Added toggleNocolourLabel/toggleNocolorLabel
           Added deleteLabel
           Move FASTA before submit and action buttons
           Added idSubmit and idSubmitClean
           By: ACRM
- 24.09.15 Added scrollX and scrollY
- 22.12.15 Added labels and autolabels
- 11.02.16 Added idSubmitAttribute
- 09.01.17 Several modifications as follows By: JH 
			- added global arrays gDisplayColumn for datatable column display status,
			  gDisplayOrder for reordering sequence and datatable rows based on sort,
			  displayRow (in sequence object) for indicating display status of sequences 
			  and datatable rows
			- datatable functions added, writing to tag divId_Table
			- added mousehandler for handling sort region
			- added call to JSAV_transposeSequencesHTML, based on status of options.transpose,
			  for displaying transposed (vertical) sequence view
			- reorganised button display order
			- added options.iconButtons for option to display buttons as text or icons
			- start and stop sort positions now global
			- now uses Bootstrap tooltips instead of jQuery tooltips
- 05.09.17 Removed scrollX - now 100% by default
- 12.08.19 Added sortColumn and sortDirection for initilial sorting of columns 

*/
function printJSAV(divId, sequences, options)
{
   // Deal with options
   if(options                     == undefined) { options                     = Array();                   }
   if(options.width               == undefined) { options.width               = "400px";                   }
   if(options.height              == undefined) { options.height              = "6pt";                     }
   if((options.submitLabel        == undefined) 
      && (options.iconButtons))                 { options.sumbitILabel 	      = 'fa fa-check'; 		   }
   if((options.actionLabel         == undefined) 
      && (options.iconButtons))                 { options.actionLabel 	      = 'fa fa-cogs';       	   }
   if(options.nocolor)                          { options.nocolour            = true;                      }
   if(options.toggleNocolor)                    { options.toggleNocolour      = true;                      }
   if(options.transpose           == undefined) { options.transpose           = false;                     }
   if((options.exportLabel         == undefined) 
      && (options.iconButtons))                 { options.exportLabel 	      = 'fas fa-share-square';     }
   if((options.sortLabel           == undefined) 
      && (options.iconButtons))                 { options.sortLabel 	      = 'fa fa-sort-down';	   }
   if(options.colorScheme)                      { options.colourScheme        = options.colorScheme;       }
   if(options.colourScheme        == undefined) { options.colourScheme        = "taylor";                  }
   if(options.selectColor)                      { options.selectColour        = true;                      }
   if(options.colorChoices        != undefined) { options.colourChoices       = options.colorChoices;      }
   if(options.deletable)                        { options.selectable          = true;                      }
   if(options.hideable)                         { options.selectable          = true;                      }	
   if(options.exportable)                       { options.selectable          = true;                      }	
   if(options.submit 		  != undefined) { options.selectable          = true;                      }	
   if(options.idSubmitAttribute   == undefined) { options.idSubmitAttribute   = "sequence";                }
   if(options.idSubmitKey         == undefined) { options.idSubmitKey         = "";                        }
   if((options.toggleDotifyLabel   == undefined) 
     && (options.iconButtons))                  { options.toggleDotifyLabel   = 'fa fa-ellipsis-h';        }
   if((options.toggleNocolourLabel == undefined) 
     && (options.iconButtons))                  { options.toggleNocolourLabel = 'fa fa-th'; 		   }
   if((options.hideLabel           == undefined) 
     && (options.iconButtons))                  { options.hideLabel 	      = 'fa fa-eye-slash';	   }
   if((options.showallLabel        == undefined)  && (options.iconButtons)) { options.showallLabel	      = 'fa fa-eye';		   }
   if((options.deleteLabel        == undefined)
     && (options.iconButtons))                  { options.deleteLabel 	      = 'fa fa-window-close';	   }
   if(options.autoLabels)                       { options.labels              = JSAV_autoLabels(sequences);} 
   
   // Initialize globals if not yet done
   JSAV_init();
   document.onmouseup = mouseUpHandler;				
   gOptions[divId]         = options;
   gSequences[divId]       = sequences;
   initDisplayrow(gSequences[divId]);
   gDisplayColumn[options.chainType] = initDisplayColumn(divId, sequences, gDisplayColumn[options.chainType]);
   gDisplayOrder[divId] = initDisplayOrder(sequences);

   // Sequence View
   if (sequences.length > 0) {
      gSequenceLengths[divId] = sequences[0].sequence.length;
      if (gSequenceLengths[divId] > 0) {
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
        div_sortable.css('margin-left', '0.5em');
        div_sortable.css('overflow-x', 'auto');
        div_sortable.css('white-space', 'nowrap');
   
        if(options.scrollY != null)
        {
           div_sortable.css('overflow-y', 'hidden');
           div_sortable.css('white-space', 'nowrap');
        }
   

        if (options.transpose) {
 	   var html = JSAV_transposeSequencesHTML(divId, sequences);
   	} else {
	   var html = JSAV_buildSequencesHTML(divId, sequences);
	}

        div_sortable.append(html);
        $('#' + divId + ' .seqtable').css('width', seqtabWidth);
        $('#' + divId + ' .outerseqtable').css('width', seqtabWidth);
        $('#' + divId + ' .header').css('width', seqtabWidth);
        $('#' + divId + ' .footer').css('width', seqtabWidth);

        var div_controls = $('<div />').appendTo(div);
        div_controls.attr('id', divId + '_controls');
        div_controls.attr('class', 'JSAVControls');
        div_controls.css('margin-left', '0.5em');
 
        if(options.sortable)
        {
           resetSortRegion(divId);
	   JSAV_ControlButton(divId, divId + '_controls', 'Sort the sequences based on the range specified in the Sort Region', 
                             options.sortLabel, '', 'Sort Sequences', 'JSAV_sortAndRefreshSequences("' + divId + '")');
        }
  
        if(options.hideable)
        {
         JSAV_ControlButton(divId, divId + '_controls', 'Hide selected sequences', 
                            options.hideLabel, '', 'Hide Sequences', 'JSAV_hideSelectedSequences("' + divId + '")');	
         JSAV_ControlButton(divId, divId + '_controls', 'Show hidden sequences', 
                            options.showallLabel, '', 'Show Hidden Sequences', 'JSAV_resetDisplayrow("' + divId + '")');	
        }
    
        if(options.deletable)
        {
	  JSAV_ControlButton(divId, divId + '_controls', 'Delete the selected sequences', 
                            options.deleteLabel, '', 'Delete Sequences', 'JSAV_deleteSelectedSequences("' + divId + '")');
	}

        if(options.submit != undefined)
        {
          JSAV_printSubmit(divId, options.submit, options.submitLabel);
        }

        if(options.action != undefined)
        {
	  JSAV_ControlButton(divId, divId + '_controls', 'Process the selected sequences, or all sequences if none selected', 
                            options.actionLabel, '', 'Process Sequences', options.action);
        }

        if(options.selectColour)
        {
          JSAV_printColourSelector(divId, options);
        }
        if(options.toggleDotify)
        {
          JSAV_printToggleDotify(divId, options);
        }
        if(options.toggleNocolour)										
        {
          JSAV_printToggleNocolour(divId, options);
        }

        if(options.toggleTranspose)										
        {
         JSAV_printToggleTranspose(divId, options);
        }

        if(options.fasta)
        {
	  JSAV_ControlButton(divId, divId + '_controls', 'Export the selected sequences, or all sequences if none selected', 
                             options.exportLabel, 'Fasta', 'Export Fasta', 'JSAV_exportFASTA("' + divId + '")');
        }
         
        if (options.exportable)
        {
          JSAV_ControlButton(divId, divId + '_controls', 'Export visible sequences to CSV', 
                             options.exportLabel, 'CSV', 'Export CSV', 'JSON2CSV("'+divId+'")');
          JSAV_ControlButton(divId, divId + '_controls', 'Export visible sequences to XML for Excel - your Excel must support XML import', 
                             options.exportLabel, 'Excel', 'Export Excel', 'JSON2XML("'+divId+'")');
        }

        if(options.border)
        {
         JSAV_modifyCSS(divId);
        }
      }
  
      if (options.displaydatatable != undefined)
      {
 	printDataTable(divId, sequences);
      }
      if (options.sortColumn != undefined)
      {
        DT_sortColumn(divId, options.sortDirection, options.sortColumn);
      }

      // Ensure buttons etc match the data
      window.onload = function(){JSAV_refreshSettings(divId);};

      if(options.callback != undefined)
      {
        window[options.callback](divId);
      }
   $('#' + divId).css('width', '96vw');
   
   }
}

// ---------------------------------------------------------------------  
/**
Initialise the displayrow elements for all sequences

@param {object[]} sequences - the sequence array

@author - 09.01.17 Original	By: JH
*/

function initDisplayrow(sequences)
{
	for (var s=0; s<sequences.length; s++)
		sequences[s].displayrow = true;
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
    $("#"+divId+"_seqids").scrollLeft(0);
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
    var ctype = options.chainType;
    var html = "<select class='tooltip colourselect "+ctype+"button' title='Select colour scheme' id = '" + id + "' onchange='JSAV_setColourScheme(\"" + divId + "\", this)'>";
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

@param {string}  divId    - The ID of the div we are working in
@param {object}  select   - The select pull-down

@author 
- 17.06.14  Original   By: ACRM
- 22.12.15  Added passing of labels
- 09.01.17	Added options.transpose to JSAV+refresh parameter list By: JH
*/
function JSAV_setColourScheme(divId, select)
{
	gOptions[divId].colourScheme = select.value;

    var options = gOptions[divId];
    if(options.sorted)
    {
        JSAV_sortAndRefreshSequences(divId)
    }
    else
    {
        JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
    }
}

// ---------------------------------------------------------------------
/**
Prints a control button with icons, action and tooltip

@param 	{string} divId	- The divId we're dealing with
	{string} tooltip- text for tooltip
	{string} icon	- option item for icon class
	{string} label	- extra text after icon
	{string} textLabel - alternative text label
	{string} action - button onclick action

@author
- 24.09.17 Original	By: JH
*/
function JSAV_ControlButton(divId, localDiv, tooltip, icon, label, textlabel, action)
{
   var parrenttag = '#' + localDiv;
   var options = gOptions[divId];
   var ctype = options.chainType;
   var tooltipText = "title='"+tooltip+"'";
   var html = "<button type='button' class='tooltip "+ctype+"button' "+tooltipText+"  onclick='"+action+"'>";

   if (options.iconButtons) {
      html += "<i class='"+icon+"' "+tooltipText+"></i> "+ label;
   } else {
      html +=  (icon != undefined) ? icon : textlabel;
   }
   html += "</button>";
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
- 23.09.15 Dotify label now comes from options  By: ACRM
- 09.01.17 Now includes dotifybutton class, checked changed to active, label now taken from options.toggleDotifyLabel  By: JH
*/
function JSAV_printToggleDotify(divId, options)
{
    var active = "";
    var ctype = options.chainType;
    if(options.dotify) { active = " active"; };
    var id = divId + "_toggleDotify";
	var label = options.toggleDotifyLabel;
    var idText = " id='" + id + "'";
    var onclick = " onclick='JSAV_toggleOption(\"" + divId + "\", \"" + id + "\", \"dotify\")'";
    var title = "title='Replace repeated residues with dots'";
    var html = "<button type='button' class='tooltip "+ctype+"button" + active + "' " + idText + " " +title+ " "  + onclick + ">";
    if (gOptions[divId].iconButtons) {
       html += "<i class='"+label+"'  "+title+"></i></button>";
    } else {
       html += "Dotify</button>";
    }
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
- 23.09.15 Obtains label from options.toggleNocolourLabel  By: ACRM
- 09.01.17 Now includes nocolourbutton class, checked changed to active, label now taken from options.toggleNocolourlabel  By: JH
*/
function JSAV_printToggleNocolour(divId, options) 
{
    var active = "";
    var ctype = options.chainType;
    if(options.nocolour) { active = " active"; };
    var id = divId + "_toggleNocolour";
    var idText = " id='" + id + "'";
    var label = options.toggleNocolourLabel;
    var onclick = " onclick='JSAV_toggleOption(\"" + divId + "\", \"" + id + "\", \"nocolour\")'";
    var title = "title='Do not colour repeated residues'";
    var html = "<button type='button' class='tooltip "+ctype+"button" + active + "' " + idText + " "+title+ " " + onclick + ">"
    if (gOptions[divId].iconButtons) {
       html += "<i class='"+label+"' "+title+"></i></button>";
    } else {
       html += "No Repeat Colour</button>";
    }
    var parrenttag = '#' + divId + '_controls';
    $(parrenttag).append(html);
}

// ---------------------------------------------------------------------
/** 
Print a checkbox for toggling transposed sequence view

@param {string}  divId    The div that we are working in
@param {object}  options  The options

@author 
- 03.01.17 Original   By: JH

*/
function JSAV_printToggleTranspose(divId, options) 
{
    var options = gOptions[divId];
    var ctype = options.chainType;
    var html = "";
    var activeText = "fas fa-reply";
    var inactiveText = "fas fa-share";
    var active = "";
    if(options.transpose) 
      { 
        active = activeText; 
      } 
    else 
      { 
        active = inactiveText; 
      } ;
    var id = divId + "_toggleTranspose";
    var idText = " id='" + id + "'";
    var onclick = " onclick='JSAV_toggleTranspose(\"" + divId + "\", \"" + id + "\", \"transpose\", \"" +activeText+"\",  \"" +inactiveText+"\")'";
    var tooltip = "Transpose sequence view";
    if (options.iconButtons) {
       html += "<button type='button' class='tooltip "+ctype+"button' title='"+tooltip+ "' "  + onclick + "><i " + idText + " class='"+active+"'></i></button>";
    } else {
       html += "<button type='button' class='tooltip "+ctype+"button' " + idText + " title='"+tooltip+ "' "  + onclick + ">Transpose Sequences</button>";
    }
    var parrenttag = '#' + divId + '_controls';
    $(parrenttag).append(html);
}

function JSAV_toggleTranspose(divId, theButton, theOption, activeText, inactiveText) {

    var div_sortable = $('#' + divId + '_sortable');
    var options = gOptions[divId];
    if(options[theOption]) 
      { 
        div_sortable.css('max-height', '');
        $('#' + divId).css('width', '96vw');
       } 
    else //transposed
      {
        div_sortable.css('max-height', '1000px');
      } ;

JSAV_toggleOptionIcon(divId, theButton, theOption, activeText, inactiveText);
}

// ---------------------------------------------------------------------
/**
Read a button and toggle the button class between the two options activeText 
and inactiveText, refreshing the display


@param {string}  divId     		The div that we are working in
@param {string}  theButton 		The ID of the checkbox we are looking at
@param {string}  theOption 		The name of the option we are toggling
@param {string}  activeText		Class for active button
@param {string}  inactiveText	Class for inactive button

@author 
- 11.01.17 Original	By: JH 
*/

function JSAV_toggleOptionIcon(divId, theButton, theOption, activeText, inactiveText)
{
    var tag     = "#" + theButton;
    var options = gOptions[divId];
    options[theOption] = !options[theOption];
	if (options[theOption]) {
		$(tag).removeClass(inactiveText);
		$(tag).addClass(activeText);
	} else {
		$(tag).removeClass(activeText);
		$(tag).addClass(inactiveText);
	}

    if(options.sorted)
    {

        JSAV_sortAndRefreshSequences(divId)
    }
    else
    { 
        JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
    }
}

// ---------------------------------------------------------------------
/** 
Read a button and toggle the associated option, refreshing the display

@param {string}  divId     The div that we are working in
@param {string}  theButton The ID of the checkbox we are looking at
@param {string}  theOption The name of the option we are toggling

@author 
- 16.06.14 Original   By: ACRM
- 17.06.14 Added consensus
- 22.12.15 Added labels
- 09.01.17 Toggles options[theOption] and now uses class instead of checked
           options.transpose added to JSAV_refresh parameter list By: JH
*/
function JSAV_toggleOption(divId, theButton, theOption)
{
    var tag     = "#" + theButton;
    var options = gOptions[divId];
    options[theOption] = !options[theOption];
	if (options[theOption])
		$(tag).addClass("active");
	else
		$(tag).removeClass("active");
    if(options.sorted)
    {
        JSAV_sortAndRefreshSequences(divId)
    }
    else
    {
        JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
    }
}

// ---------------------------------------------------------------------
/**
Builds HTML for table rows that highlight a region in the alignment as
being important (e.g. CDRs of antibodies). Note that ranges for highlighting
count from zero.

@param   {string}  divId      - The div we are working in
@param   {int}     seqLen     - The length of the alignment
@param   {bool}    selectable - Are there sequences selection boxes
@param   {int[]}   highlight  - Array of residue ranges to highlight
@returns {string}             - HTML

@author 
- 13.06.14   Original   By: ACRM
- 09.01.17	 Now calls calculate
printHighlightCell to display each cell based on highlight  By: JH
*/
function JSAV_buildHighlightHTML(divId, seqLen, selectable, highlight, cc)
{
    var html = "";
    var pref;

//    html += "<tr class='highlightrow'></td>";

    for(var i=0; i<seqLen; i++)
    {
         pref = '';
         if (i == cc) { pref = 'br_highlightrow'; }
	 html += printHighlightCell(highlight, i, pref);
    }
    html += "<td class='rhcol'></td>\n";
    return(html);
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
   var ctype = gOptions[divId].chainType;
   var title = "title='Submit the selected sequences, or all sequences if none selected'";
   var html = "<button type='button' class='tooltip "+ctype+"button' "+title+" onclick='JSAV_submitSequences(\"" + divId + "\")'>";
   if (gOptions[divId].iconButtons) {
      html += "<i class='"+label+"' "+title+"></i>";
   } else {
      html += "Submit Selected Sequences";
   }
   html += "</button>";

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
Wrap the action function. When the action button is clicked, this function
is called to extract the relevant sequence data and call the user specified
function, passing the divId and an array of sequence objects

@param {string}  divId   - The ID of the div to work in
@param {string}  action  - The name of the user function

@author 
- 13.06.14  Original   By: ACRM
- 11.02.16  Modified the push so that it pushes the whole object rather than
            just the selected fields. This allows additional information fields
            to be passed around associated with a sequence but not displayed
- 09.01.17  Removed 'input' frm tag as this is not required By : JH
*/
function JSAV_wrapAction(divId, action)
{
   var selectedSequences = Array();

   // See if any checkboxes are set
   var count = 0;
   var toSubmit = Array();
   // Find the selected sequences
   var tag = "#" + divId + " .selectBox";
   $(tag).each(function(index) {
       if($(this).prop('checked'))
       {
           var id = $(this).attr('name').substr(7);
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
         selectedSequences.push(sequences[i]);
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

@param   {string} divId   - The ID of the div we are printing in
@returns {string}         - FASTA sequence

@author 
- 17.06.14 Split out from JSAV_submitSequences()  By: ACRM
- 09.01.17 Removed 'input' from tag as this is not required By: JH
*/
function JSAV_buildFASTA(divId)
{
   // See if any checkboxes are set
   var count = 0;
   var toFASTA = Array();
   var dispOrder = gDisplayOrder[divId];
   // Find the selected sequences
   var tag = "#" + divId + " .selectBox";
   $(tag).each(function(index) {
       if($(this).prop('checked'))
       {
	   var id = $(this).attr('name').substr(7);
           toFASTA[id] = 1;
           count++;
       }
   });

   var sequenceText = "";
   var sequences = gSequences[divId];
   for(var i=0; i<sequences.length; i++)
   {
     if (sequences[dispOrder[i]].displayrow)
     {
       if((count == 0) || (count == sequences.length) || (toFASTA[sequences[i].id] == 1))
       {
           sequenceText += ">" + sequences[i].id + "\n";
           sequenceText += sequences[i].sequence + "\n";
       }
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
- 22.12.15 Added passing of labels
- 09.01.17 Removed 'input' from tag as this is not required By: JH
*/
function JSAV_deleteSelectedSequences(divId)
{
    var count = 0;
    var toDelete = Array();
    // Find the selected sequences
    var tag = "#" + divId + " .selectBox";
    $(tag).each(function(index) {
        if($(this).prop('checked'))
        {
	    var id = $(this).attr('name').substr(7);
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
                JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
                options.sorted = false;
            }
        });
    }
}

// ---------------------------------------------------------------------
/**
Hides a set of sequences that have been clicked

@param {string}  divId   - The ID of the div to work in

@author 
- 04.11.16 Original based on JSAV_deleteSelectedSequences By: JH
*/
function JSAV_hideSelectedSequences(divId)
{
    var count = 0;
    var toHide = Array();
    // Find the selected sequences
    var tag = "#" + divId + " .selectBox";
    $(tag).each(function(index) {
        if($(this).prop('checked'))
        {
	    var id = $(this).attr('name').substr(7);
	    toHide.push(id);
            count++;
        }
    });

    if(count == 0)
    {
        ACRM_alert("Error!","You must select some sequences!");
    }
    else
    {
		// Run through the global sequence array undisplaying the selected objects
        for(var i=0; i<toHide.length; i++)
           {
           JSAV_unsetDisplayrow('id', toHide[i], gSequences[divId]);
           }
        var options = gOptions[divId];

        // Update the consensus
        if(options.consensus)
            {
            gConsensus[divId] = JSAV_buildConsensus(gSequences[divId]);
            }

        // Refresh the display
        JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
        options.sorted = false;
    }
}

// ---------------------------------------------------------------------
/**
Sets displayrow to false for each sequence row

@param {string}   key   - The key (item in an object or hash key) 
                          to check
@param {string}   value - The value to check
@param {object[]} array - The array of objects to manipulate

@author
- 09.01.17 Original -  - based on ACRM_deleteItemByLabel
*/

function JSAV_unsetDisplayrow(key, value, array)

{
    for(var i=0; i<array.length; i++)
    {
       if(array[i][key] == value)
       {
           array[i].displayrow = false;
	   }
    }
}

// ---------------------------------------------------------------------
/**
Reinitialises displayrow for all sequences  to true. Recalculates consensus sequences and refreshes

@param {string} divId	- the divId we're dealing with

@author
- 09.01.17 Original By: JH
*/

function JSAV_resetDisplayrow(divId)
{
	initDisplayrow(gSequences[divId]);
    // Update the consensus
    var options = gOptions[divId];

    if(options.consensus)
        {
        gConsensus[divId] = JSAV_buildConsensus(gSequences[divId]);
        }

    // Refresh the display
    JSAV_refresh(divId, gSequences[divId], gStartPos[divId]-1, gStopPos[divId]-1);
    options.sorted = false;
}

// ---------------------------------------------------------------------
/**
Toggle selection of all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
*/
function JSAV_selectAllOrNone(divId, status)
{
   var tag = "." + divId + "_AllNone";

   if (status)
   {
       JSAV_selectAll(divId);
       $(tag).prop('checked', true);
   }
   else
   {
       JSAV_unselectAll(divId);
       $(tag).prop('checked', false);   
   }
}

//----------------------------------------------------------------------
/**
*/
function JSAV_resetAllNone(divId, cboxname, cboxstatus)
{
   var tag = "." + divId + "_AllNone";
   $(tag).prop('checked', false);
   tag = "." + cboxname;
   if (cboxstatus) {
     $(tag).prop('checked', true);
   } else {
     $(tag).prop('checked', false);
   }
}

// ---------------------------------------------------------------------
/**
Select all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
- 09.01.17 Removed 'input' from tag as this is not required By: JH
*/
function JSAV_selectAll(divId)
{
   var tag = "#" + divId + " .selectBox";
   $(tag).prop('checked', true);
   tag = "#" + divId + "_Table .selectBox";
   $(tag).prop('checked', true);
}

// ---------------------------------------------------------------------
/**
Unselect all sequence selection buttons

@param {string}  divId   - The ID of the div to work in

@author 
- 09.06.14 Original   By: ACRM
- 09.01.17 Removed 'input' from tag as this is not required By: JH
*/
function JSAV_unselectAll(divId)
{
   var tag = "#" + divId + " .selectBox";
   $(tag).prop('checked', false);
   tag = "#" + divId + "_Table .selectBox";
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

// ----------------------------------------------------------------
/**
Prints a single resudue cell based on previous cell, colourscheme, consensuscell, etc.

@param {string} divId			- the divId we're dealing with
@param {string} aa				- the residue code to print
@param {string} prevAa			- the previous residue code
param {string} consensusClass	- consensus class
@param {bool} isConsensus		- status of global isConsensus property
@returns {string} html			- HTML

@author
- 09.01.17 Original taken from JSAV_buildASequenceHTML By: JH
*/

function printResidueCell(aa, prevAa, consensusClass, isConsensus, nocolour, dotify, colourScheme, pref) {

var colourClass = colourScheme + aa.toUpperCase();

if((dotify || nocolour) && !isConsensus)
	{
	if(nocolour)
		{
		if(aa == "-") 
			{ 
			colourClass = "aaDel"; 
			}
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
		if(dotify)
			if(aa != '-') {aa = '.';}
		}
	var html = "<td class='"+pref+"seqCell " + colourClass + "'>" + aa + "</td>";
	}
else 
	{
	var html = "<td class='"+pref+"seqCell " + colourClass + consensusClass + "'>" + aa + "</td>";
	}
return(html);
}
 
// ---------------------------------------------------------------------
/**
Builds the HTML for printing a sequence as a table row. The row 
starts with the identifier and is followed by each amino acid in a 
separate <td> tag with a class to indicate the amino acid type 
(e.g. taylorW for a tryptophan in Willie Taylor scheme). 

@param {string}   divId         The divId we're dealing with
@param {string}   id            The identifier
@param {string}   sequence      A string containing the sequence
@param {string}   prevSequence  A string containing the previous sequence
@param {bool}     isConsensus   This is the consensus sequence
@param {string}   idSubmit      URL to visit when sequence label clicked
@returns {string} tableline     HTML snippet

@author 
- 30.05.14 Original  By: ACRM
- 16.06.14 Added dotify and nocolour - now takes prevSequence parameter
- 17.06.14 Added isConsensus and colourScheme
- 18.06.14 Added tooltip
- 23.09.15 Added idSubmit/idSubmitClean
- 11.02.16 Added idSubmitAttribute, now takes a sequence object rather than
           the sequence and the id
- 09.01.17 Changed first if statement to allow independent dotify or nocolour display
		   Individual cell display now carried out by printResidueCell By: JH
*/
function JSAV_buildASequenceHTML(divId, sequenceObject, id, sequence, prevSequence, isConsensus, idSubmit, cc)
{
    var options = gOptions[divId];
    var seqArray     = sequence.split("");
    var prevSeqArray = undefined;

    if((options.dotify || options.nocolour) && (prevSequence != undefined))
    {
        prevSeqArray = prevSequence.split("");
    }

    var tableLine = "";

    var consensusClass = "";
    if(isConsensus)
    {
        if (id == 'Consensus') {
           consensusClass = " consensusCell";
        } else {
           consensusClass = " blastqueryCell";
        }
    }

    var pref;
    var nResidues = seqArray.length;
    for(var i=0; i<nResidues; i++) {
        pref = '';
        if (i == cc) { pref = 'br_'; }
	var prevAa = (prevSeqArray != undefined) ? prevSeqArray[i] : '#';   
        tableLine += printResidueCell(seqArray[i], prevAa, consensusClass, isConsensus, options.nocolour, options.dotify, options.colourScheme, pref);
	}
  
    tableLine += "</td><td class='rhcol'></td></tr>";
    return(tableLine);
}

// --------------------------------------------------------------------
/**
Displays thin row coloured by the label type (heavy or light)

@param {array}		labels		The label array
@retuen {text}		tableLine	HTML

@author
- 21.03.17  Original	By: JH
*/

function JSAV_buildTypeLabel(labels) {

var tableLine = "";
tableLine += "<tr class='typeLabelRow'></td>";
for (var l=0; l<labels.length; l++) {
    var cellCol = (labels[l].substring(0,1) == 'L') ? "light-col" : "heavy-col";
    tableLine += "<td class='" + cellCol + "'></td>";
}
tableLine += "<td class='rhcol'></td></tr>";
return(tableLine);
}

// ---------------------------------------------------------------------
/**
Displays the currently selected range as text and calls the routine		
to higlight that range in the alignment view.

Called as JSAV_showRange(divID)

@param {text}      divId    Identifier of the display div

@author 
- 06.06.14  Original   By: ACRM
- 10.06.14  Removed redundant .closest() from finding parent
- 23.09.15  Changed "Sort from: xx to: xx" to "Region: positions xx to yy"
- 24.09.15  Changed to using .html() instead of .text()
- 09.01.17	Now uses global start and stop instead of slider positions By: JH
*/
function JSAV_showRange(divId)
{
    
    // Display the range currently selected
   var parenttag = '#' + divId + '_controls';
   var span_showrange = $("<span id='" + divId + "_showrange'></span>").appendTo(parenttag);
   var tag = "#" + divId + "_showrange";
   if (gOptions[divId].transpose) {
      $(tag).html('');
   } else {
      var html = "<p>Region: positions " + gStartPos[divId] + " to " + gStopPos[divId] + "</p>";
      $(tag).html(html);
      JSAV_markRange(divId, gSequenceLengths[divId], gStartPos[divId]-1, gStopPos[divId]-1);
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

// -------------------------------------------------------------------------
/**
Prints a single highlight cell base on the highlight array

@param {int[]} highlight	- the highlight array
@param {int} i				- the element id of the cell
@param {string} pref		- class for display (different for transposed view)
@returns {string}			- text for td tag and class

@author
- 09.01.17 Original By: JH (based on original section of JSAV_buildHighlightHTML)
*/

function printHighlightCell(highlight, i, pref) {

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
	return("<td class='"+displayClass+" "+pref+"' /></td>");
}

// ---------------------------------------------------------------------
/**
Takes an array of sequence objects and builds the HTML to display
them as a coloured table in transposed (vertical) orientation

@param   {string}     divId       ID of div in which to print
@param   {object[]}   sequences   Array of sequence objects
@returns {string}    		      HTML

@author 
- 02.12.16 Original  By: JH (based on original JSAV_buildSequencesHTML)
*/

function JSAV_transposeSequencesHTML(divId, sequences)

{
	var dispOrder = gDisplayOrder[divId];
	var options = gOptions[divId]
	var html = "";
	html += "<div class='JSAV'>\n";
        // Create id line

   var calcwidth = (sequences.length * 20) + 250;
   var tabwidth = calcwidth + 'px';
   $('#' + divId).css('width', tabwidth);

	html += "<div id='"+divId+"tr_outerseqtable' class='tr_outerseqtable'>";
	html += "<div class='tr_seqtable'>";
        html += "<table border='0'>\n";

	html += "<tr><th class='tr_labels tr_idCell rotate'><div>All/None</div></th>";
	if (options.selectable) html += "<td class='tr_highlightrow'></td>";
	for (var i=0;i<sequences.length;i++) 
		if ((sequences[dispOrder[i]].displayrow) && numberedSequence(options.chainType, sequences[dispOrder[i]]))
			{
			var id = sequences[dispOrder[i]].id;
			if(options.idSubmit == null)
				{
				html += "<th class='tr_seqCell tr_idCell rotate'><div>" + id + "</div></th>";
				}
			else
				{
             			var idSubmitAttribute = options.idSubmitAttribute;
				var url         = options.idSubmit;
				var submitParam = sequences[dispOrder[i]][idSubmitAttribute];
				if(options.idSubmitClean)
					{
					submitParam = submitParam.replace(/[^A-Za-z0-9]/g, '');
					}
       			        url += submitParam;
				html += "<th class='tr_seqCell tr_idCell rotate'><div><a href='" + url + "'>" + id + "</a></div></th>";
				}
			}
	if(options.consensus != undefined)
		html += "<th class='tr_idCell rotate tr_consensusCell'><div>Consensus</div></th>";
	if (options.selectable) html += "<td class='tr_highlightrow'></td>";
	html += '</tr>';

	// Create the selection button line
	if (options.selectable) {
		html += JSAV_buildSelectAllHTML(divId, options.selectable, true, 'tr_labels');
		if (options.selectable) html += "<td class='tr_highlightrow'></td>";
		for (var i=0;i<sequences.length;i++) 
		    if ((sequences[dispOrder[i]].displayrow) && numberedSequence(options.chainType, sequences[dispOrder[i]]))
			{
			var name = "select_" + sequences[dispOrder[i]].id;
			var cname = name.replace(/\./g, "_").replace(/\//g, "_");
			html += "<td class='tr_seqCell tr_selectCell'><input class='selectBox "+cname+" tr_checkbox' type='checkbox' name='" + name + "' onclick='JSAV_resetAllNone(\""+divId+"\", \""+cname+"\",this.checked);'/></td>";
			}
		if(options.consensus != undefined)
		    html += "<td class='tr_seqCell tr_consensusCell'></td>";
		if (options.selectable) html += "<td class='tr_highlightrow'></td>";
		html += '</tr>';
	}
	
	// Create transposed sequences
        html += "<tr class='topline'><td></td></tr>";

        for (var i=0;i<gSequenceLengths[divId];i++)
		{
                var toplineStr = (i==0) ? "topborder" : "";
		html += "<tr><th class='tr_labels idCell "+toplineStr+"'>"+options.labels[i]+"</th>";
		if (options.selectable) {
			html += printHighlightCell(options.highlight, i, 'tr_highlightrow');
			}
                var prevAa = '#';
		for (var s=0; s<sequences.length; s++) 
			if ((sequences[dispOrder[s]].displayrow) && numberedSequence(options.chainType, sequences[dispOrder[s]]))
			{
			var aa = sequences[dispOrder[s]].sequence[i];
			html += printResidueCell(aa, prevAa, "", false, options.nocolour, options.dotify, options.colourScheme, 'tr_');
                        prevAa = sequences[dispOrder[s]].sequence[i];
			}
		if(options.consensus != undefined) {
			var aa = gConsensus[divId][i];
			var prevAa = '#';
			html += printResidueCell(aa, prevAa, " tr_consensusCell", true, options.nocolour, options.dotify, options.colourScheme, 'tr_');
			}
		if (options.selectable) {
			html += printHighlightCell(options.highlight, i, 'tr_highlightrow');
			}
		
		html += "</tr>";
		}
	html += "</table>\n";
        html += "</div>\n";
        html += "</div>\n";
	html += "</div>\n";
        $('#'+divId+'tr_outerseqtable').css('direction','rtl');
	return(html);
}
// ----------------------------------------------------------------
/**
Builds the label for the sequence row

@param 		{string}	divId		ID of the div we're dealing with
@param 		{string}	attributeValue 	value of idSubmitAttribute for the id
@param 		{string}	id		sequence's id
@param 		{string}	idSubmit	text for label link
@param		{number}	colspan		number of table columns to span	
@returns	{string}	html		HTML for the label

@author
- 23.03.17 Original By: JH
*/

function JSAV_buildId(divId, attributeValue, id, idSubmit, idSubmitKey, colspan, bgcol, humanOrg) {

    var options = gOptions[divId];
    var html = "";

    if ((idSubmit == null) || (attributeValue == undefined))
    {
       html += "<td colspan='" + colspan + "' class='" + bgcol + "'><div class='feint tooltip' title='" + id + "'>" + id + "</div></td>";
    }
    else
    {
       var url         = idSubmit;
       var seperator = '?';
       var attrArray = attributeValue.split(':');
       var keyArray = idSubmitKey.split(':');
       for (var a=0; a<attrArray.length; a++) 
          {
          var submitParam = attrArray[a];
          var submitKey = keyArray[a];
 
          if(options.idSubmitClean)
             {
             // This would only normally be done in the default case where idSubmitAttribute is 'sequence'
             // It probably wouldn't make sense for IDs etc
             submitParam = submitParam.replace(/[^A-Za-z0-9]/g, '');
             }
          url += seperator + submitKey + '=' + submitParam;
          seperator = '&';
          }
       if (humanOrg) 
          {
          url += '&humanorganism='+humanOrg;
          }
       html += "<td colspan='" + colspan + "' class='" + bgcol + "'><a href='" + url + "'>" + id + "</a></td>";
    }

return(html);
}

// ---------------------------------------------------------------------
/**
Returns true if the sequence is numbered

@param   {string}     chainType	  type of chain
@param   {object[]}   sequence    sequence object
@returns {boolean}                true if chain or either of the combined chains is numbered, otherwise returns false

@author 
- 15.10.17 Original  By: JH
*/

function numberedSequence(chainType, sequence)
{
   if (chainType == 'heavy') {
     return (sequence.heavy_Numbered != 'N');
   } else if (chainType == 'light') {
     return (sequence.light_Numbered != 'N');
   } else {
     return ((sequence.light_Numbered != 'N') || (sequence.heavy_Numbered != 'N'));
   }
}

// ---------------------------------------------------------------------
/**
Takes an array of sequence objects and builds the HTML to display
them as a coloured table

@param   {string}     divId       ID of div in which to print
@param   {object[]}   sequences   Array of sequence objects
@returns {string}                 HTML

@author 
- 30.05.14 Original  By: ACRM
- 06.06.14 Added call to build the marker row of selected residues
- 10.06.14 Added sortable and selectable parameters
- 13.06.14 Added highlight
- 16.06.14 Added dotify
- 17.06.14 Added consensus
- 22.12.15 Added labels
- 09.01.17 Added empty string format parameter to JSAV_buildSelectAllHTML 
		   Uses displayOrder to display sequences in sorted order	By: JH
*/

function JSAV_buildSequencesHTML(divId, sequences)
{
   var options = gOptions[divId];
   var dispOrder = gDisplayOrder[divId];

   var html = "";
   html += "<div class='JSAV'>\n";

//------------------ Header Columns --------------------------
   
   html += "<div class='header'><table border='0'>";
   html += "<tr><td class='idCell' colspan='10'>Kabat numbering and CDRs</td></tr><tr class='labelrow'>";
   var cc = chainChange(options.labels, divId);
   if (options.selectable)
	{ 
        html += "<td class='idCell'>All/None</td>";
        html += JSAV_buildSelectAllHTML(divId, options.selectable, true, '');
        }
   else
        { html += "<td>&nbsp;</td><td class='selectCell'>&nbsp;</td>"; }


   if(options.labels != undefined)
       {
       html += JSAV_buildLabelsHTML(divId,  gSequenceLengths[divId], options.labels, cc);
       html += "<td class='rhcol'></td>";
       }		
    html += "</tr>";

   if(options.labeltypecol != undefined)
      {
      html += "<tr class='typeLabelRow'>";
      html += "<td></td><td></td>";
      html += JSAV_buildTypeLabel(options.labels);
      html += "</tr>";
      }

  if(options.highlight != undefined)
       {
       html += "<tr class='highlightrow'>";
       html += "<th class='idCell'>CDRs</th><td>&nbsp;</td>";
       html += JSAV_buildHighlightHTML(divId, gSequenceLengths[divId], options.selectable, options.highlight, cc);
       html += "</tr>";
       }

   if((options.blastaaquery != undefined) && (options.blastaaquery != ''))
       {
       html += "<tr class='tooltip blastqueryCell seqrow' title='This row shows the blast query sequence.'>";
       html += "<th class='idCell'>Query</th><th class='selectCell'>&nbsp;</th>";
       html += JSAV_buildASequenceHTML(divId, null, 'BlastQuery', options.blastaaquery, undefined, true, null, cc) + "\n";
       html += "</tr>";
       }

html += "</table></div>";
//---------------- Central Section ------------------------

   html += "<div class='outerseqtable'>";
   html += "<div class='seqtable'>";
   html += "<table border='0'>\n";

   var prevSequence = undefined;
   for(var i=0; i<sequences.length; i++) 
	if ((sequences[dispOrder[i]].displayrow) && numberedSequence(options.chainType, sequences[dispOrder[i]]))
  	 {
	 html += "<tr class='seqrow' id='" + sequences[dispOrder[i]].id + "'>";

         var attrArray = options.idSubmitAttribute.split(':');
         var idSubmitAttr = '';
         for (var a=0; a<attrArray.length; a++)
             idSubmitAttr += sequences[dispOrder[i]][attrArray[a]] + ':';
         idSubmitAttr = idSubmitAttr.replace(/:$/,'');
     	 html += JSAV_buildId(divId, idSubmitAttr, sequences[dispOrder[i]].id, options.idSubmit, options.idSubmitKey, 1, 'idCell', options.humanOrganism) + "\n";
  	 var name = "select_" + sequences[dispOrder[i]].id;
	 var cname = name.replace(/\./g, "_").replace(/\//g, "_");
         html += "<th class='selectCell'>";
         html += (options.selectable) ? "<input class='"+cname+" selectBox' type='checkbox' name='" + name + "' onclick='JSAV_resetAllNone(\""+divId+"\",\""+cname+"\",this.checked);'/>" : "";
         html +="</th>";
         html += JSAV_buildASequenceHTML(divId, sequences[dispOrder[i]], sequences[dispOrder[i]].id, sequences[dispOrder[i]].sequence, prevSequence, false, options.idSubmit, cc) + "\n";
         prevSequence = sequences[dispOrder[i]].sequence;
         html += "</tr>";
  	 }
 
    html += "</table>";
    html += "</div>";
    html += "</div>";

//------------ Footer section -----------------
   html += "<div class='footer'>";
   html += "<table border='0'>";
   if(options.consensus)
       {
       html += "<tr class='tooltip consensusCell seqrow' title='The consensus shows the most frequent amino acid. This is lower case if &le;50% of the  sequences have that residue.'>";
       html += "<th class='idCell'>Consensus</th><th class='selectCell'>&nbsp;</th>";
       html += JSAV_buildASequenceHTML(divId, null, 'Consensus', gConsensus[divId], undefined, true, null, cc) + "\n";
       html += "</tr>";
       }
  if(options.highlight != undefined)
       {
       html += "<tr class='highlightrow'>";
       html += "<th class='idCell'>CDRs</th><th class='selectCell'>&nbsp;</th>";
       html += JSAV_buildHighlightHTML(divId, gSequenceLengths[divId], options.selectable, options.highlight, cc);
       html += "</tr>";
       }
   if(options.labeltypecol != undefined)
      {
      html += "<tr class='typeLabelRow'>";
      html += "<td></td><td></td>";
      html += JSAV_buildTypeLabel(options.labels);
      html += "</tr>";
      }

   if(options.sortable) {
       html += "<tr class='tooltip markerrow' title='Select region for sorting - click here to reset sort region'>";
      html += "<th class='idCell' onclick='resetSortRegion(\""+divId+"\")';>Sort Region</th><th class='selectCell'>&nbsp;</th>";
       html += JSAV_buildMarkerHTML(divId, gSequenceLengths[divId], options.selectable);
       html += "</tr>";
      }

   html += "</table></div>";
   html += "</div>\n";
   seqtabWidth = ((gSequenceLengths[divId] * 9) + 165) + 'px';
   return(html);
}

// ---------------------------------------------------------------------
/**
Build the HTML for creating a row in the table that contains a checkbox
for selecting/deselecting all sequences

@param   {string}  divId  - ID of the div we are working in
@param   {int}     seqLen - sequence length
@param	 {string}  pref   - prefix for display class - uses 'tr_' for transposed cells
@returns {string}         - HTML

@author 
- 09.06.14 Original   By: ACRM
- 18.06.14 Added tooltip
- 09.01.17 Changes made to allow for reformatting of labels By: JH
*/
function JSAV_buildSelectAllHTML(divId, selectable, displayContent, extraClass)
{

   var html;
   var id = divId + "_AllNone";
   var checked = ($('.' + id).prop('checked')) ? 'checked' : '';
   var content = (displayContent) ? "<input class='tooltop " + id + "' title='Select or deselect all sequences' type='checkbox' " + checked + " onclick='JSAV_selectAllOrNone(\"" + divId + "\",this.checked);' />" : '';

   if (selectable) {
	   html = "<td class='selectCell" + extraClass + "'>"+content+"</td>";
    }   
   return(html);
}

// ---------------------------------------------------------------------
/**
Creates the HTML to display the marker row that indicates the selected
residues to be used for sorting

@param   {string}   divId      - Identifier of display div
@param   {int}      seqLen     - Length of sequences alignement
@param   {int}      selectable - Do we have select boxes?
@returns {string}              - HTML

@author 
- 06.06.14  Original   By: ACRM
- 10.06.14  Added 'selectable'
- 23.09.15  Added &nbsp; into 'Sort Region' to stop it breaking the line
- 09.01.17  Markers are now used for selecting start and stop for sort By: JH
*/
function JSAV_buildMarkerHTML(divId, seqLen, selectable)
{
    var html = "";

//    html += "<tr class='tooltip markerrow' title='Select region for sorting'>";

    for(var i=0; i<seqLen; i++)
    {
        var id = divId + "_JSAVMarker" + i;
		var onmousedown = "setSortStart(\""+divId+"\", "+(i)+");";
		var onmouseover = "setSortRange(\""+divId+"\", "+i+");";
        html += "<td id='" + id + "' onmousedown='"+onmousedown+"' onmouseover='"+onmouseover+"'>&nbsp;</td>";
    }
    html += "<td class='rhcol'></td>\n";
    return(html);
}

// ---------------------------------------------------------------------	
/**
Sets the start (and stop) position when mouse is depressed

@param {string} divId 	- the divId we're dealing with
@param {int} i 			- the sort region position

@author
- 09.01.17 Original By: JH
*/

function setSortStart(divId, i) {
	
gStartPos[divId] = i+1;
gStopPos[divId] = i+1;
mouseState = "down";
JSAV_showRange(divId);
}

// -----------------------------------------------------------------------
/**
Adjusts the stop position to current cell if mouse is depressed

@param {string} divId 	- the divId we're dealing with
@param {int} i 			- the sort region position

@author
- 09.01.17 Original By: JH
*/

function setSortRange(divId, i) {
if (mouseState=="down") {
	gStopPos[divId] = i+1;
	JSAV_showRange(divId);
	}
}

// ---------------------------------------------------------------------
/**
Resets sort region to full width

@author
- 15.09.17 Original By: JH
*/
function resetSortRegion(divId) {

gStartPos[divId] = 1;
gStopPos[divId] = gSequenceLengths[divId];
JSAV_showRange(divId);
}

// ---------------------------------------------------------------------
/**
Initialises the global mouseState

@author
- 09.01.17 Original By: JH
*/

function mouseUpHandler() {
mouseState = "up";
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

@param   {int-2DArray}  differenceMatrix  - Differences between each pair
                                            of sequences
@returns {int}                            - Index of the representative
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
@returns {int[]}                        Indexes of the sequences closest to
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
@param   {string}     divId       the divId we're dealing with

@author 
- 29.05.14 Original   By: ACRM
- 04.06.14 Added ignoreEnds (true) to JSAV_calcDifferenceMatrix() call
         Range version
- 04.09.17 Now writes new sort order to gDisplayOrder[divId]  By: JH
*/
function JSAV_sortSequences(sequences, start, stop, divId)
{
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
      gDisplayOrder[divId][i] = sortedIndexes[i];
   }
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
@returns {int-2DArray}           Differences between each pair
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
   var seqArray1   = [];
   var seqArray2   = [];
// seq1.substring(regionStart, regionStop+1).split("");

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
@returns {bool}             FALSE - (not sure why!)

@author 
- 29.05.14 Original   By: ACRM
- 11.06.14 sequences is now global
- 12.06.14 split out the JSAV_refresh() part
- 16.06.14 Added dotify and nocolour options to refresh call
- 17.06.14 Added consensus
- 22.12.15 Added passing of labels
- 09.01.17 Calls resetDisplayColumn to reset display status of datatabe columns after sequence sort By: JH
*/
function JSAV_sortAndRefreshSequences(divId)
{
   var id = divId + "_JSAVStart";

   var range=JSAV_getRange(divId);
   JSAV_sortSequences(gSequences[divId], range[0], range[1], divId);
   resetDisplayColumn(gDisplayColumn[gOptions[divId].chaintype], gSequences[divId]);
   
   JSAV_refresh(divId, gSequences[divId], range[0], range[1]);

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
@param {int}      start        start of selected region
@param {int}      stop         end of selected region

@author 
- 12.06.14  Original split out from JSAV_sortAndRefreshSequences() By: ACRM
- 16.06.14  Added dotify and nocolour
- 17.06.14  Added consensus
- 19.06.14  Added callback
- 22.12.15  Added labels
- 09.01.17  Choice of display (transposed or standard) based on transpose parameter
		JSAV_MarkRange only called if options.sortable is true
		Also calls printDataTable		By: JH
*/
function JSAV_refresh(divId, sequences, start, stop)
{
	var options = gOptions[divId];
	if (options.transpose) {
		var html = JSAV_transposeSequencesHTML(divId, sequences)
	} else {
		var html = JSAV_buildSequencesHTML(divId, sequences);
	}
									  
   var element = document.getElementById(divId + "_sortable");
   element.innerHTML = html;
   $('#' + divId + ' .seqtable').css('width', seqtabWidth);
   $('#' + divId + ' .outerseqtable').css('width', seqtabWidth);
   $('#' + divId + ' .header').css('width', seqtabWidth);
   $('#' + divId + ' .footer').css('width', seqtabWidth);

 if(options.border)
   {
       JSAV_modifyCSS(divId);
   }

   if (options.sortable)
   {	  
	   JSAV_showRange(divId);
   }
   
   printDataTable(divId, sequences);						

   if(options.callback != undefined)
    {
        window[options.callback](divId);
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
- 01.09.17 Added gDisplayOrder and gDisplayColumn  By: JH
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
       gSequences       = Array();
       gOptions         = Array();
       gStartPos        = Array();
       gStopPos         = Array();
       gConsensus       = Array();
       gSequenceLengths = Array();
       gDisplayOrder 	= {};
       gDisplayColumn 	= {};
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
- 01.09.17  Added displayrow condition - consensus calculated on non-hidden sequences only
*/
function JSAV_buildConsensus(sequences)
{
    var nSeqs    = sequences.length;
    var nDispSeqs = 0;
    var seqLen   = sequences[0].sequence.length;
    // Initialize array
    var aaCounts = Array(seqLen);
    for(var i=0; i<seqLen; i++)
    {
        aaCounts[i] = Array();
    }

    // Step through the sequences
    for(var seq=0; seq<nSeqs; seq++)
	if (sequences[seq].displayrow)					
    {
        nDispSeqs++;
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
        if(maxAA <= (nDispSeqs / 2))
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
@returns {array}               (multi-dimensional) Array

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
        i   = length;

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
                $( this ).dialog( "close" );
                $( this ).remove();
                callback(true);
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


function chainChange(labels, divId) {

if (labels != undefined) {
  var res = labels.length;
  for (var i=0; i < labels.length-1; i++)
    if (labels[i].substring(0,1) != labels[i+1].substring(0,1)) {
      res = i;
    }
  return res;
} else {
  return gSequenceLengths[divId];
}
}

// ---------------------------------------------------------------------
/**
Create the HTML for a label row in the sequence display

@param   {string}   divId      - The div we are working in
@param   {int}      seqLen     - The length of the alignment
@param   {bool}     selectable - Are there sequences selection boxes
@param   {string[]} labels     - Array of labels
@returns {string}              - HTML

@author 
- 22.12.15 Original   By: ACRM
- 09.01.17 Modified considerably for new label format	By: JH
*/

function JSAV_buildLabelsHTML(divId,  seqLen, labels, cc)
{
    var html = "";
    var pref;
    var labelNumbers = "";
    for(var i=0; i<labels.length; i++)
    {
        pref = '';
        if (i == cc) { pref = 'br_'; }
        // Make a copy of the label and remove the chain label
        var cellCol = (labels[i].substring(0,1) == 'l') ? "light-txt" : "heavy-txt";
        var labelText = labels[i].replace(/^[A-Za-z]/g, '');
        var lastChar = labelText.substring(labelText.length-1,labelText.length);
	html += "<td class='"+pref+cellCol+"'>";
        if (lastChar == "0") {
           labelNumbers = labelText;
	   }
	if (labelNumbers.length > 0) {
	   html += labelNumbers[0];
	   labelNumbers = labelNumbers.substring(1,labelNumbers.length)
	   }
	html += "</td>";
	}
   html += "<td class='rhcol'></td></tr><tr class='labelrow'><td>&nbsp;</td><td>&nbsp;</td></td>";
   for(var i=0; i<labels.length; i++)
    {
        pref = '';
        if (i == cc) { pref = 'br_'; }
        var cellCol = (labels[i].substring(0,1) == 'l') ? "light-txt" : "heavy-txt";
        var labelText = labels[i].replace(/^[A-Za-z]/g, '');

        // Find the last character
        var lastChar = labelText.substring(labelText.length-1,labelText.length);

        // Open a table cell with the label as a tooltip
        html += "<td class='tooltip "+pref+cellCol+"' title='" + labels[i] + "'>";

        // Insert the appropriate character
        if (lastChar == "0")   // 0 - do a '|'
        {
			html += "|";
        }
        else if (lastChar.match(/[A-Za-z]/))  // Insert code - show the code
        {
            html += lastChar;
        }
        else                                  // Otherwise do a '.'
        {
            html += ".";
        }

        // And finish the table cell
        html += "</td>";
    }

    return html;
}


// ---------------------------------------------------------------------
/**
Create an array of labels

@param   {object[]} sequences  - Array of sequence objects
@returns {string[]}            - Array of labels

@author 
- 22.12.15 Original   By: ACRM
*/
function JSAV_autoLabels(sequences)
{
    var seqLen = sequences[0].sequence.length;
    var labels = Array();
    for(var i=1; i<=seqLen; i++)
    {
        labels.push(i.toString());
    }
    return labels;
}

// -----------------------------------------------------------------
/**
Initialises dispOrder to initial sequence ordering

@param {object[]} sequences 	- array of sequence objects
@returns {int[]} dispOrder	- array of sequence elements in order of display

@author
- 09.01.17 Original By: JH
*/

function initDisplayOrder(sequences) {

var dispOrder = [];
for (var r=0; r<sequences.length; r++) {
	dispOrder[r] = r;
	}
return(dispOrder);
}

// -----------------------------------------------------------------
/**
Initialises dispColumn to default code 1 (unsorted) for each data table column (except sequence, displayrow, id and Chain id)

@param {string} divId		- divId we're dealing with
@param {object[]} sequences 	- array of sequence objects
@returns {int[]} dispColumn	- array of codes for indicating column sort status

@author
- 09.01.17 Original By: JH
*/

function initDisplayColumn(divId, sequences, displayColumns) {
	
var stypes = ['heavy','light'];
var dispColumn = {};
for (var stype in stypes) {
  for (var s=0; s<=sequences.length; s++) {
    for (var key in sequences[s]) {
	if ((key != 'sequence') && (key != 'displayrow') && (key != 'id') && (key.substring(6) != 'Chain id')) {
           var colheaders = key.split('_');
           var colname = '';
           for (k=2; k<colheaders.length; k++) colname += colheaders[k] + '';
           colname = colname.trim();
           if (colheaders[0] == stypes[stype]) {
      	      if (displayColumns && displayColumns.hasOwnProperty(key)) 
                  dispColumn[key] = displayColumns[key];
              else 
		if ( gOptions[divId].defaultVisibleColumns.indexOf(colname) >= 0 )
		  { 
                     dispColumn[key] = 1;
		  } else {
                    dispColumn[key] = 0;
                  }
                }
            }
	}
    }
  }
for (var term in gOptions[divId].searchTerms) {
  for (var stype in stypes) {
    for (var s=0; s<=sequences.length; s++) {
      for (var key in sequences[s]) {
        var colheaders = key.split('_');
        var colname = '';
        for (k=2; k<colheaders.length; k++) colname += colheaders[k] + '';
        colname = colname.trim();
	if ((colname.toLowerCase() == term) || (term == 'simple')) {
           if (colheaders[0] == stypes[stype]) {
	      if ( sequences[s][key].toLowerCase().indexOf(gOptions[divId].searchTerms[term].toLowerCase()) >= 0 ) 
		{ 
      	        if (displayColumns && displayColumns.hasOwnProperty(key))
                       dispColumn[key] = displayColumns[key];
                else
 		  dispColumn[key] = 0; 
                }
              }
           }
         }
      }
    }
  }
return(dispColumn);
}

// -----------------------------------------------------------------
// ------------------ Data Table Functions -------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------
/**
Main function for printing the data table

@param {string} divId		- divId we're dealing with
@param {object[]} sequences 	- array of sequence objects

@author
- 09.01.17 Original By: JH
*/

function printDataTable(divId, sequences) {

var options = gOptions[divId];
var ctype = options.chainType;
var dispOrder = gDisplayOrder[divId];
var tableDiv = divId + '_Table';
var outerTableDiv = tableDiv + 'Outer';
var tableTag = "#" + tableDiv;
var html = '';
html += printToggleList(divId);
html += "<div id='"+outerTableDiv+"'>";
html += "<div class='header' style='padding-left:16px;'>";
html += printTableHeader(divId, options.selectable);
html += "</div>";
html += "<div id='" + tableDiv + "_Outer' class='outertablebody'>";
html += "<div id='" + tableDiv + "_Inner' class='innertablebody'>";
html += "<table class='results' border='1' id='" + divId + "_tablebody'>";
for (var s=0;s<sequences.length;s++)
	html += printDataRow(divId, sequences[dispOrder[s]]);
html += '</table>';
html += "</div></div></div>";
html += "<div id='" + tableDiv + "_Controls' class='JSAVControls'>";
html += "</div>";
$("#" + tableDiv).html(html);

if (options.hideable)
  {
  JSAV_ControlButton(divId, tableDiv + '_Controls', 'Hide selected sequences', 
                     options.hideLabel, '', 'Hide Sequences', 'JSAV_hideSelectedSequences("' + divId + '")');	
  JSAV_ControlButton(divId, tableDiv + '_Controls', 'Show hidden sequences', 
                     options.showallLabel, '', 'Show Hidden Sequences', 'JSAV_resetDisplayrow("' + divId + '")');	
  }

if (options.exportable)
  {
  JSAV_ControlButton(divId, tableDiv + '_Controls', 'Export visible sequences to CSV', 
                     options.exportLabel, 'CSV', 'Export CSV', 'JSON2CSV("'+divId+'")');
  JSAV_ControlButton(divId, tableDiv + '_Controls', 'Export visible sequences to XML for Excel - your Excel must support XML import', 
                     options.exportLabel, 'Excel', 'Export Excel', 'JSON2XML("'+divId+'")');
  }
$('#' + divId + "_tablebody").css('width',tableWidth+6); 
$('#' + tableDiv + "_Outer").css('width',tableWidth+24); 
$('#' + tableDiv + "_Inner").css('width',tableWidth+8); 
$("#" + outerTableDiv).css("width","98vw");
$("#" + outerTableDiv).css("margin-left","0.5em");
$("#" + outerTableDiv).css("overflow-x","auto");
}


// -----------------------------------------------------------------
/**
resets displayColumn to default code 1 (unsorted) for each data table column (except sequence, displayrow, id and Chain id)

@param {object[]} sequences 		- array of sequence objects
@param {int[]} displayColumn		- array of codes for indicating column sort status

@author
- 09.01.17 Original By: JH
*/

function resetDisplayColumn(displayColumn, sequences) {
for (var key in displayColumn) 
	if ((key != 'sequence') && (key != 'displayrow') && (key != 'id') && (key.substring(6) != 'Chain id'))
		if (displayColumn[key] >0)
			displayColumn[key] = 1;
}

// -----------------------------------------------------------------
/**
Sorts the table based on the column values and the sort direction
Final ordering is set in gDisplayOrder[divId]
Calls JSAV_refresh to redraw the sequences and table

@param {string} divId 		- the divId we're dealing with
@param {string} direction	- the sort direction
@param {string} colName		- name of the column on which the sort is based

@author
- 09.01.17 Original By: JH
*/

function compareVals(colVal, hiVal, numeric) {

if (numeric) {
    if (Number(colVal) > Number(hiVal))
       return 1;
    else if (Number(colVal) < Number(hiVal))
       return -1;
    else return 0;
} else {
     if (colVal > hiVal)
       return 1; 
     else if (colVal < hiVal)
       return -1;
     else return 0;
}
}

function DT_sortColumn(divId, direction, colName) {
	
var options = gOptions[divId];
var sequence = gSequences[divId];
var numeric = true;	
var idxFree = [];
var hV = -1;
gStartPos[divId] = 1;
gStopPos[divId] = gSequenceLengths[divId];

for (var r1=0; r1<sequence.length; r1++) {
	idxFree[r1] = true;
	if (isNaN(sequence[r1][colName])) {
		hV = ''; 
		numeric = false;
		}
	}
if (direction == 'asc') {
	for (var r1=sequence.length-1; r1>=0; r1--) 
		{
		var hiVal = hV;
		var idx = 0;
		for (var r2=0; r2<sequence.length; r2++)
			if (idxFree[r2]) {
				if (compareVals(sequence[r2][colName], hiVal, numeric) >=0 ) {
					hiVal = sequence[r2][colName];
					idx = r2;
					}
			}
		idxFree[idx] = false;
		gDisplayOrder[divId][r1] = idx;
		}
	gDisplayColumn[gOptions[divId].chainType][colName] = 2;
} else {
	for (var r1=0; r1<sequence.length; r1++) 
		{
		var hiVal = hV;
		var idx = 0;
		for (var r2=0; r2<sequence.length; r2++)
			if (idxFree[r2]) {
				if (compareVals(sequence[r2][colName], hiVal, numeric) >0) {
					hiVal = sequence[r2][colName];
					idx = r2;
					}
			}
		idxFree[idx] = false;
		gDisplayOrder[divId][r1] = idx;
		}
	gDisplayColumn[gOptions[divId].chainType][colName] = 3;
}
for (var key in gDisplayColumn[gOptions[divId].chainType])
	if ((key != colName) && (gDisplayColumn[gOptions[divId].chainType][key] != 0))
		gDisplayColumn[gOptions[divId].chainType][key] = 1;

JSAV_refresh(divId, gSequences[divId], 0, gSequences[divId][0].sequence.length-1);

} 
 
// -----------------------------------------------------------------
/**
Toggles display of the column then recalls printDataTable
@param {string} divId	- divId we're dealing with
@param {string} colName - name of column to display/undisplay

@author
- 09.01.17 Original By: JH
*/

function DT_toggleColumn(divId, colName) {
		
        if (gDisplayColumn[gOptions[divId].chainType][colName]) {
		gDisplayColumn[gOptions[divId].chainType][colName] = 0;
	}
	else {
		gDisplayColumn[gOptions[divId].chainType][colName] = 1;
	}
        printDataTable(divId, gSequences[divId]);
		
}

// -----------------------------------------------------------------
/**
Export sequences to CSV file
@param {string} divId	- divId we're dealing with

@author
- 22.05.17 Original By : JH
*/

function JSON2CSV(divId) {

var sequence = gSequences[divId];
var dispOrder = gDisplayOrder[divId];
var CSV = '';
var row = '';
var columns = [];
columns['heavy'] = new Array();
columns['light'] = new Array();
for (var s in sequence[0]) {
    if (gDisplayColumn[gOptions[divId].chainType][s]) {
	columns[s.substring(0,5)].push(s);
	}
    }
for (var t in columns) 
   if (columns[t].length > 0) {
   row += '"' + t.toUpperCase() + '",';
   for (var d=1; d<columns[t].length; d++)
     row += ",";
}
CSV += row.slice(0,-1) + '\r\n';
row = '';
for (var t in columns) {
    for (var c=0; c<columns[t].length; c++)
	row += columns[t][c].substring(6) + ',';
    }
for (var s=0; s<gOptions[divId].labels.length; s++) {
    row += gOptions[divId].labels[s] + ',';
    }
CSV += row.slice(0,-1) + '\r\n';
for (var i=0; i<sequence.length; i++) {
    if (sequence[dispOrder[i]].displayrow) {
        row = '';
	for (var t in columns) {
        for (var c=0; c<columns[t].length; c++) {
           if (sequence[dispOrder[i]][columns[t][c]] == undefined) {
	      row += ',';
           } else {
              row += '"' + sequence[dispOrder[i]][columns[t][c]] + '",';
	   }
        }
	}
        for (var s=0; s<sequence[dispOrder[i]].sequence.length; s++) {
           row += sequence[dispOrder[i]].sequence[s] + ',';
           }
	CSV += row.slice(0,-1) + '\r\n';
	}
    }
if (CSV == '') {
	alert("Invalid data");
	return;
	}
var link = document.createElement("a");
var browser = window.navigator.userAgent;
var appStr = 'data:text/csv;charset=utf-8';
var fileName = "JSAV_Export.csv";
if((browser.indexOf('MSIE ') > 0) || (browser.indexOf('Trident/') > 0) || (browser.indexOf('Edge/') > 0)) 
   { 
   var blob = new Blob([CSV], {type: appStr });
   window.navigator.msSaveBlob(blob, fileName);
   }
else
   {
   link.href = appStr + ',' + encodeURIComponent(CSV);
   link.style = "visibility:hidden";
   link.download = fileName;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   }

}


// -----------------------------------------------------------------
/**
Export sequences to XML file
@param {string} divId	- divId we're dealing with

@author
- 2.08.17 Original By : JH
*/

function JSON2XML(divId) {

var sequence = gSequences[divId];
var dispOrder = gDisplayOrder[divId];
var options = gOptions[divId];
var columns = [];
columns['heavy'] = new Array();
columns['light'] = new Array();
var XML = '<?xml version="1.0"?>\r\n<?mso-application progid="Excel.Sheet"?>\r\n';
XML += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\r\nxmlns:o="urn:schemas-microsoft-con:office:office"\r\n';
XML += 'xmlns:x="urn:schemas-microsoft-com:office:excel"\r\nxmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\r\nxmlns:html="http://www.w3.org/TR/REC-html40">\r\n';
XML += '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"></DocumentProperties>\r\n';
XML += '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel"></ExcelWorkbook>\r\n';
XML += '<Styles>\r\n <Style ss:ID="columnHeader">';
XML += '  <Alignment ss:Horizontal="Center"/>\r\n';
XML += '  <Font ss:Bold="1"/>\r\n';
XML += ' </Style>\r\n';
for (var c in aaColours[options.colourScheme]) {
   XML += ' <Style ss:ID="'+ c + '">';
   XML += '  <Interior ss:Color="' + aaColours[options.colourScheme][c] + '" ss:Pattern="Solid" />';
   XML += ' </Style>\r\n';
   }
XML += ' <Style ss:ID="heavy">';
XML += '  <Interior ss:Color="#666666" ss:Pattern="Solid" />';
XML += ' </Style>\r\n';
XML += ' <Style ss:ID="light">';
XML += '  <Interior ss:Color="#999999" ss:Pattern="Solid" />';
XML += ' </Style>\r\n';
XML += '</Styles>\r\n';
XML += '<Worksheet ss:Name="abysis_output">\r\n<Table x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="15">\r\n';

for (var s in sequence[0]) {
    if (gDisplayColumn[gOptions[divId].chainType][s]) {
	XML += '  <Column ss:AutoFitWidth="0" ss:Width="'+(s.length*7)+'"/>\r\n';
	columns[s.substring(0,5)].push(s);
	}
    }
for (var s=0; s<sequence[0].sequence.length; s++) {
    XML += '  <Column ss:AutoFitWidth="0" ss:Width="15.0"/>\r\n';
    }


XML += '<Row ss:StyleID="columnHeader">\r\n';
for (var t in columns) 
   if (columns[t].length > 0) {
   XML += '  <Cell ss:StyleID="' + t + '" ss:MergeAcross="' + (columns[t].length-1) + '"><Data ss:Type="String">' + t.toUpperCase() + '</Data></Cell>\r\n';
}
XML += '</Row>\r\n';
XML += '<Row ss:StyleID="columnHeader">\r\n';
for (var t in columns) {
    for (var c=0; c<columns[t].length; c++)
	XML += '  <Cell ss:StyleID="' + t + '"><Data ss:Type="String">' + columns[t][c].substring(6) + '</Data></Cell>\r\n';
    }
for (var s=0; s<options.labels.length; s++) {
    XML += '  <Cell><Data ss:Type="String">' + options.labels[s] + '</Data></Cell>\r\n';
    }

XML += '</Row>\r\n';

for (var i=0; i<sequence.length; i++) {
    if (sequence[dispOrder[i]].displayrow) {
        row = '<Row>\r\n';
	for (var t in columns) {
        for (var c=0; c<columns[t].length; c++) {
           if (sequence[dispOrder[i]][columns[t][c]] == undefined) {
	      row += '  <Cell><Data ss:Type="String"> </Data></Cell>\r\n';
           } else {
              row += '  <Cell><Data ss:Type="String">' + sequence[dispOrder[i]][columns[t][c]] + '</Data></Cell>\r\n';
	   }
        }
	}
         for (var s=0; s<sequence[dispOrder[i]].sequence.length; s++) {
           row += '  <Cell ss:StyleID="' + sequence[dispOrder[i]].sequence[s] + '"><Data ss:Type="String">' + sequence[dispOrder[i]].sequence[s] + '</Data></Cell>\r\n';          }
        row += '</Row>';
	XML += row;
	}
    }

XML += '</Table></Worksheet></Workbook>';
if (XML == '') {
	alert("Invalid data");
	return;
	}

var link = document.createElement("a");
var browser = window.navigator.userAgent;
var appStr = 'data:application/xml;charset=utf-8';
var fileName = "JSAV_Export.xml";
if((browser.indexOf('MSIE ') > 0) || (browser.indexOf('Trident/') > 0) || (browser.indexOf('Edge/') > 0)) 
   { 
   var blob = new Blob([XML], {type: appStr });
   window.navigator.msSaveBlob(blob, fileName);
   }
else
   {
   link.href = appStr + ',' + encodeURIComponent(XML);
   link.style = "visibility:hidden";
   link.download = fileName;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   }
}


// -----------------------------------------------------------------
/**
Prints the toggle list - the buttons for redisplaying columns where display is toggled off

@param {string} divId 		- divId we're dealing with
@returns {string} html		- HTML

@author
- 09.01.17 Original By: JH
*/

function truncateLabel(lbl, num) {

var lblarr = lbl.split(' ');
if (lblarr.length <= num) {
   var lblsht = lbl;
   } else {
   var lblsht = lblarr.slice(lblarr.length-(num+2)).join(" ");
   }
return lblsht;
}

function printToggleList(divId) {

var html = "<div class='toggle-col-list'>Show hidden columns: ";
var grpList = [];
for (var key in gDisplayColumn[gOptions[divId].chainType]) 
  if (gDisplayColumn[gOptions[divId].chainType][key] == false) {
    var keyList = key.split('_');
    if (grpList.indexOf(keyList[1]) == -1) 
       	grpList.push(keyList[1]);
  }
for (var i=0; i<grpList.length; i++) {
  html += "<select class='" + gOptions[divId].chainType + "button'><option style='display:none;'>" + grpList[i] + "</option> "
  for (var key in gDisplayColumn[gOptions[divId].chainType]) 
    if (gDisplayColumn[gOptions[divId].chainType][key] == false) {
      var keyList = key.split('_');
      if (grpList[i] == keyList[1]) {
        var keyText = '';
        for (var k=2; k<keyList.length; k++) 
            keyText += keyList[k] + ' ';
	keyText = keyText.trim();
        var desc = (gOptions[divId].ptmLabels.hasOwnProperty(keyText)) ? gOptions[divId].ptmLabels[keyText] : keyText;
        var onclick = "DT_toggleColumn(\"" + divId + "\", \"" + key + "\");"; 
        html += "<option class='tooltip' title='Show "+desc+"' onclick='"+onclick+"'>"+keyText+"</option>";
      }
    }
  html += "</select>"
} 
html += '</div>';
return(html);
}

// -----------------------------------------------------------------
/**
Prints the header for the table columns. Top line is the 'hide' icon, to toggle the column display to off.
Second line is the Name and the sort icon, based on the respective field in gDisplayColumn.

@param {string} divId 		- divId we're dealing with
@returns {string} html		- HTML

@author
- 09.01.17 Original By: JH
*/

function printTableHeader(divId, selectable) {
	
var html = "<table class='results' border='1' id='" + divId + "_tablehead'>";

var options = gOptions[divId];
var maxrows = 0;
for (var key in gDisplayColumn[gOptions[divId].chainType]) 
  if (gDisplayColumn[gOptions[divId].chainType][key]) {		
	var numrows = key.split('_');
        if (numrows.length > maxrows) maxrows = numrows.length;
	}
for (var row=0; row<maxrows; row++) {
  html += "<tr>";
  if (row > 0) 
     html += JSAV_buildSelectAllHTML(divId, selectable, (row==(maxrows-1)), '');
  var colspan = 3;
  var rowstart = true;
  var lastcell = "";
  var lasthtml = "";
  tableWidth = 20;
  for (var key in gDisplayColumn[gOptions[divId].chainType]) 
     {
     if (gDisplayColumn[gOptions[divId].chainType][key]) 
        {
        var colheaders = key.split('_');
	var colheader = "";
        var colName = '';
        for (var k=2; k<colheaders.length; k++) 
            colName += colheaders[k] + ' ';
	colName = colName.trim();
	var colClass = colheaders[0]+"-col";
        var colDesc = (options.ptmLabels.hasOwnProperty(colName)) ? options.ptmLabels[colName] : colName;
        var colWidth = (colName in options.formattedCols) ? options.formattedCols[colName] : 50;
        tableWidth += (colWidth + 40);
	for (var r=0;r<=row;r++)
	   colheader += colheaders[r];
        var htmlcell = "";
	if (colheader == lastcell) {
	    colspan +=3;
	} else {
	    colspan = 3;
	}
        if (row==0) 
           {
           var seqtype = colheaders[0];
           }
        else if (row==colheaders.length-1) 
           {
	   switch (gDisplayColumn[gOptions[divId].chainType][key]) 
                { 
		case 2: var clist='headerSortDown'; 
                        var icon = 'fas fa-sort-down';
			var direction = "desc";
			break;
		case 3: var clist='headerSortUp'; 
                        var icon = 'fas fa-sort-up';
			var direction = "asc";
			break;
		default: var clist='headerSortBoth'; 
                         var icon = 'fas fa-sort';
			 var direction = "asc";
		}
	   var toggleclick = "onclick='DT_toggleColumn(\"" + divId + "\", \"" + key + "\");'";
	   var sortclick = "onclick='DT_sortColumn(\"" + divId + "\", \"" + direction + "\", \"" + key + "\");'";
	   htmlcell += "<th class='"+colClass+" headerHide'>";
           htmlcell += "<div "+toggleclick+"><i class='fa fa-eye-slash fa-inverse tooltip' title='Hide Column "+colDesc+"'></i></div></th>";
           htmlcell += "<th class='"+colClass+" headerText' style='min-width:"+colWidth+"px;max-width:"+colWidth+"px;'>";
           htmlcell += "<div class='truncated tooltip' title='"+colDesc+"'>" + colheaders[row] + "</div></th>";
           htmlcell += "<th class='"+colClass+" headerSort'><div "+sortclick+"><i class='"+icon+" fa-inverse fa-lg tooltip' title='Sort Column "+colName+"'></i><div></th>";
	   } 
        else 
           {
           if (row < colheaders.length-1)
              var colSpread = ((colWidth * colspan)/3);
           else
              var colSpread = colWidth;
           htmlcell += "<th class='lrborderheader "+colClass+"' colspan="+colspan+" style='width:"+colSpread+"px;'>";
           htmlcell += "<div class='truncated'>";
           if (row < colheaders.length) htmlcell += colheaders[row]; 
           htmlcell += "</div></th>";
           }
        if (rowstart) 
           {
           rowstart = false;
	   } 
        else if (colheader != lastcell) 
           {
           html += lasthtml;
           }
	lasthtml = htmlcell;
	lastcell = colheader;
        }
     }
  html += lasthtml + "</tr>";
  }
html += "</table>";
return(html);
}

// -----------------------------------------------------------------
/**
Displays a single row of the data table, where displayrow is true

@param {string} divId 		- the divId we're dealing with
@param {object} sequence	- the sequence to display
@returns {string} html		- HTML

@author
- 09.01.17 Original By: JH
*/

function printDataRow(divId, sequence) {

var options = gOptions[divId];
var html = "";
var bgcol;
if (sequence.displayrow) 
   {
   html += "<tr id = 'table_" + sequence.id + "'>";
   var name = "select_" + sequence.id;
   var cname = name.replace(/\./g, "_").replace(/\//g, "_");
   var checked = ($('.' + cname).prop('checked')) ? 'checked' : '';
   var onclick = "onclick='JSAV_resetAllNone(\""+divId+"\",\""+cname+"\",this.checked);'";
   html += "<td><input class='"+cname+" selectBox' type='checkbox' name='" + name + "' " + checked + " " + onclick + "/></td>";
   for (var key in gDisplayColumn[gOptions[divId].chainType])
      if (gDisplayColumn[gOptions[divId].chainType][key])
	 {
         var colheaders = key.split('_');
	 var matchcol = colheaders[0] + '_Numbered';
         var colName = '';
         for (var k=2; k<colheaders.length; k++) 
            colName += colheaders[k] + ' ';
	 colName = colName.trim();
         var lcColName = (colName in options.formattedCols) ? colName.toLowerCase() : 'other';
         var colWidth = (colName in options.formattedCols) ? (options.formattedCols[colName] + 40) : 90;
         var feint = (sequence[matchcol] == 'N') ? ' feint' : '';                        
         bgcol = '';
 	 if (typeof(sequence[key]) == 'undefined') 
            {
            html += "<td></td>";
	    } 
         else if (colName.toLowerCase() == 'accession') 
            {
            bgcol = "accession";
            if (options.searchTerms['accession']) 
               if (sequence[key].toLowerCase().indexOf(options.searchTerms['accession'].toLowerCase()) >= 0)
                  bgcol += " highlight"; 
            var attrArray = options.idSubmitAttribute.split(':');
            var idSubmitAttr = '';
            for (var a=0; a<attrArray.length; a++)
               idSubmitAttr += sequence[attrArray[a]] + ':';
            idSubmitAttr = idSubmitAttr.replace(/:$/,'');
            if (sequence[matchcol] == 'N') idSubmitAttr = null;
	    html += JSAV_buildId(divId, idSubmitAttr, sequence[key], options.idSubmit, options.idSubmitKey, 1, bgcol, options.humanOrganism)
 	    } 
         else 
            {                     
            var cellText = sequence[key];
            for (var term in options.searchTerms) 
               {
               if (( term == 'simple')  || (colName.toLowerCase() == term) ) 
                  {
                  var re = new RegExp(options.searchTerms[term], 'i');
                  if (sequence[key].search(re) != -1) {
                     var cellArr = sequence[key].replace(/\>/g,'> ').split(' ');
                     cellText = '';
                     for (var c=0; c<cellArr.length; c++) {
                        var cellWord = cellArr[c] + ' ';
                        if (cellWord.search(re) != -1) {
                           cellWord = "<span class='highlightmatch'>"+cellWord.toUpperCase()+"</span>"
                           }
                        cellText += cellWord;
                        }
                     }
                  }
               }
	    html += "<td class='bodyText' style='min-width:"+colWidth+"px;max-width:"+colWidth+"px;'><div class='wwrap " + lcColName + feint + "'>";
            html += cellText + "</div></td>";
	    }
	}
	html += "</tr>";
   }
return(html);
}

// --------------------- END OF FILE ------------------------------------/
