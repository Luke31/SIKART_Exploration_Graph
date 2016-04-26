var cy = cytoscape({
  container: document.getElementById('cy'),
    
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
  ],
});


var req = new XMLHttpRequest();
req.addEventListener("load", reqListener);
req.open("GET", "http://server1102.cs.technik.fhnw.ch/json.php?t=Ort&n=200&c=GEONAME,SPRACODE");
req.send();

function reqListener () {
  var langs = new Set();
  rows = JSON.parse(this.responseText);
  cy.startBatch();
  for(r in rows) {
	  obj = rows[r];
	  cy.add({group: "nodes", data: {id:r, name:obj['GEONAME']}});
	  lang = obj['SPRACODE'];
	  if(!langs.has(lang)) {
		  langs.add(lang)
		  cy.add({group: "nodes", data: {id:lang, name:lang}});
	  }
	  cy.add({group: "edges", data: {source:r, target:lang}});	  
  }
  cy.endBatch();
  cy.elements().layout({ name: 'cose' });
}
