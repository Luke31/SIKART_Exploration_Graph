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
  
  function initCy(){
      
    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      layout: { name: 'concentric', padding: layoutPadding },
      motionBlur: true,
      selectionType: 'single',
      boxSelectionEnabled: false,
      autoungrabify: true,
      style: [
               {
                 selector: 'node',
                 style: {
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
    $.getJSON("ausstellungen.json", function(json) {
      console.log(json); // this will show the info it in firebug console
      cy.startBatch();
      json.forEach(function(aus){
        cy.add({group: "nodes", data: {id:aus.HAUPTNR, name:aus.AUSST_TITEL}});
      });
      cy.endBatch();
    });
    
    $.getJSON("artists.json", function(json) {
      console.log(json); // this will show the info it in firebug console
      cy.startBatch();
      json.forEach(function(artist){
        cy.add({group: "nodes", data: {id:artist.HAUPTNR, name:artist.NAME}});
        artist.ausstellungen.forEach(function(aus){
          cy.add({group: "edges", data: {source:artist.HAUPTNR, target:aus.HAUPTNR}});	  
        });
      });
      cy.endBatch();
    });
    
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