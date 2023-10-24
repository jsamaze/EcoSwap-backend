import fetchNearbyBusStops from "../../helper/busStop/fetchNearbyBusStops.js";
import { ItemModel, UserModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {
        // code same as find nearby users
        if (!req.query.radiusInKm){
          req.query.radiusInKm=5
        } 
        if (req.query.latitude && req.query.longitude){
            var latitude = req.query.latitude 
            var longitude = req.query.longitude 
        }else {
            var userCoordinates = await UserModel.aggregate( [
                { $match: { 
                  username: req.session.username,
                  preferredBusStop : {$exists : true}
                 } },
                {
                  $lookup: {
                    from: 'busstops',
                    localField: 'preferredBusStop',
                    foreignField: 'BusStopCode',
                    as: 'preferredBusStops'
                  }
                },
                { $unwind: { path: '$preferredBusStops' } },
                {
                  $project: {
                    username: 1,
                    coordinates:
                      '$preferredBusStops.loc.coordinates'
                  }
                }
              ])
              userCoordinates = userCoordinates.length > 0 ? userCoordinates[0]  : {}
              var coordinates = userCoordinates?.coordinates ?? [103.851784,1.287953]
              var [longitude,latitude ]= coordinates
        }

        console.log(latitude,longitude)

        var nearbyBusStops = await fetchNearbyBusStops(latitude,longitude,req.query.radiusInKm);
        var nearbyBusStopCodes = nearbyBusStops.map(e=>e.BusStopCode)
        const usersNearby = await UserModel.find({
          preferredBusStop: {$in : nearbyBusStopCodes}, 
          username : {$ne : req.session.username}
        },"username")

        const usernamesNearby = usersNearby.map(e=> e.username)
        // Ingredient 1 : nearby users


        var wishListItems = await ItemModel.find({
            user : req.session.user_id,
            itemType:"WishList",
            done : {$exists : false}
        },{
            __v:0,
            user:0,
            photoName:0,
        })
        // Ingredient 2 : wish list items

        var tempResult = []
        for (const wishListItem of wishListItems){
            let recommendations = await ItemModel.aggregate([

                {
                    $search: {
                      index: 'default',
                      compound: {
                        should: [
                          {
                            text: {
                              query: wishListItem.itemName,
                              path: 'itemName'
                            }
                          },
                          {
                            text: {
                              query: wishListItem.description,
                              path: 'description'
                            }
                          },
                          {
                            text: {
                              query: wishListItem.category,
                              path: 'category',
                              score: { boost: { value: 2 } }
                            }
                          },
                          {
                            text: {
                              query: wishListItem.condition,
                              path: 'condition',
                              score: { boost: { value: 1.5 } }
                            }
                          },
                          {
                            text: {
                              query: wishListItem.tags,
                              path: 'tags'
                            }
                          }
                        ],
                        minimumShouldMatch: 1,
                        filter: [
                          {
                            text: {
                              query: 'Listed',
                              path: 'itemType'
                            }
                          }
                        ]
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'user',
                      foreignField: '_id',
                      as: 'users'
                    }
                  },
                  { $unwind: { path: '$users' } },
                  {
                    $addFields: {
                    //   score: { $meta: 'searchScore' },
                      user: '$users'
                    }
                  },
                  {
                    $project: {
                      photoName: 0,
                      __v: 0,
                      photoname: 0,
                      users: 0,
                      user: {
                        password: 0,
                        photoName: 0,
                        emailVerified: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        __v: 0
                      }
                    }
                  },
                  {
                    $match: {
                      'user.username': {
                        $in: usernamesNearby
                      }
                    }
                  },
                  { $limit: 5 }
                ])
                for (const index in recommendations) {
                  let item = recommendations[index]
                  item.photoURLs = await ItemModel.getImageURLsStatic(item.photoName);
                  delete item.photoName 
                }
            tempResult.push({
                wishListItem: wishListItem,
                recommendation : recommendations
            })
        }
        // an array with wishListItem and reccomendations (array of Listed Items)

        var ListedIdMap = new Map();

        var resultMap = new Map();

        for (const e of tempResult){

             let wishListItem = e.wishListItem;

             for (const item of e.recommendation){

                ListedIdMap.set(item._id.toString(),item)
                if(resultMap.has(item._id.toString())){
                    resultMap.get(item._id.toString()).push(wishListItem)
                } else {
                    resultMap.set(item._id.toString(),[wishListItem])
                }
             }
        }

        var result = []

        const iterator1 = resultMap[Symbol.iterator]();
        for (const item of iterator1) {
            result.push({
                listedItem : ListedIdMap.get(item[0]),
                wishListItemMatch : item[1]
            })
        }
        // result.forEach(e=>{
        //     if(e.wishListItemMatch.length >1){
        //         console.log(e)
        //     }
        // })

        res.send(result)
        return;

          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed retrieving users",
            problem : e.message
        })
        return;
    }
}