$(function(){
  initCy();

  var layoutPadding = 50;
  var layoutDuration = 500;
  
  var infoTemplate = Handlebars.compile([
    '<p class="ac-name">{{name}}</p>',
    '<p class="ac-node-type"><i class="fa fa-info-circle"></i> {{NodeTypeFormatted}} {{#if Type}}({{Type}}){{/if}}</p>',
    '{{#if Milk}}<p class="ac-milk"><i class="fa fa-angle-double-right"></i> {{Milk}}</p>{{/if}}',
    '{{#if Country}}<p class="ac-country"><i class="fa fa-map-marker"></i> {{Country}}</p>{{/if}}',
    '<p class="ac-more"><i class="fa fa-external-link"></i> <a target="_blank" href="https://duckduckgo.com/?q={{name}}">More information</a></p>'
  ].join(''));
  
  function highlight( node ){
    var nhood = node.closedNeighborhood();

    cy.batch(function(){
      cy.elements().not( nhood ).removeClass('highlighted').addClass('faded');
      nhood.removeClass('faded').addClass('highlighted');
      
      var npos = node.position();
      var w = window.innerWidth;
      var h = window.innerHeight;
      
      cy.stop().animate({
        fit: {
          eles: cy.elements(),
          padding: layoutPadding
        }
      }, {
        duration: layoutDuration
      }).delay( layoutDuration, function(){
        nhood.layout({
          name: 'concentric',
          padding: layoutPadding,
          animate: true,
          animationDuration: layoutDuration,
          boundingBox: {
            x1: npos.x - w/2,
            x2: npos.x + w/2,
            y1: npos.y - w/2,
            y2: npos.y + w/2
          },
          fit: true,
          concentric: function( n ){
            if( node.id() === n.id() ){
              return 2;
            } else {
              return 1;
            }
          },
          levelWidth: function(){
            return 1;
          }
        });
      } );
      
    });
  }

  function clear(){
    cy.batch(function(){
      cy.$('.highlighted').forEach(function(n){
        n.animate({
          position: n.data('orgPos')
        });
      });
      
      cy.elements().removeClass('highlighted').removeClass('faded');
    });
  }

  function showNodeInfo( node ){
    $('#info').html( infoTemplate( node.data() ) ).show();
  }
  
  function hideNodeInfo(){
    $('#info').hide();
  }
  
  function loadingFinished(){
      cy.elements().layout({ name: 'cose' }); //cose, concentric
      console.log('finished loading Ausstellungen/persons');
  }
  
  function initCy(){
      
    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      //layout: { name: 'concentric', padding: layoutPadding },
      //motionBlur: true,
      //selectionType: 'single',
      //boxSelectionEnabled: false,
      //autoungrabify: true,
      style: [
               {
                 selector: 'node',
                 style: {
                   'color': 'white',
                   'background-color': '#666',
                   'label': 'data(name)'
                 }
          },
               {
                 selector: 'edge',
                 style: {      
                     'width': 3,
                     'target-arrow-color': '#ccc',
                     'target-arrow-shape': 'triangle'
                 }
          } 
      ]
    });
    var artists = new Set();
    var ausstellungen = new Set();
    $.getJSON("data.json", function(json) {
      cy.startBatch();
      json.persons.forEach(function(artist){
        if(!artists.has(artist.HAUPTNR)) { //Only add non-existing ausstellung
            artists.add(artist.HAUPTNR);
            cy.add({group: "nodes", data: {id:artist.HAUPTNR, name:artist.NAME}});
        }
      });
      
      json.exhibitions.forEach(function(aus){
            if(!ausstellungen.has(aus.HAUPTNR) && aus.MONAT == '3') { //Only add non-existing ausstellung
                ausstellungen.add(aus.HAUPTNR);
                cy.add({group: "nodes", data: {id:aus.HAUPTNR, name:aus.AUSST_TITEL}});
                aus.ARTISTS.forEach(function(artistHauptNr){
                  if(artists.has(artistHauptNr)) { //Only add edge, if src is really available
                    cy.add({group: "edges", data: {source:artistHauptNr, target:aus.HAUPTNR}});
                  }          
                });
            }
          });
      
      cy.endBatch();
    }).then(loadingFinished);
    
    cy.on('free', 'node', function( e ){
      var n = e.cyTarget;
      var p = n.position();
      
      n.data('orgPos', {
        x: p.x,
        y: p.y
      });
    });
    
    cy.on('tap', function(){
      $('#search').blur();
    });

    cy.on('select', 'node', function(e){
      var node = this;

      highlight( node );
      showNodeInfo( node );
    });

    cy.on('unselect', 'node', function(e){
      var node = this;

      clear();
      hideNodeInfo();
    });

  }
});