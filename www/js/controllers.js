angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('RestaurantsCtrl', function($scope, $http, $window, Chats) {

//Calculate distance between two coordinates
$scope.distance = []; 
function calcDistance(destination){
  var p1 = new google.maps.LatLng(destination.lat, destination.lng);
  var p2 = new google.maps.LatLng($scope.position.latitude, $scope.position.longitude);
  return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000 * 0.621371).toFixed(2);
}

//Get current location
$window.navigator.geolocation.getCurrentPosition(function(position) {
    $scope.$apply(function() {
        $scope.position = position.coords;

        //Call Google Places API     
        var restaurantUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?userIp=192.168.163.63&key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&rankby=distance&types=restaurant&location=";
        restaurantUrl = restaurantUrl + position.coords.latitude + "," + position.coords.longitude;
        
        $http.get(restaurantUrl)
        .then(function(resp) {
            $scope.restaurants = resp.data.results;
            for(i=0;i<resp.data.results.length;i++) {
               $scope.distance.push(calcDistance(resp.data.results[i].geometry.location) + " miles away"); 
            }            
          }, function(err) {
            console.error('ERR', err);
            console.log(JSON.stringify(err));
          })
            });
        }, function(error) {
            console.log("error");
        });

  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});


//Working URL: https://maps.googleapis.com/maps/api/place/nearbysearch/json?userIp=192.168.163.63&key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&location=33.85463,-84.35870&rankby=distance&types=restaurant

