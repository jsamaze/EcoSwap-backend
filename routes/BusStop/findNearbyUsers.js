import fetchNearbyBusStops from "../../helper/busStop/fetchNearbyBusStops.js";
import { UserModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {

        if (!req.query.radiusInKm){
            throw new Error("Please specify radius in Km")
        } else if (req.query.latitude && req.query.longitude){
            var latitude = req.query.latitude
            var longitude = req.query.longitude
        }else {
            if (!req.session.username) {
              res.status(400).send({
                status:"Please login or specify a location"
              })
            }
            var userCoordinates = await UserModel.aggregate( [
                { $match: { username: req.session.username } },
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
              userCoordinates = userCoordinates[0]
              var latitude = userCoordinates.coordinates[1]
              var longitude = userCoordinates.coordinates[0]
        }


        var nearbyBusStops = await fetchNearbyBusStops(latitude,longitude,req.query.radiusInKm);
        var busStopMap = new Map();

        nearbyBusStops.forEach(e=>{
          busStopMap.set(e.BusStopCode,e)
        })
        
        var nearbyBusStopCodes = nearbyBusStops.map(e=>e.BusStopCode)
        // console.log(nearbyBusStopCodes)
        const result = await UserModel.find({
          preferredBusStop: {$in : nearbyBusStopCodes}, 
          username : {$ne : req.session.username}
        },"fullName username email preferredBusStop about photoName").lean()
        result.forEach(e=>{
          e.loc = busStopMap.get(e.preferredBusStop).loc
        })
        res.send(result)
          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed retrieving users",
            problem : e.message
        })
    }
}