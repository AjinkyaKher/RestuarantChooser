angular.module('starter.controllers', [])

.controller('FavoritesCtrl', function($scope, Restaurants) {
    var abc = Restaurants.get(1);
    console.log(abc);
    $scope.abc = abc;

    $scope.doRefresh = function() {
     console.log("Refreshing");
    var abc = Restaurants.get(1);
    console.log(abc);
    $scope.abc = abc; 
     $scope.$broadcast('scroll.refreshComplete');
    };
})

.controller('RestaurantsCtrl', function($scope, $http, $q, Restaurants) {

//Calculate distance between two coordinates
$scope.distance = []; 
function calcDistance(destination){
  var p1 = new google.maps.LatLng(destination.lat, destination.lng);
  //var p2 = new google.maps.LatLng($scope.position.latitude, $scope.position.longitude);
  var p2 = new google.maps.LatLng(33.854633, -84.358695);
  return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000 * 0.621371).toFixed(2);
}

//Get current location
// navigator.geolocation.getCurrentPosition(function(position) {
//     $scope.$apply(function() {
//         $scope.position = position.coords;

        //Call Google Places Nearby API     
        $scope.restaurants = [];
        var restaurantUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?userIp=192.168.163.63&key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&rankby=distance&types=restaurant&location=";
        //restaurantUrl = restaurantUrl + position.coords.latitude + "," + position.coords.longitude;
        restaurantUrl = restaurantUrl + "33.854633,-84.358695";
        $http.get(restaurantUrl)
        .then(function(resp) {
            $scope.nextPageToken = resp.data.next_page_token;
            console.log("Fisrt" + resp.data);
            //$scope.restaurants = resp.data.results;
            $scope.restaurants.push.apply($scope.restaurants, resp.data.results);
            for(i=0;i<resp.data.results.length;i++) {
               $scope.distance.push(calcDistance(resp.data.results[i].geometry.location) + " miles away"); 
            }
          }, function(err) {
            //alert("ERR");
            console.error('ERR', err);
            console.log(JSON.stringify(err));
          })
           // });
        // }, function(error) {
        //     console.log("error");
        //     alert("error");
        // });

  $scope.choose = function(restaurant) {
    Restaurants.choose(restaurant);
  }


  $scope.loadMore = function() {
    var restaurantUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?userIp=192.168.163.63&key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&rankby=distance&types=restaurant&location=";
        //restaurantUrl = restaurantUrl + position.coords.latitude + "," + position.coords.longitude;
        restaurantUrl = restaurantUrl + "33.854633,-84.358695";
        restaurantUrl = restaurantUrl + "&pagetoken=" + $scope.nextPageToken;
        console.log("Next:" + $scope.nextPageToken);
        $http.get(restaurantUrl)
        .then(function(resp) {
          $scope.nextPageToken = resp.data.next_page_token;
            $scope.restaurants.push.apply($scope.restaurants, resp.data.results);
            for(i=0;i<resp.data.results.length;i++) {
               $scope.distance.push(calcDistance(resp.data.results[i].geometry.location) + " miles away"); 
            }
          }, function(err) {
            //alert("ERR");
            console.error('ERR', err);
            console.log(JSON.stringify(err));
          })
      $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

})

