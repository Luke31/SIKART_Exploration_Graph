$(function(){
  initCy();

  var layoutPadding = 50;
  var layoutDuration = 500;
  
  var infoTemplateExhibition = Handlebars.compile([
    '<p class="ac-name">Ausstellung: {{name}}</p>',
    '<p class="ac-text">Anzahl Künstler: {{ExhibitionSize}}</p>',
    '<p class="ac-text">Ort: {{Ort}}</p>'
  ].join(''));
  var infoTemplateArtist = Handlebars.compile([
    '<p class="ac-name">Künstler: {{firstname}} {{name}}</p>',
    '<p class="ac-text">{{Lebensdaten}}</p>',
    '<p class="ac-text">{{vita}}</p>',
    '<p class="ac-text">Geschlecht: {{Geschlecht}}</p>', 
    '<p class="ac-text">Bewertung: {{Rating}}</p>'
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
      /*cy.$('.highlighted').forEach(function(n){
        n.animate({
          position: n.data('orgPos')
        });
      });*/
      resetDefaultStyle();
      
      cy.elements().removeClass('highlighted').removeClass('faded');
    });
  }

  function showNodeInfo( node ){
    if(node.data().NodeType == 'Artist'){
      $('#infoArtist').html( infoTemplateArtist( node.data() ) ).show();
    }else{
      $('#infoExhibition').html( infoTemplateExhibition( node.data() ) ).show();
    }
  }
  
  function hideNodeInfo(){
    $('.info').hide();
  }

  function resetDefaultStyle(){

      cy.elements().layout({
        name: 'concentric',
        animate: true,
        animationDuration: layoutDuration
        //nodeRepulsion       : function( node ){ return 40000000; },
        //gravity             : 10,
      }); //cose, concentric, breadthfirst
  }
  
  function loadingFinished(){
      resetDefaultStyle();
      console.log('finished loading Ausstellungen/persons');
  }

  function loadData(){
    var artists = new Map();
    var ausstellungen = new Set();
    $.getJSON("data.json", function(json) {
      cy.startBatch();
      json.persons.forEach(function(artist){
        if(!artists.has(artist.HAUPTNR)) { //Only add non-existing artists, but with ausstellung
          artists.set(artist.HAUPTNR, artist);
        }
      });

      json.exhibitions.forEach(function(aus){
        if(!ausstellungen.has(aus.HAUPTNR) && aus.ARTISTS.length > 10 && aus.ARTISTS.length < 20) { //Only add non-existing ausstellung    ---  && aus.MONAT == '3' && aus.TAG < '10'
          ausstellungen.add(aus.HAUPTNR);
          cy.add({group: "nodes", data: {id:aus.HAUPTNR, name:aus.AUSST_TITEL, NodeType:'Exhibition', ExhibitionSize:aus.ARTISTS.length, Ort: aus.AUSST_ORT}});
          aus.ARTISTS.forEach(function(artistHauptNr){
            if(artists.has(artistHauptNr)) { //Only add edge, if src is really available
              artist = artists.get(artistHauptNr);
              cy.add({group: "nodes", data: {id:artist.HAUPTNR, name:artist.NAME, firstname: artist.VORNAME, NodeType:'Artist', Geschlecht:artist.GESCHLECHT, Lebensdaten:artist.LEBENSDATEN, vita:artist.VITAZEILE, Rating:artist.RATING}});
              cy.add({group: "edges", data: {source:artistHauptNr, target:aus.HAUPTNR, interaction:'cc'}});
            }
          });
        }
      });

      cy.endBatch();
    }).then(loadingFinished);
  }
  
  function initCy(){



    var styleJson = null;
    $.get('nodeStyle.cycss', function(data) {
      //cy.style = data;

      var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),
        style: data,
        layout: { name: 'concentric', padding: layoutPadding },
        motionBlur: true,
        selectionType: 'single',
        boxSelectionEnabled: false,
        autoungrabify: true,
      //style: [
      //  {
      //    selector: 'node',
      //    style: {
      //      'color': 'white',
      //      'background-color': '#666',
      //      'label': 'data(name)'
      //    }
      //  },
      //  {
      //    selector: 'edge',
      //    style: {
      //      'width': 3,
      //      'target-arrow-color': '#ccc',
      //      'target-arrow-shape': 'triangle'
      //    }
      //  }
      //]
    });

      loadData();

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
    });



  }
});