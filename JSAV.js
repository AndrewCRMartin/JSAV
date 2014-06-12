/** @preserve 
    @file
    JSAV V1.1 06.06.14
    Copyright:  (c) Dr. Andrew C. R. Martin, UCL, 2014
    This program is distributed under the Gnu Public Licence (GPLv2)
*/
/** ***********************************************************************
   Program:    JSAV  
   File:       JSAV.js
   
   Version:    V1.1
   Date:       10.06.14
   Function:   JavaScript Sequence Alignment Viewier
   
   Copyright:  (c) Dr. Andrew C. R. Martin, UCL, 2014
   Author:     Dr. Andrew C. R. Martin
   Address:    Institute of Structural and Molecular Biology
               Division of Biosciences
               University College
               Gower Street
               London
               WC1E 6BT
   EMail:      andrew@bioinf.org.uk
               
**************************************************************************
   This program is distributed under the GPL licence
   Alternative licences are available on request.
**************************************************************************
   Description:
   ============
   JSAV is a simple JavaScript protein sequence alignment viewer. It
   allows you to select a region of the alignment and sort on that
   region.
**************************************************************************
   Revision History:
   =================
   V1.0   06.06.14   Original  By: ACRM
   V1.1   10.06.14   Code cleanup
                     Changed options to a hash
                     Further code cleanup - some code was assuming
                     sequences were stored in an array called 'sequences'
                     Added 'selectable' option
*************************************************************************/
/**
This is the only routine called by a user. It takes an array of
sequence objects and displays them as a coloured sortable table
optionally with a slider and sort button

@example printJSAV('mySeqDisplay', sequenceArray, true, '400px');
Where 'mySeqDisplay' is the name of a div that will be created
      sequenceArray  is an array of sequence objects
      true           indicates that the display should be sortable
      '400px'        indicates the width of the slider for specifying
                     a sort range

@param {object[]}  sequences -  Array of sequence objects
@param {string}    divId     - ID of div to print in
@param {object}    inOptions - options (see below)

@param {bool}      sortable  - Should the sorting options be displayed
@param {string}    width     - The width of the selection slider with
                              units (e.g. '400px')

options are as follows:
@param {bool}      sortable  -  Should the sorting options be displayed
                                (default: false)
@param {string}    width     -  The width of the selection slider with
                                units (default: '400px')
@param {bool}      selectable - Should selection checkboxes be displayed
                                for each sequence

- 29.05.14 Original  By: ACRM
- 30.05.14 Now just calls JSAV_buildSequencesHTML() and prints the results
- 05.06.14 Added divId parameter and sortable
- 06.06.14 Added width
- 10.06.14 sortable and width parameters now replaced by 'options'
           Added 'selectable' option
           Stores sequence length in global array
- 11.06.14 Added deletable
*/
function printJSAV(divId, sequences, inOptions)
{
   var options = Array();

   // Deal with options
   if(inOptions == undefined)
   {
      options.width = "400px";
   }
   else
   {
      options = inOptions;
      if(options.width == undefined)
      {
          options.width = "400px";
      }
   }

   // Initialize globals if not yet done
   JSAV_init();

   gOptions[divId] = options;
   gSequences[divId] = sequences;
   gSequenceLengths[divId] = sequences[0].sequence.length;

   document.writeln("<div id='" + divId + "'>");

   document.writeln("<div id='" + divId + "_sortable'>");
   var html = JSAV_buildSequencesHTML(divId, sequences, options.sortable, options.selectable);
   document.write(html);
   document.writeln("</div>");

   if(options.sortable)
   {
      var start = 1;
      var stop  = gSequenceLengths[divId];

      document.writeln("<p></p>");

      JSAV_buildSlider(divId, stop, options.width);

      document.writeln("<form>");
      var html = "<button type='button' onclick='JSAV_sortAndRefreshSequences(\"" + divId + "\", true, " + options.selectable + ", " + options.border + ")'>Sort</button>";
      document.writeln(html);

      document.writeln("</form>");
   }

   if(options.selectable && options.deletable)
   {
      JSAV_buildDelete(divId);
   }

   document.writeln("</div>");

   if(options.border)
   {
       JSAV_modifyCSS(divId);
   }
}

function JSAV_buildDelete(divId)
{
   var html = "<button type='button' onclick='JSAV_deleteSelectedSequences(\"" + divId + "\")'>Delete Selected</button>";
   document.writeln(html);
}

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
    var message = "Delete " + count + " selected sequences?";
    if(confirm(message))
    {
        for(var i=0; i<toDelete.length; i++)
        {
            ACRM_deleteItemByLabel('id', toDelete[i], gSequences[divId]);
        }
    }

    var options = gOptions[divId];
    JSAV_Refresh(divId, gSequences[divId], options.sortable, options.selectable, options.border, gStartPos[divId], gStopPos[divId]);

    // Run through the global sequence array deleting the selected objects

}

