jQuery(function($){//on document ready
    configureWidgets();
    applyFormStyling();
    enableRowSelection();
    enableColumnSorting();
    enableShortcuts();
    enableCheckboxSubmission();
});

function configureWidgets() {
    //default settings for datepicker
    $.datepicker.setDefaults({
        dateFormat: 'dd/mm/yy',
        showOn: 'button',
        buttonImage: rootContext + 'public/images/date.png',
        buttonText: '',
        buttonImageOnly: true,
        constrainInput: false
    });

    // Schematic using jsPlumb
    jsPlumb.importDefaults({
        Anchors:['RightMiddle', 'LeftMiddle'],
        Connector: ['Straight'],
        Endpoint: ['Dot', {radius:5}],
        EndpointStyle: {fillStyle: '#ccc'},
        PaintStyle: {lineWidth: 5, strokeStyle:'#ccc'},
        ConnectionsDetachable:false
    });

    // jQuery UI tabs
    $('div.tabs').tabs({
        cookie: {
            expires: 1
        },
        select: function(event, ui) {
            // Force removal of schematic to avoid visible glitch
            jsPlumb.reset();
        },
        load: function(event, ui) {
            applyFormStyling($(event.target));
            enableRowSelection($(event.target));
            renderSchematic();
            renderGraphs();
        }
    });

    // Prevent scrolling page when navigating directly to a specific tab using anchor
    setTimeout(function() {
        if(location.hash) {
            window.scrollTo(0, 0);
        }
    }, 1);

    // Redraw schematic when browser window is resized
    $(window).resize(function() {
        $.doTimeout('resize', 250, function() {
            jsPlumb.repaintEverything();
        });
    });

    // Global site search for assets
    if ($('#site-search').length) {
        $('#site-search').each(enableLocationAutocomplete)
                         .autocomplete('option', 'position', {my: 'right top', at: 'right bottom'})
                         .autocomplete('option', 'select', function(event, ui) {
            location = rootContext + ui.item.url;
            return false;
        });
    }
}

function applyFormStyling(element) {
    if (element === undefined) {
        element = $('body');
    }

    // jQuery UI buttons
    element.find('div.options a, div.search a, div.links a, td.actions a, input:submit, a.cancel').button();
    element.find('div.links a.disabled').button('disable');

    // Datepickers
    element.find('input.date').datepicker({
        beforeShow: function(input, inst) {
            // Ensure input is enabled
            return !input.disabled;
        }
    });

    // Back links that use browser history if possible
    element.find('a.back').click(function() {
        if (history.length > 2) {
            history.back();
        } else {
            location = $(this).attr('href');
        }
        return false;
    });

    // In-place editing links
    element.find('a.inplace').click(function() {
        var link = $(this);
        showInplacePartial(link.data('url'), link.data('content'));
        return false;
    });

    // Dialog links
    element.find('a.dialog').click(function() {
        var link = $(this);
        showRemoteDialog(link.data('url'), link.data('title')); 
    });
    
    // Filter dialog links
    element.find('a.filter').click(showFilterDialog);

    // Export table links
    element.find('a.export').click(configureExport);
    
    // Quick search input - wait 250ms after typing before firing event
    element.find('input.quicksearch').keyup(applyQuickSearch);

    // Enable autocompletion for location lookup
    element.find('#location').each(enableLocationAutocomplete);

    // Enable generic autocomplete inputs
    element.find('.autocomplete').each(enableGenericAutocomplete);

    // Enable lookup of individual hazards on hazard selection
    element.find('#hazard').each(enableHazardSelection);

    // Enable lookup of control process attributes on process selection
    element.find('#process').each(enableProcessSelection);
    
    // Auto-focus first form element
    element.find('input.autofocus:first').focus();

    // Client side validation for form submission
    element.find('form.validate').submit(function() {
        $(this).find('.error').hide();
    }).bind('formIsValid', function() {
        $('.flash').remove();
    }).bind('formIsInvalid', function() {
        if (!$('.flash').length) {
            $('<div/>', {
                text   : 'Validation failed, please check errors below',
                'class': 'flash error'
            }).appendTo('.flash-placeholder');
        }
    }).ketchup({
        validateEvents: 'blur click change',
        createErrorContainer: function(form, el) {
            var li = el.parent(),
            span = li.find('.error');
            return span.length ? span : $('<span/>', {
                'class': 'error'
            }).appendTo(li);
        },
        showErrorContainer: function(form, el, container) {
            container.show();
        },
        hideErrorContainer: function(form, el, container) {
            container.hide();
        },
        addErrorMessages: function(form, el, container, messages) {
            container.text(messages[0]);
        }
    });
}