.controller('RestaurantDetailCtrl', function($scope, $stateParams, $http, $q, $ionicModal, $ionicSlideBoxDelegate, Restaurants) {
  
  //Call Google Places Details API
  var restaurantUrl = "https://maps.googleapis.com/maps/api/place/details/json?userIp=192.168.163.63&key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&placeid=";
  restaurantUrl = restaurantUrl + $stateParams.restaurantId;
  
  $.ajax({
    dataType: 'json',
    type: 'GET',
    url: restaurantUrl,
    success: function (data) {
        $scope.restaurant = data.result;
    },
    error: function (err) {
      console.error('ERR', err);
      console.log(JSON.stringify(err));
    }
  })
  .then(function(){ 

    //Call Google Places Photos API
    $scope.photos = [];
    var photosUrlBase = "https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&maxwidth=400&maxheight=400&photoreference=";
    for(var i=0; i<$scope.restaurant.photos.length; i++)  {
      photosUrl = photosUrlBase + $scope.restaurant.photos[i].photo_reference;
      //console.log(photosUrl);
      $scope.photos.push({src:photosUrl, msg:"Image " + (i+1) + "/" + $scope.restaurant.photos.length});
    }
    //console.log($scope.aImages);

    // var photosUrlBase = "https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&maxwidth=400&photoreference=";
    // for(var i=0; i<$scope.restaurant.photos.length; i++)  {
    //   (function(i) {
    //     photosUrl = photosUrlBase + $scope.restaurant.photos[i].photo_reference;
    //      $.ajax({
    //       type: 'GET',
    //       url: photosUrl,
    //       success: function (data) {
    //         //console.log(data);
    //         photos.push(data);
    //         if(photos.length == $scope.restaurant.photos.length) {
    //           doneLoadingPhotos();
    //         }
    //       },
    //       error: function (err) {
    //         console.log("error");
    //         //console.error('ERR', err);
    //         //console.log(JSON.stringify(err));
    //     }
    //   });
    //   })(i);
    // }
});

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

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
    $scope.$on('modal.shown', function() {
      console.log('Modal is shown!');
    });

    // Call this functions if you need to manually control the slides
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
  
    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };

  // function doneLoadingPhotos() {    
  //   $scope.photos1 = photos;
  //   console.log("Done? " + $scope.photos1.length);
  //   console.log($scope.photos1[0]);
  // }

  // $http.get(restaurantUrl)
  // .then(function(resp) {
  //     $scope.restaurant = resp.data.result;      
  //   }, function(err) {
  //     console.error('ERR', err);
  //     console.log(JSON.stringify(err));
  //   })

   //Trying something
//       function firstFunction(_callback){
//       var f = (function() {
//         for (i = 0; i < 2; i++) {
//             (function(i){
//                   //Call Google Places Photos API
//                   var photosUrlBase = "https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&maxwidth=400&photoreference=";
//                   photosUrl = photosUrlBase + $scope.restaurant.photos[i].photo_reference;
//                   var x = (function() {
//                     $http.get(photosUrl)
//                       .then(function(resp) {
//                       console.log("i is: " + i);
//                       //console.log(resp);
//                       $scope.photos.push(resp.data);    
//                       console.log("$scope.photos.length: " + $scope.photos.length);    
//                       //console.log($scope.photos.length);
//                       }, function(err) {
//                         console.error('ERR', err);
//                         console.log(JSON.stringify(err));
//                       })
//                     })();
//             })(i);
//         }
//       })();
//       _callback();    
//     }

// function secondFunction(){
//     // call first function and pass in a callback function which
//     // first function runs when it has completed
//     firstFunction(function() {
//         console.log('huzzah, I\'m done!');
//         console.log("End");
//       console.log($scope.photos.length);
//     });    
// }

// secondFunction();


  // var getPhotos = function(i) {
  //     //Call Google Places Photos API
  //     var photosUrlBase = "https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&maxwidth=400&photoreference=";
  //     photosUrl = photosUrlBase + $scope.restaurant.photos[i].photo_reference;

  //     $http.get(photosUrl)
  //     .then(function(resp) {
  //       console.log("i is: "); console.log(i);
  //       //console.log(resp);
  //       $scope.photos.push(resp.data);        
  //       //console.log($scope.photos.length);
  //       }, function(err) {
  //         console.error('ERR', err);
  //         console.log(JSON.stringify(err));
  //       })
  // }
})

.controller('LoginCtrl', function($scope, $q, $ionicPopup, $state) {
 
 $scope.data = {};

 $scope.login = function() {
  console.log($scope.data.username + ", " + $scope.data.password);
  console.log(window.btoa(unescape(encodeURIComponent($scope.data.username + ':' + $scope.data.password))));
    $.ajax({
      type: 'GET',
      url: 'https://outlook.office365.com/EWS/Exchange.asmx/s/GetUserPhoto?email=' + $scope.data.username + '&size=HR64x64',
      data: {},
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(unescape(encodeURIComponent($scope.data.username + ':' + $scope.data.password))))        
      },
      success: function (data) {
          $state.go('tab.restaurants');
      },
      error: function (xhr, err, abc) {
        if(xhr.status==401) {
          var alertPopup = $ionicPopup.alert({
                    title: 'Login Failed',
                    template: 'Please check your credentials!'
                });
        }
        else
          $state.go('tab.restaurants');
      }
    }) 
  }
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

//404 - no picture but authorized
//401 - not authorized

//Working URL: https://maps.googleapis.com/maps/api/place/nearbysearch/json?userIp=192.168.163.63&key=AIzaSyAab7X5I-rkBKEy1KWRO2MM4wxsFOScD6Y&location=33.85463,-84.35870&rankby=distance&types=restaurant