function ACRM_deleteItemByLabel(label, id, array)
{
    for(var i=0; i<array.length; i++)
    {
       if(array[i][label] == id)
       {
           array.splice(i,1);
           break;
       }
    }
}

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


function JSAV_selectAll(divId)
{
   var tag = "#" + divId + " .selectCell input";
   $(tag).prop('checked', true);
}

function JSAV_unselectAll(divId)
{
   var tag = "#" + divId + " .selectCell input";
   $(tag).prop('checked', false);
}

function JSAV_modifyCSS(divId)
{
    var selector = "#" + divId + " .JSAV td";
    $(selector).css("border", "1px solid white");

//    selector = "#" + divId + " .JSAV .bottomrow tr";
//    $(selector).css("border-right", "1px solid black");
}

// ---------------------------------------------------------------------
/**
Prints a sequence as a table row. The row starts with the identifier
and is followed by each amino acid in a separate <td> tag with a 
class to indicate the amino acid type (e.g. aaW for a tryptophan). 

@param {string} id         The identifier
@param {string} sequence   A string containing the sequence

- 29.05.14 Original  By: ACRM
- 30.05.14 Now just calls JSAV_buildASequenceHTML() and prints result
*/
function JSAV_printASequence(id, sequence)
{
   var html  = JSAV_buildASequenceHTML(id, sequence, false);
   document.write(html);
}

// ---------------------------------------------------------------------
/**
Builds the HTML for printing a sequence as a table row. The row 
starts with the identifier and is followed by each amino acid in a 
separate <td> tag with a class to indicate the amino acid type 
(e.g. aaW for a tryptophan). 

@param {string}   id         The identifier
@param {string}   sequence   A string containing the sequence
@param {bool}     selectable Display a selection checkbox
@returns {string} text       HTML snippet

- 30.05.14 Original  By: ACRM
*/
function JSAV_buildASequenceHTML(id, sequence, selectable)
{
   var tableLineArray = sequence.split("");

   var tableLine = "<tr id='" + id + "'>";
   tableLine += "<th class='titleCell'>" + id + "</th>";

   if(selectable)
   {
      var name = "select_" + id;
      tableLine += "<th class='selectCell'><input type='checkbox' name='" + name + "' /></th>";
   }

   var nResidues = tableLineArray.length;
   for(var i=0; i<nResidues; i++)
   {
      var aa = tableLineArray[i];
      tableLine += "<td class='aa" + aa + "'>" + aa + "</td>"
   }
   tableLine += "</td></tr>";

   return(tableLine);
}

// ---------------------------------------------------------------------
/**
Builds the slider for selecting a maximum and minimum position for
sorting. Also calls routine to display the currently selected range -
i.e. the whole sequence length

@param {string}   divId   The name of the div used for the display
@param {int}      seqLen  The length of the sequence alignment
@param {string}   width   The width of the slider

- 06.06.14  Original   By: ACRM
- 10.06.14  Removed redundant variable and changed divs to spans
*/
function JSAV_buildSlider(divId, seqLen, width)
{
   document.writeln("<span id='" + divId + "_showrange'></span>");
   document.writeln("<span id='" + divId + "_slider'></span>");

   var id = divId + "_slider";
   var tag = "#" + id;

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

- 06.06.14  Original   By: ACRM
- 10.06.14  Removed redundant .closest() from finding parent
- BUG - this assumes the sequences are stored in an array called 'sequences'!
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
      JSAV_highlightRange(eventOrId, gSequenceLengths[eventOrId], gStartPos[eventOrId]-1, gStopPos[eventOrId]-1);
   }
   else
   {
      var id = $(this).parent().attr("id");
      var tag = "#" + id + "_showrange";

      // Get the values out of the slider
      gStartPos[id] = ui.values[0];
      gStopPos[id]  = ui.values[1];

      // Display the range currently selected
      var html = "Sort from: " + gStartPos[id] + " to: " + gStopPos[id];
      $(tag).text(html);
      JSAV_highlightRange(id, gSequenceLengths[id], gStartPos[id]-1, gStopPos[id]-1);
   }
}

// ---------------------------------------------------------------------
/**
Simple wrapper function to obtain the currently selected range

@param   {string}   divId    Identifier for display div
@returns {int[]}             Start and stop of range

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

@param   {object[]}   sequences   Array of sequence objects
@param   {bool}       sortable    Should the marker line be displayed
                                  for sortable displays
@returns {string}                 HTML

- 30.05.14 Original  By: ACRM
- 06.06.14 Added call to build the marker row of selected residues
- 10.06.14 Added sortable and selectable parameters
*/
function JSAV_buildSequencesHTML(divId, sequences, sortable, selectable)
{
   var html = "";
   html += "<div class='JSAV'>\n";
   html += "<table border='0'>\n";

   if(selectable)
   {
      html += JSAV_buildSelectAllHTML(divId, gSequenceLengths[divId]);
   }

   for(var i=0; i<sequences.length; i++)
   {
      html += JSAV_buildASequenceHTML(sequences[i].id, sequences[i].sequence, selectable) + "\n";
   }

   if(sortable)
   {
      html += JSAV_buildMarkerHTML(divId, gSequenceLengths[divId], selectable);
   }

   html += "</table>\n";
   html += "</div>\n";
   return(html);
}