// Apply styling to a form within a dialog. Returns the form element
function applyDialogStyling(element) {
    var form;

    // Enable date pickers - we don't want to do this for hidden dialog content
    element.find('.dialogDate').addClass('date');

    // Enable dynamic filter options
    element.find('.add-filter').click(addMultiFilter);
    element.find('.remove-filter').click(removeMultiFilter);

    // Enable multi selects - we don't want to do this for hidden dialog content
    element.find('.dialogMulti').addClass('multi');

    // Hijack form submission via enter to click okay instead
    form = element.find('form');
    form.submit(function() {
        $(this).parents('.ui-dialog').first().find('.ui-button').first().click();
        return false;
    });

    // Delegate rest of dialog to standard method above
    applyFormStyling(element);

    return form;
}

function enableRowSelection(element) {
    if (element === undefined) {
        element = $('table');
    }
    
    // Clicking anywhere on table row jumps to link location
    element.find('tr.rowselect').click(function(){
        $('a:first', this).each(function() {
            var link = $(this);
            $.cookie('source', link.data('source'), {
                raw: true
            });
            location = link.attr('href');
        });
        return false;
    });
}


function enableColumnSorting() {
    $('a.sort, .pagination a').live('click', function() {
        var link = $(this),
        table = link.closest('table.list');
        
        // Ignore disabled pagination links
        if (link.parent().hasClass('off')) {
            return false;
        }

        $.ajax({
            url: link.attr('href'),
            cache: false,
            success: function(response) {
                var content = $(response),
                inner = content.find('table');
                table.replaceWith(inner.length ? inner : content);
                enableRowSelection();
            }
        });
    
        return false;
    });
}

function showRemoteDialog(serverUrl, title) {
    // Load the dialog contents
    $.ajax({
        url: serverUrl,
        cache: false,
        success: function(response) {
            // Create placeholder dialog element and populate
            var $dialog = $('<div/>').addClass('dialog');
            $dialog.html(response);

            // Add the dialog to the page and open it
            $('body').append($dialog);
            $dialog.dialog({
                title: title,
                width: 710,
                modal: true,
                buttons: {
                    'Okay': function() {
                        // Submit the form via ajax
                        var dialog = $(this),
                        form = dialog.find('form');
                        $.post(form.attr('action'), form.serialize(), function(data, status, xhr) {
                            // Redirect or replace form content
                            if (data.indexOf('authenticityToken') < 0) {
                                window.location = data;
                            } else {
                                form.parent().replaceWith(data);
                            }
                        });
                    },
                    'Cancel': function() {
                        $(this).dialog('close');
                    }
                },
                create: function() {
                    applyDialogStyling($(this));
                },
                beforeClose: function() {
                    // Clean up placeholder element
                    $dialog.remove();
                }
            })
        }
    });
}

function showFilterDialog() {
    var link = $(this),
    content = $('.searchForm'),
    form = content.find('form'),
    search;

    // Clone hidden form into a dialog
    var $dialog = content.clone().dialog({
        title: link.text(),
        width: 710,
        modal: true,
        buttons: {
            'Filter': function() {
                // Copy search params back to hidden form
                search.find('input,select').each(function(index, input) {
                    var $input = $(input),
                        $other = form.find('input,select').eq(index);
                    if ($input.is(':checkbox')) {
                        $other[0].checked = $input[0].checked;
                    } else {
                        $other.val($input.val());
                    }
                });


                var searchCriteria = search.serialize();
                var searchAction = search.attr('action');
                // Submit search dialog and update results
                fetchSearchResults(null, null, searchCriteria, searchAction);

                $(this).dialog('close');
            },
            'Clear': function() {
                // Clear content of search form
                search.find('input').val('');
                search.find('select').val('None');
                search.find('select').val('');


            },
            'Cancel': function() {
                $(this).dialog('close');
            }
        },
        create: function() {
            applyDialogStyling($(this));
            search = $(this).find('form');
        },
        beforeClose: function() {
            // Remove the copied dialog markup from dom
            $dialog.remove();
        }
    });
    
    return false;
}

// Add multiple filter options. Replicates current filter row and adds beneath
// filter option but changes the add button to a remove button.
function addMultiFilter() {
    var form = $('.searchForm form'),
        template = $(this).parent(),
        option = template.clone(),
        link = option.find('a'),
        backing;

    // Convert the add button into a remove button
    link.find('span').text('-');
    link.removeClass('add-filter').addClass('remove-filter');
    link.click(removeMultiFilter);

    // Add the new option after the template
    option.insertAfter(template);

    // Replicate the same option on the hidden search form
    backing = form.find('li').eq(template.index());
    option.clone().insertAfter(backing);

    return false;
}

