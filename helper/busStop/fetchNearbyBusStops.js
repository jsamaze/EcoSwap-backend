import { BusStopModel } from "../../model/index.js"

export default async (latitude,longitude,radiusInKm) => {
    var result = await BusStopModel.find({
        loc: {
           $geoWithin: {
              $centerSphere: [
                 [ longitude, latitude ],
                 radiusInKm / 6378.1
              ]
           }
        }
     } )

     return result;
    
}