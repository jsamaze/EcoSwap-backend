import { ItemModel} from "../../model/index.js";

var matchedFields = ['tags','category','condition', "itemType", "username",'traded']

export default  async (req,res,next) => {
    try {
        // by default assume that it is a listed not yet done item
        // console.log(req.query)
        // console.log(req.params)


            Object.keys(req.query).forEach(key => {
                if (! matchedFields.includes(key)){
                    res.status(400).send({
                        status:`${key} cannot be search on in item`
                    })
                    return;
                }
            });
            
            var toValidate = {...req.query};

            if (toValidate.username){
                delete toValidate.username
            }

            if (toValidate.traded){
                delete toValidate.traded
            }
            // console.log(toValidate)
            if (Object.keys(toValidate).length>0){
                try{
                    await ItemModel.validate(toValidate,Object.keys(toValidate))
                } catch(e){
                    res.status(400).send({
                        status:`Invalid input`,
                        problem:e.message
                    })
                    return;
                }
            }


            var aggregation = [
                
                {
                $addFields: {
                    lowerCaseTags: {
                    $map: {
                        input: '$tags',
                        in: { $toLower: '$$this' }
                    }
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
                $project: {
                    user: '$users',
                    itemType: 1,
                    itemName: 1,
                    description: 1,
                    category: 1,
                    condition: 1,
                    lowerCaseTags: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    tags:1,
                    photoName:1,
                    views:1,
                    done:1,
                }
                },
                {
                $project: {
                    user: {
                    email: 0,
                    password: 0,
                    photoName: 0,
                    preferredBusStop: 0,
                    emailVerified: 0,
                    __v: 0,
                    otp : 0,
                    otpValidUntil : 0,
                    about:0,
                    }
                }
                }
            ]
        

            var itemType  = req.query.itemType ?? "Listed"
            console.log(req.query)
            var traded = req.query.traded ?? "false"
            traded = (traded.toLowerCase() == "true" ) ?? false
            console.log(traded)
            aggregation.unshift({
                $match : {
                    $and : [
                        {itemType : itemType},
                        {done : {$exists : traded}}
                    ]
                }
            })
            //only perform text search when available
               if (req.params.search){
                aggregation.unshift({
                    $search: {
                    index: 'default',
                    text: {
                        query: req.params.search,
                        path: [
                        'name',
                        'desc',
                        'category',
                        'condition',
                        'tags'
                        ]
                    }
                    }
                },)
            }
            if (req.query.tags){
                req.query.lowerCaseTags = {$all : req.query.tags.map ((tag)=> tag.toLowerCase())}
                delete req.query.tags
            }

            if (req.query.username){
                req.query["user.username"]= req.query.username
                delete req.query.username
            }

            if (req.query.traded){
                delete req.query.traded
            }

            if (req.query.includeOwn){
                req.query['user.username'] = {$ne : req.session.username}
            }


            aggregation.push({
                $match: req.query
            })


            // console.log(aggregation)

            aggregation.push({
                $project : {
                    lowerCaseTags:0
                }
            })

            var result = await ItemModel.aggregate(aggregation);

           
            for (const index in result) {
                let item = result[index]
                item.photoURLs = await ItemModel.getImageURLsStatic(item.photoName);
                delete item.photoName 
              }



            res.send({
                status : "Success",
                data : result,
                aggr : aggregation
            })
        

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed retrieving item",
            problem : e.message
        })
        return;
    }


}