// Remove multiple filter option added by function above.
function removeMultiFilter() {
    var form = $('.searchForm form'),
        link = $(this),
        option = link.parent(),
        index = option.index();

    // Remove option from the displayed dialog
    option.remove();

    // Keep hidden search form in sync
    form.find('li').eq(index).remove();

    return false;
}

// Build up a url including current filter and sort parameters for export and
// set this as the href for the corresponding export link, then allow default
// event handling to take place so we effectively click on a dynamically
// generated link.
function configureExport() {
    var link = $(this),
        params = $('.export-parameters'),
        count = $('.export-count').val(),
        search = $('.searchForm form'),
        url = link.data('url'),
        limit = link.data('limit'),
        role = link.data('role');
    
    //Setting the overall limit of the file as 65000 to allow for 535 rows
    //of header/footer content in the template
    var xlsLimit = 65000;
    
    //Regardless of the user's role, check the count for breaching the xls file format
    if(count && count > xlsLimit){
    	alert('Excel file row limit (65000 rows) breached.\nPlease apply a filter to reduce the number of rows and try again.');
    	return false;
    }
    
    // Check export limit if needed
    if (limit && count && count > limit) {
    	if(role != null && role == "Administrator"){
    		var res=confirm('Export limit of ' + limit + ' rows exceeded.\nThis Export may take some time.\nClick ok to continue.');
    		if(res == false){
    			return false;    			
    		}
    	} else {
    		alert('Export limit of ' + limit + ' rows exceeded. Please apply a filter to reduce the number of rows and try again.');
    		
    		return false;
    	}
    }

    if (params.length) {
        url = url + '?' + params.val();
        if (search.length) {
            url = url + '&' + search.serialize();
        }
    }
    
    link.prop('href', url);
}

// Perform a quick search based on entered search text. This also respects the
// current sort order and filters in place on the page.
function applyQuickSearch(e) {
    var event = !e ? window.event : e;
    var text = $(event.target).val();
    var resultsTable = $(event.target).attr("resultstable");
    var searchForm = $(event.target).attr("searchform");

    var search;
    if (searchForm != null && searchForm != "")
        search = $('.searchForm#'+searchForm+' form');
    else
        search = $('.searchForm form');
    
    // Apply quick search string to hidden input in filter form
    search.find('input.searchtext').val(text);
    
    // Submit search dialog and update results
    fetchSearchResults(resultsTable, searchForm, null, null);

    return false;
}

// Fetch search results using search form on page via ajax and replace table
function fetchSearchResults(resultsTable, searchForm, searchCriteria, action) {
    var serializedCriteria, finalAction;
    if(searchCriteria == null){
        var search;
        if (searchForm != null && searchForm != "")
            search = $('.searchForm#' + searchForm + ' form');
        else
            search = $('.searchForm form');
        finalAction = search.attr('action');
        serializedCriteria = search.serialize();
    } else {
        finalAction=action;
        serializedCriteria = searchCriteria;
    }

    $.ajax({
        url: finalAction,
        data: serializedCriteria,
        cache: false,
        success: function(response) {
            var results = $(response);
            var idOfReturn = resultsTable;
            var current;

            if (resultsTable != null && resultsTable != "")
                current = $('.results#' + resultsTable);
            else
                current = $('.results');

            current.replaceWith(results);
            enableRowSelection();
        }
    });
}

// Autocomplete location name
function enableLocationAutocomplete() {
    var location = $(this),
        autocomplete = location.autocomplete({
            minLength: 2,
            source: $(this).data('url'),
            focus: function(event, ui) {
                location.val(ui.item.name);
                return false;
            },
            select: function(event, ui) {
                $('#locationId').val(ui.item.id);
                location.val(ui.item.name);
                return false;
            }
        }).data('autocomplete');

    autocomplete._renderItem = function(ul, item) {
        var display = '<strong>' + item.name + '</strong> (' + item.locationType + ')';
        return $('<li></li>').data('item.autocomplete', item).append('<a>' + display + '</a>').appendTo(ul);
    };

    autocomplete._renderMenu = function(ul, items) {
        var self = this,
        currentStage = "";
        $.each(items, function(index, item) {
            if ( item.supplySystemStage != currentStage ) {
                currentStage = item.supplySystemStage;
                ul.append( "<li class='ui-autocomplete-category'>" + currentStage + "</li>" );
            }
            self._renderItem( ul, item );
        });
    };
}

// Generic autocomplete for text fields
function enableGenericAutocomplete() {
    $(this).autocomplete({
        minLength: 2,
        source: $(this).data('url')
    });
}

