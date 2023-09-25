import { Schema } from "mongoose";

export let ListedItemSchema = new Schema ({
    itemName : {
        type : String,
        trim: true,
        required: true,
    },
    user : {
        type : 'ObjectId',
        ref : 'user',
        required : true,
    },
    description :  {
        type: String,
        trim: true, 
    },
    category : {
        type:String,
        required:true,
        enum:{
            values : ['Electronics','Fashion','Furniture','Kitchenware'],
            message : "Invalid category"
        }
    },
    condition : {
        type:String,
        required:true,
        enum:{
            values : ['new','old'],
            message : "Invalid condition"
        }
    },

    tags : {
        type:[String],
        trim:true,
    },

    photoName : {
        type:[String],
        trim:true,
        validate: {
            validator: (pictures) => pictures.length <=5,
            message: 'you cannot have more than 5 pictures'
          }
    },
    fulfilled_on : {
        type : Date
    },
    views : {
        type: Number,
        default:0
    }
},
{
    methods:{
        async getImageURLs(){
            var result = await Promise.all(
                this.photoName.map(async photoName=>{
                    return await s3.getSignedUrl('getObject',{
                        Bucket:"ecoswap",
                        Key:this.photoName
                    })
                })
            ) 
            return result
            }
        },
    timestamps:true
})

//add a method to retrieve image path