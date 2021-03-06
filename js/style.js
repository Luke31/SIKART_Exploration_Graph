var cy = cytoscape({
  container: document.getElementById('cy'),
  
  elements: {
    nodes: [
      { data: { id: '0'} },
      { data: { id: '1'} },
    ],
    edges: [
      { data: { source: '0', target: '1' } },
    ]
  },
  
  style: [
           {
             selector: 'node',
             style: {
               'background-color': '#000',
               'label': 'data(id)'
             }
      },
           {
             selector: 'edge',
             style: {
                  
      'width': 3,
      'target-arrow-color': '#000',
               'target-arrow-shape': 'triangle'
             }
      } 
  ],
});