// Populate list of individual hazards for selected hazard
function enableHazardSelection() {
    var hazard = $(this);
    hazard.change(function() {
        $.ajax({
            url: hazard.data('url'),
            data: { id: hazard.val()},
            cache: false,
            success: function(response) {
                hazard.closest('form').find('#determinand').empty().append(response);
            }
        });
    });
}

// Populate list of control process attributes for selected process
function enableProcessSelection() {
    var process = $(this);
    process.change(function() {
        $.ajax({
            url: process.data('url'),
            data: { processId: process.val()},
            cache: false,
            success: function(response) {
                var divs = $(response),
                    form = process.closest('form');
                form.find('#attribs').html(divs.find('#attribs').html());
                form.find('#hazards').html(divs.find('#hazards').html());
                form.find('#failures').html(divs.find('#failures').html());
                form.find('#monitoring').html(divs.find('#monitoring').html());
                form.find('#verification').html(divs.find('#verification').html());
            }
        });
    });
}

// Render schematic connections
function renderSchematic() {
    var here = $('#here'),
        schematic = $('#schematic');
    
    if (here.length) {
        jsPlumb.setSuspendDrawing(true);

        $("[id^=upstream_]").each(function() {
            var upstream = $(this);
            jsPlumb.connect({
                source:upstream.prop('id'),
                target:here.prop('id')
            });
        });

        $("[id^=downstream_]").each(function() {
            var downstream = $(this);
            jsPlumb.connect({
                source:here.prop('id'),
                target:downstream.prop('id')
            });
        });

        jsPlumb.setSuspendDrawing(false, true);
    }
}

// Render graphs using Flot
function renderGraphs() {
    var graph = $('#sample-graph');

    if (graph.length) {
        var samples = graph.data('samples'),
            pcvu = graph.data('pcvu'),
            alu = graph.data('alu'),
            all = graph.data('all'),
            pcvl = graph.data('pcvl'),
            options = {
                xaxis: {
                    mode: 'time',
                    timeformat: '%d %b %y',
                    minTickSize: [1, 'day'],
                    zoomRange: [1, 100]
                },
                yaxis: {
                    zoomRange: [1, 100]
                },
                series: {
                    color: '#ff332e',
                    points: { show:false },
                    lines: { show:true },
                    threshold: [{
                        below: pcvu,
                        color: '#ee8926'
                    },{
                        below: alu,
                        color: '#4ad247'
                    },{
                        below: all,
                        color: '#ee8926'
                    },{
                        below: pcvl,
                        color: '#ff332e'
                    }]
                },
                grid: {
                    backgroundColor: {
                        colors: ['#a1c6cf', '#fff']
                    }
                },
                zoom: {
                    interactive: true
                },
                pan: {
                    interactive: true
                }
            },
            data = [];

        $.each(samples, function(index, sample) {
            data.push([sample.sampleDate, sample.measurementNumericResult]);
        });

        $.plot(graph, [data], options);
    }
}

// Configure a few keyboard shortcuts
function enableShortcuts() {
    $(document).bind('keyup', 'left', function() {
        $('table.list li.previous a').click();
    });
    $(document).bind('keyup', 'right', function() {
        $('table.list li.next a').click();
    });
}

function enableCheckboxSubmission() {

	//Update corresponding hidden input for checkboxes
    $('input[type=checkbox].option').click(function() {
	    var checked = this.checked;
	    $(this).siblings('input[type=hidden]').val(checked ? 'true' : 'false');
	});
}

function showInplacePartial(url, action) {

	if(action == 'edit') {
		$('div.inplace_content').hide();
		$('div.inplace_content_edit').show();
	}
	else if(action == 'save') {
		$('div.inplace_content').show();
		$('div.inplace_content_edit').hide();
	}
	else {
		$('div.inplace_content').show();
		$('div.inplace_content_edit').hide();
	}
}

function confirmDlg(successMethod)  {
    var link = $(this),
        content = $('#confirm-dialog');

    // Clone hidden form into a dialog
    var $dialog = content.clone().dialog({
        title: 'Remove item',
        width: 480,
        modal: true,
        buttons: {
            'Yes': function() {
            	successMethod();
                $(this).dialog('close');
            },
            'No': function() {
                $(this).dialog('close');
            }
        },
        create: function() {
            form = applyDialogStyling($(this));
        },
        beforeClose: function() {
            // Remove the copied dialog markup from dom
            $dialog.remove();
        }
    });

    return false;
}


function showConfirmBox() {
	var res=confirm('Are you Sure?  This may result in the DWSP system running more slowly for several hours.');
	if(res == false){
		return false;    			
	}
	
	return true;
}

function showConfirmDeleteAssetBox() {
	var res=confirm('Are you sure to remove this Asset from its Sample Point ?');
	if(res == false){
		return false;
	}

	return true;
}