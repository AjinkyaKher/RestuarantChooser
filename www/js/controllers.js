angular.module('starter.controllers', [])

.controller('FavoritesCtrl', function($scope, $q, Restaurants) {

    Restaurants.get().then(function(favorites) {
        $scope.favorites = favorites;
    });

    $scope.doRefresh = function() {
      Restaurants.get().then(function(favorites) {
        $scope.favorites = favorites;
      });
      $scope.$broadcast('scroll.refreshComplete');
    };
})

.controller('RestaurantsCtrl', function($scope, $http, $q, $ionicLoading, Restaurants) {

  restaurants = [];
  distance = []; 

   $ionicLoading.show({
      templateUrl: "/templates/spinner.html"
    });

  //Calculate distance between two coordinates
  function calcDistance(destination){
    var p1 = new google.maps.LatLng(destination.A, destination.F);
    var p2 = new google.maps.LatLng($scope.position.latitude, $scope.position.longitude);
    return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000 * 0.621371).toFixed(2);
  }

  //Get current location
  navigator.geolocation.getCurrentPosition(function(position) {
    // $scope.$apply(function() {

      $scope.position = position.coords;
      console.log("Position:");
      console.log(position.coords.longitude);
      var map;
      var service;
      var infowindow;

      //Slalom ATL location: 33.85, -84.35
      //PlaceService.nearBySearch
      var currLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map = new google.maps.Map(document.getElementById('map'));
      var request = {
        location: currLocation,
        //radius: '1000',
        types: ['restaurant'],
        rankBy: google.maps.places.RankBy.DISTANCE
      };
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);

      function callback(results, status, pagination) {
        console.log("Here!");
          if (status != google.maps.places.PlacesServiceStatus.OK) {
            console.log("NOO");
            console.log(status);
            return;
          }
          for(i=0;i<1;i++) {
            for (var i = 0; i < results.length; i++) {
              restaurants.push(results[i]);
              distance.push(calcDistance(results[i].geometry.location) + " miles away"); 
            }
            if(!pagination.hasNextPage) {
              $scope.$apply(function() {
                $scope.restaurants = restaurants;
                $scope.distance = distance;
                 $ionicLoading.hide();
              });
              break;
            }
            pagination.nextPage();
          }
        }
      // });
    }, function(error) {
      console.log("error");
      console.log(JSON.stringify(error));
  });
 
  $scope.choose = function(restaurant) {
    console.log("Data");
    console.log($scope.data);
    Restaurants.choose(restaurant);
  }
})

.controller('RestaurantDetailCtrl', function($scope, $stateParams, $http, $q, $ionicModal, $ionicSlideBoxDelegate, Restaurants) {

  //PlaceService.getDetails
  var request = {
    placeId: $stateParams.restaurantId
  };
  map = new google.maps.Map(document.getElementById('map'));
  service = new google.maps.places.PlacesService(map);
  service.getDetails(request, callback);
  photos = [];

  function callback(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      $scope.restaurant = place;
      for(i=0; i<place.photos.length; i++) {
        src = place.photos[i].getUrl({'maxWidth': 400, 'maxHeight': 400});
        msg = "Image " + (i+1) + "/" + place.photos.length;
        photos.push({src:src,msg:msg});
      }
      $scope.$apply(function() {
        $scope.photos = photos;
      });
    }
  }

  //Image pop handling stuff
  $ionicModal.fromTemplateUrl('image-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $ionicSlideBoxDelegate.slide(0);
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
  
    $scope.$on('modal.hide', function() {
      
    });
  
    $scope.$on('modal.removed', function() {
      
    });
    $scope.$on('modal.shown', function() {
      console.log('Modal is shown!');
    });

    
    $scope.next = function() {
      $ionicSlideBoxDelegate.next();
    };
  
    $scope.previous = function() {
      $ionicSlideBoxDelegate.previous();
    };
  
    $scope.goToSlide = function(index) {
      $scope.modal.show();
      $ionicSlideBoxDelegate.slide(index);
    }
  
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };
})

.controller('LoginCtrl', function($scope, $q, $ionicPopup, $state, Restaurants) {
 
 $scope.data = {};
 
 $scope.login = function() {
  alert("ok");
    $.ajax({
      type: 'GET',
      url: 'https://outlook.office365.com/EWS/Exchange.asmx/s/GetUserPhoto?email=' + $scope.data.username + '&size=HR64x64',
      data: {},
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(unescape(encodeURIComponent($scope.data.username + ':' + $scope.data.password))));        
        //console.log(url);
      },
      success: function (data) {
        alert("duh");
        console.log("Duh");
          Restaurants.saveCurrentSessionInfo($scope.data, data);
          $state.go('tab.restaurants');
      },
      error: function (xhr, err, abc) {
        alert("failed");
        console.log("Failed!");
        console.log(JSON.stringify(err));
        alert(JSON.stringify(err));
        console.log(xhr.status);
        //console.log(url);
        if(xhr.status==401) {
          var alertPopup = $ionicPopup.alert({
                    title: 'Login Failed',
                    templateUrl: '/templates/login-error.html'
                });
        }
        else
          $state.go('tab.restaurants');
      }
    })     
  }
})



//404 - no picture but authorized
//401 - not authorized

//Working URL: https://maps.googleapis.com/maps/api/place/nearbysearch/json?userIp=192.168.163.63&key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&location=33.85463,-84.35870&rankby=distance&types=restaurant

