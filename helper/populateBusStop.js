import axios from 'axios';
import { BusStopModel } from '../model/index.js';
export default async () => {
    await BusStopModel.deleteMany({})

    var response = null
    var busStop=null
    var continueAPI = true
    var skip=0;

    while (continueAPI){
        response  = await axios.get(process.env.LTA_API, {
            headers: {
                AccountKey : process.env.LTA_KEY
            },
            params:{
                "$skip":skip
            }},
        );
        console.log(response.data.value.length)
        console.log(skip)
        continueAPI= (response.data.value.length==500)
        response.data.value.forEach(async element => {
            busStop = BusStopModel({
                "BusStopCode": element.BusStopCode,
                "RoadName":element.RoadName,
                "Description": element.Description,
                loc : {
                    type : "Point",
                    coordinates : [parseFloat(element.Longitude),parseFloat(element.Latitude)]

                }
            })
            await busStop.save();
        });
        skip+=500;
    }
}