angular.module('frontEnd', [])
  .factory('data', ['$http', function($http) {
    return {
      getFrontEndData: function() {
        var url = 'data/front-end.json';
        return $http.get(url);
      }
    };
  }])
  .controller('frontEndCtrl', ['$scope', '$window', 'data',
    function($scope, $window, data) {
      $scope.type = 'Dendrogram';
      $scope.frontEndData = '';

      $window.addEventListener('resize', function() {
        $scope.$broadcast('windowResize');
      });

      data.getFrontEndData()
        .success(function(res) {
          if (res.error) {
            throw new Error(res.message);
          } else {
            $scope.frontEndData = res
          }
        });
    }
  ]).directive('frontEndChart', ['data','$window', function(data, $window) {

    var link = function($scope, $el, $attrs) {

      var radius = 960 / 2;

      var cluster = d3.layout.cluster()
        .size([360, radius - 120]);

      var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) {
          return [d.y, d.x / 180 * Math.PI];
        });

      var svg = d3.select($el[0]).append("svg")
        .attr("width", radius * 2)
        .attr("height", radius * 2)
        .call(
          d3.behavior.zoom().scaleExtent([0.6, 3]).on("zoom", zoom)
        );

      var g = svg.append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

      function zoom () {
         //TODO: set translate range
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")" );
      }

      var update = function() {
        if ($scope.frontEndData === '') return;

        var data = $scope.frontEndData;

        var nodes = cluster.nodes(data);

        var link = g.selectAll("path.link")
          .data(cluster.links(nodes))
          .enter().append("path")
          .attr("class", "link")
          .attr("d", diagonal);

        var node = g.selectAll("g.node")
          .data(nodes)
          .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) {
            return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
          });

        node.append("circle")
          .attr("r", 4.5);

        node.append("text")
          .attr("dy", ".31em")
          .attr("text-anchor", function(d) {
            return d.x < 180 ? "start" : "end";
          })
          .attr("transform", function(d) {
            return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
          })
          .text(function(d) {
            return d.name;
          })
          .attr("fill", "#000")
          .on("click", function(d){
              if(typeof d.url !== "undefined" ){
                $window.open(d.url, "_blank");
              }
          }).on("mouseover", function(d) {

              //Update the tooltip position and value
              d3.select("#tooltip")
                .style("left", 10 + "px")
                .style("top", 10 + "px")    
                .select("#desc")
                .text(d.description)
                
              d3.select("#name")
                .text(d.name);
 
              //Show the tooltip
              d3.select("#tooltip").classed("hidden", false);
           })
           .on("mouseout", function() {
              d3.select("#tooltip").classed("hidden", true);
           });
      };

      $scope.$watch('frontEndData', update);

    };
    return {
      template: '<div></div>',
      replace: true,
      link: link,
      restrict: 'E'
    };
  }
]);