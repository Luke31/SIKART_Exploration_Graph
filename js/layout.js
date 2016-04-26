var cy = cytoscape({
  container: document.getElementById('cy'),
  
  elements: {
    nodes: [
      { data: { id: '0'} },
      { data: { id: '1'} },
      { data: { id: '2'} },
      { data: { id: '3'} },
      { data: { id: '4'} },
      { data: { id: '5'} },
      { data: { id: '6'} },
      { data: { id: '7'} },
    ],
    edges: [
      { data: { source: '0', target: '1' } },
      { data: { source: '1', target: '2' } },
      { data: { source: '2', target: '3' } },
      { data: { source: '3', target: '4' } },
      { data: { source: '4', target: '5' } },
      { data: { source: '5', target: '6' } },
      { data: { source: '6', target: '7' } },
      { data: { source: '7', target: '0' } },
    ]
  },
  
  style: [
           {
             selector: 'node',
             style: {
               'background-color': '#666',
               'label': 'data(id)'
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
  
  layout: {
	     name: 'circle',
  }
});