// ---------------------------------------------------------------------
function JSAV_buildSelectAllHTML(divId, seqLen)
{
   var html;
   var id = divId + "_AllNone";

   html = "<tr><th>All/None</th><th><input id='" + id + "' type='checkbox' onclick='JSAV_selectAllOrNone(\"" + divId + "\");' /></th>";
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

@param {string}   divId    Identifier of display div
@param {int}      seqLen   Length of sequences alignement

- 06.06.14  Original   By: ACRM
- 10.06.14  Added 'selectable'
*/
function JSAV_buildMarkerHTML(divId, seqLen, selectable)
{
    var html = "";

    if(selectable)
    {
        html += "<tr class='bottomrow'><th>Sort Region:</th>";
        html += "<th class='selectCell'></th>";
    }
    else
    {
        html += "<tr class='bottomrow'><td class='titleCell'>Sort Region:</td>";
    }

    for(var i=0; i<seqLen; i++)
    {
        var id = divId + "_JSAVMarker" + i;
        html += "<td id='" + id + "' class='unhighlighted' />&nbsp;</td>";
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
General purpose function to create a multi-dimensional array

@param   {int/int[]}  length   Size of each dimension
@returns {array}                  (multi-dimensional) Array

Usage:
ACRM_createArray();     // [] or new Array()
ACRM_createArray(2);    // new Array(2)
ACRM_createArray(3, 2); // [new Array(2),
                   //  new Array(2),
                   //  new Array(2)]

- 29.05.14 Taken from http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript
*/
function ACRM_createArray(length) 
{
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) 
    {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = ACRM_createArray.apply(this, args);
    }

    return arr;
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

@param  {int[]}    sequenceIndexes   Indexes of a set of sequences to search
@param  {int}      refSeq            Index of the sequence to compare with
@param  {int-2DArray}  differenceMatrix  differences between sequences
@eturns {int[]}                      Indexes of the sequences closest to
                                     the reference sequence

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
@param  {BOOL}      ignoreEnds   Ignore insert characters at
                                 ends of sequences
@param  {int}       start        Offset of start of region to sort
@param  {int}       stop         Offset of end of region to sort
@eturns {int-2DArray}                Differences between each pair
                                 of sequences

- 29.05.14 Original   By: ACRM
- 04.06.14 Added ignoreEnds handling
         Range version
*/
function JSAV_calcDifferenceMatrix(sequences, start, stop, ignoreEnds)
{
   var nSeq = sequences.length;

   var differenceMatrix = ACRM_createArray(nSeq, nSeq);
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

- 29.05.14 Original   By: ACRM
- 11.06.14 sequences is now global
*/
function JSAV_sortAndRefreshSequences(divId, sortable, selectable, border)
{
   var id = divId + "_JSAVStart";

   var range=JSAV_getRange(divId);
   var sortedSequences = JSAV_sortSequences(gSequences[divId], range[0], range[1]);

   JSAV_Refresh(divId, sortedSequences, sortable, selectable, border, range);

   return(false);
}


function JSAV_Refresh(divId, sequences, sortable, selectable, border, range)
{
   var html = JSAV_buildSequencesHTML(divId, sequences, sortable, selectable);
   var element = document.getElementById(divId + "_sortable");
   element.innerHTML = html;
   if(border)
   {
       JSAV_modifyCSS(divId);
   }
   JSAV_highlightRange(divId, gSequenceLengths[divId], range[0], range[1]);
}

// ---------------------------------------------------------------------
/**
Highlights a range of residues in the main sequence display table.
The special marker row is used for this and we simply alter the
class to pick up the appropriate colour for the cells from CSS

@param {string}    divId   Identifier for the display div
@param {int}       seqLen  Length of the alignment
@param {int}       start   Offset of first residue to be
                           highlighted (0-based)
@param {int}       stop    Offset of last residue to be
                           highlighted (0-based)

- 06.06.14  Original   By: ACRM
*/
function JSAV_highlightRange(divId, seqLen, start, stop)
{
   for(var i=0; i<seqLen; i++)
   {
       var id = divId + "_JSAVMarker" + i;
       document.getElementById(id).className = 'unhighlighted';
   }
   if((start >= 0) && (stop >= 0))
   {
      for(var i=start; i<=stop; i++)
      {
          var id = divId + "_JSAVMarker" + i;
          document.getElementById(id).className = 'highlighted';
      }
   }
}

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
       gSequenceLengths = Array();
       gStartPos = Array();
       gStopPos  = Array();
   }
}
